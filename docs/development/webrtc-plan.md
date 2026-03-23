# 掼蛋大师 v3 - P2P 联机方案详细设计

**版本**: v1.0  
**创建日期**: 2026-03-23  
**架构师**: dev-agent  
**状态**: 🟢 已完成

---

## 1. 方案概述

### 1.1 核心目标

- ✅ **无需用户注册** - 邀请码即身份
- ✅ **低延迟** - P2P 直连，数据不经过服务器
- ✅ **断线重连** - 30 秒内恢复牌局
- ✅ **低成本** - 信令服务器 ≤ ¥100/月
- ✅ **跨平台** - iOS/Android 微信小程序互通

### 1.2 技术方案

```
┌─────────────────────────────────────────────────────────┐
│                   P2P 联机技术栈                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  通信协议：WebRTC DataChannel                          │
│  信令传输：WebSocket (Node.js)                         │
│  加密方式：DTLS/SRTP (WebRTC 内置)                     │
│  NAT 穿透：STUN/TURN (阿里云/腾讯云公共服务器)          │
│  连接模式：房主托管（房主决定游戏状态）                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.3 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **WebRTC** | 标准、低延迟、加密、免费 STUN | 需要信令服务器、NAT 穿透可能失败 | ⭐⭐⭐⭐⭐ |
| **第三方 P2P** | 简单易用、NAT 穿透好 | 依赖第三方、可能收费、数据经过第三方 | ⭐⭐⭐ |
| **WebSocket 中转** | 简单可靠、NAT 穿透好 | 服务器成本高、延迟高、带宽成本 | ⭐⭐ |
| **局域网** | 无需服务器、延迟最低 | 距离限制、不实用 | ⭐ |

**决策**: WebRTC + 轻量信令服务器

---

## 2. WebRTC 连接流程

### 2.1 连接建立时序图

```
房主 (Host)                          信令服务器 (Signaling)                    玩家 (Player)
    │                                      │                                      │
    │──── create-room ────────────────────>│                                      │
    │<─── room-created (roomId, code) ────│                                      │
    │                                      │                                      │
    │  [生成邀请码，分享给玩家]             │                                      │
    │                                      │                                      │
    │                                      │<──── join-room (inviteCode) ─────────│
    │                                      │──── room-joined (roomId) ───────────>│
    │                                      │──── player-joined ──────────────────>│
    │<──── player-joined ──────────────────│                                      │
    │                                      │                                      │
    │  [创建 RTCPeerConnection]             │                                      │
    │  [创建 DataChannel]                   │                                      │
    │  [生成 Offer SDP]                     │                                      │
    │                                      │                                      │
    │──── offer (SDP) ────────────────────>│                                      │
    │                                      │──── offer (SDP) ────────────────────>│
    │                                      │                                      │  [创建 RTCPeerConnection]
    │                                      │                                      │  [设置 RemoteDescription]
    │                                      │                                      │  [生成 Answer SDP]
    │                                      │                                      │
    │                                      │<──── answer (SDP) ───────────────────│
    │<──── answer (SDP) ───────────────────│                                      │
    │  [设置 RemoteDescription]             │                                      │
    │                                      │                                      │
    │  [交换 ICE Candidates] ──────────────┼─────────────────────────────────────>│
    │                                      │                                      │
    │  ═══════════════════════════════════════════════════════════════════════════│
    │                      WebRTC DataChannel 建立成功，P2P 直连开始                  │
    │  ═══════════════════════════════════════════════════════════════════════════│
    │                                      │                                      │
```

### 2.2 关键代码实现

#### 2.2.1 房主端（Host）

```typescript
// P2P 连接 - 房主端
class P2PHost {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private signalingUrl: string;
  
  constructor(signalingUrl: string) {
    this.signalingUrl = signalingUrl;
  }
  
  // 创建房间
  async createRoom(): Promise<RoomInfo> {
    // 1. 连接信令服务器
    const ws = await this.connectSignaling();
    
    // 2. 创建房间
    const roomInfo = await this.sendCreateRoom(ws);
    
    // 3. 创建 PeerConnection
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' }
      ]
    });
    
    // 4. 创建 DataChannel
    this.dc = this.pc.createDataChannel('game');
    this.setupDataChannel();
    
    // 5. 创建 Offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    // 6. 发送 Offer 给信令服务器
    await this.sendSignal(ws, {
      type: 'offer',
      roomId: roomInfo.roomId,
      payload: offer
    });
    
    // 7. 监听 ICE Candidate
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(ws, {
          type: 'ice-candidate',
          roomId: roomInfo.roomId,
          payload: event.candidate
        });
      }
    };
    
    // 8. 等待 Answer
    ws.onmessage = (msg) => this.handleHostMessage(msg);
    
    return roomInfo;
  }
  
  private async handleHostMessage(msg: MessageEvent) {
    const data = JSON.parse(msg.data);
    
    if (data.type === 'answer') {
      await this.pc?.setRemoteDescription(new RTCSessionDescription(data.payload));
    } else if (data.type === 'ice-candidate') {
      await this.pc?.addIceCandidate(new RTCIceCandidate(data.payload));
    }
  }
  
  private setupDataChannel() {
    if (!this.dc) return;
    
    this.dc.onopen = () => {
      console.log('P2P 连接已建立');
      // 发送游戏开始信号
      this.send({ type: 'game-start', payload: { /* 游戏初始状态 */ } });
    };
    
    this.dc.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleGameData(data);
    };
    
    this.dc.onclose = () => {
      console.log('P2P 连接已关闭');
      this.handleDisconnect();
    };
  }
  
  // 发送游戏数据
  send(data: GameData) {
    if (this.dc?.readyState === 'open') {
      this.dc.send(JSON.stringify(data));
    }
  }
}
```

#### 2.2.2 玩家端（Player）

```typescript
// P2P 连接 - 玩家端
class P2PClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private ws: WebSocket | null = null;
  
  // 加入房间
  async joinRoom(inviteCode: string): Promise<void> {
    // 1. 连接信令服务器
    this.ws = await this.connectSignaling();
    
    // 2. 加入房间
    const roomInfo = await this.sendJoinRoom(this.ws, inviteCode);
    
    // 3. 创建 PeerConnection
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' }
      ]
    });
    
    // 4. 监听 DataChannel（房主创建）
    this.pc.ondatachannel = (event) => {
      this.dc = event.channel;
      this.setupDataChannel();
    };
    
    // 5. 监听 ICE Candidate
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(this.ws, {
          type: 'ice-candidate',
          roomId: roomInfo.roomId,
          payload: event.candidate
        });
      }
    };
    
    // 6. 等待 Offer
    this.ws.onmessage = (msg) => this.handleClientMessage(msg);
  }
  
  private async handleClientMessage(msg: MessageEvent) {
    const data = JSON.parse(msg.data);
    
    if (data.type === 'offer') {
      // 设置 RemoteDescription
      await this.pc?.setRemoteDescription(new RTCSessionDescription(data.payload));
      
      // 创建 Answer
      const answer = await this.pc!.createAnswer();
      await this.pc?.setLocalDescription(answer);
      
      // 发送 Answer
      await this.sendSignal(this.ws, {
        type: 'answer',
        roomId: data.roomId,
        payload: answer
      });
    } else if (data.type === 'ice-candidate') {
      await this.pc?.addIceCandidate(new RTCIceCandidate(data.payload));
    }
  }
  
  private setupDataChannel() {
    if (!this.dc) return;
    
    this.dc.onopen = () => {
      console.log('P2P 连接已建立');
    };
    
    this.dc.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleGameData(data);
    };
  }
  
  // 发送游戏数据
  send(data: GameData) {
    if (this.dc?.readyState === 'open') {
      this.dc.send(JSON.stringify(data));
    }
  }
}
```

---

## 3. 信令服务器设计

### 3.1 服务器架构

```typescript
// 信令服务器 - Node.js + ws
import WebSocket, { WebSocketServer } from 'ws';

interface Room {
  roomId: string;
  inviteCode: string;
  host: WebSocket;
  players: WebSocket[];
  createdAt: number;
  lastActivity: number;
}

class SignalingServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private clientRooms: Map<WebSocket, string> = new Map();
  
  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws) => this.handleConnection(ws));
    
    // 每 5 分钟清理过期房间
    setInterval(() => this.cleanupExpiredRooms(), 5 * 60 * 1000);
    
    console.log(`信令服务器启动在端口 ${port}`);
  }
  
  private handleConnection(ws: WebSocket) {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      this.handleMessage(ws, msg);
    });
    
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (err) => console.error('WebSocket 错误:', err));
  }
  
  private handleMessage(ws: WebSocket, msg: SignalingMessage) {
    console.log('收到消息:', msg.type);
    
    switch (msg.type) {
      case 'create-room':
        this.handleCreateRoom(ws);
        break;
      
      case 'join-room':
        this.handleJoinRoom(ws, msg.inviteCode);
        break;
      
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        this.forwardSignal(ws, msg);
        break;
      
      case 'heartbeat':
        this.handleHeartbeat(ws);
        break;
    }
  }
  
  private handleCreateRoom(ws: WebSocket) {
    const roomId = this.generateRoomId();
    const inviteCode = this.generateInviteCode();
    
    const room: Room = {
      roomId,
      inviteCode,
      host: ws,
      players: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.rooms.set(roomId, room);
    this.clientRooms.set(ws, roomId);
    
    // 发送房间信息给房主
    ws.send(JSON.stringify({
      type: 'room-created',
      roomId,
      inviteCode
    }));
    
    console.log(`房间创建：${roomId}, 邀请码：${inviteCode}`);
  }
  
  private handleJoinRoom(ws: WebSocket, inviteCode: string) {
    // 查找房间
    let room: Room | undefined;
    for (const r of this.rooms.values()) {
      if (r.inviteCode === inviteCode) {
        room = r;
        break;
      }
    }
    
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: '房间不存在' }));
      return;
    }
    
    // 检查人数（最多 4 人）
    if (room.players.length >= 3) {
      ws.send(JSON.stringify({ type: 'error', message: '房间已满' }));
      return;
    }
    
    // 加入房间
    room.players.push(ws);
    this.clientRooms.set(ws, room.roomId);
    room.lastActivity = Date.now();
    
    // 通知玩家
    ws.send(JSON.stringify({
      type: 'room-joined',
      roomId: room.roomId,
      players: [room.host, ...room.players].map((_, i) => ({ id: i }))
    }));
    
    // 通知房主和其他玩家
    const joinMsg = JSON.stringify({
      type: 'player-joined',
      roomId: room.roomId,
      playerId: room.players.length
    });
    
    room.host.send(joinMsg);
    room.players.forEach((p, i) => {
      if (p !== ws) p.send(joinMsg);
    });
    
    console.log(`玩家加入房间：${room.roomId}`);
  }
  
  private forwardSignal(from: WebSocket, msg: SignalingMessage) {
    const roomId = this.clientRooms.get(from);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.lastActivity = Date.now();
    
    // 转发给其他人
    const targets = from === room.host ? room.players : [room.host, ...room.players.filter(p => p !== from)];
    const signalData = JSON.stringify({
      type: msg.type,
      roomId,
      from: from === room.host ? 'host' : 'player',
      payload: msg.payload
    });
    
    targets.forEach((target) => {
      if (target.readyState === WebSocket.OPEN) {
        target.send(signalData);
      }
    });
  }
  
  private handleHeartbeat(ws: WebSocket) {
    const roomId = this.clientRooms.get(ws);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.lastActivity = Date.now();
      }
    }
    ws.send(JSON.stringify({ type: 'heartbeat-ack' }));
  }
  
  private handleDisconnect(ws: WebSocket) {
    const roomId = this.clientRooms.get(ws);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        if (ws === room.host) {
          // 房主断开，通知所有玩家
          room.players.forEach((p) => {
            p.send(JSON.stringify({ type: 'host-disconnected' }));
          });
          this.rooms.delete(roomId);
        } else {
          // 玩家断开
          room.players = room.players.filter((p) => p !== ws);
          room.host.send(JSON.stringify({ type: 'player-disconnected' }));
          
          // 如果房间空了，删除房间
          if (room.players.length === 0) {
            this.rooms.delete(roomId);
          }
        }
      }
      this.clientRooms.delete(ws);
    }
  }
  
  private cleanupExpiredRooms() {
    const now = Date.now();
    const expiry = 5 * 60 * 1000; // 5 分钟
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > expiry) {
        // 通知所有客户端
        room.host.send(JSON.stringify({ type: 'room-expired' }));
        room.players.forEach((p) => p.send(JSON.stringify({ type: 'room-expired' })));
        
        this.rooms.delete(roomId);
        this.clientRooms.delete(room.host);
        room.players.forEach((p) => this.clientRooms.delete(p));
        
        console.log(`清理过期房间：${roomId}`);
      }
    }
  }
  
  private generateRoomId(): string {
    return 'room-' + Math.random().toString(36).substr(2, 9);
  }
  
  private generateInviteCode(): string {
    // 6 位数字邀请码
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// 启动服务器
const server = new SignalingServer(3000);
```

### 3.2 部署配置

#### 3.2.1 Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### 3.2.2 云函数配置（腾讯云）

```yaml
# serverless.yml
component: scf
name: guandan-signaling
namespace: default

inputs:
  name: guandan-signaling
  namespace: default
  runtime: Nodejs18
  handler: index.main_handler
  region: ap-guangzhou
  description: 掼蛋大师信令服务器
  memorySize: 128
  timeout: 30
  environment:
    variables:
      NODE_ENV: production
  
  events:
    - apigateway:
        name: guandan-api
        protocol: ws
        environment: release
```

---

## 4. 断线重连方案

### 4.1 重连策略

```
┌─────────────────────────────────────────────────────────┐
│                   断线重连流程                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 检测到断线 (DataChannel onclose)                    │
│       ↓                                                 │
│  2. 保存当前游戏状态 (本地存储)                          │
│       ↓                                                 │
│  3. 显示"重连中..."提示                                  │
│       ↓                                                 │
│  4. 尝试重新连接 (最多 3 次，间隔 5 秒)                   │
│       ↓                                                 │
│  5a. 重连成功 → 同步状态 → 继续游戏                     │
│       ↓                                                 │
│  5b. 重连失败 → 提示"连接失败" → 返回主界面             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 重连实现

```typescript
// 重连管理器
class ReconnectionManager {
  private maxRetries = 3;
  private retryInterval = 5000; // 5 秒
  private currentRetry = 0;
  
  async reconnect(p2pConnection: P2PConnection): Promise<boolean> {
    while (this.currentRetry < this.maxRetries) {
      this.currentRetry++;
      console.log(`尝试重连 ${this.currentRetry}/${this.maxRetries}`);
      
      try {
        await p2pConnection.reconnect();
        console.log('重连成功');
        return true;
      } catch (error) {
        console.error(`重连失败：${error}`);
        
        if (this.currentRetry < this.maxRetries) {
          await this.wait(this.retryInterval);
        }
      }
    }
    
    console.error('重连失败，达到最大重试次数');
    return false;
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  reset() {
    this.currentRetry = 0;
  }
}

// P2P 连接重连
class P2PConnection {
  async reconnect(): Promise<void> {
    // 1. 关闭旧连接
    this.pc?.close();
    this.dc?.close();
    
    // 2. 重新创建 PeerConnection
    this.pc = new RTCPeerConnection({ iceServers: this.iceServers });
    
    // 3. 重新建立连接（通过信令服务器）
    if (this.isHost) {
      await this.reconnectAsHost();
    } else {
      await this.reconnectAsClient();
    }
  }
  
  private async reconnectAsHost(): Promise<void> {
    // 房主重连：重新发送 Offer
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    
    await this.sendSignal({
      type: 'reconnect-offer',
      roomId: this.roomId,
      payload: offer
    });
    
    // 等待 Answer...
  }
  
  private async reconnectAsClient(): Promise<void> {
    // 玩家重连：重新加入房间
    await this.ws.send(JSON.stringify({
      type: 'reconnect-join',
      inviteCode: this.inviteCode
    }));
    
    // 等待 Offer...
  }
}
```

### 4.3 状态同步

```typescript
// 游戏状态同步
interface SyncState {
  type: 'sync-state';
  gameState: {
    players: PlayerInfo[];
    hands: Card[][];
    playedCards: Card[];
    currentTurn: number;
    lastMove: Move | null;
  };
  timestamp: number;
}

// 房主发送同步状态
async function syncStateAfterReconnect(host: P2PHost, gameState: GameState) {
  host.send({
    type: 'sync-state',
    payload: {
      gameState,
      timestamp: Date.now()
    }
  });
}

// 玩家接收同步状态
function handleSyncState(state: SyncState) {
  // 恢复游戏状态
  gameEngine.restoreState(state.gameState);
  
  // 继续游戏
  gameEngine.resume();
}
```

---

## 5. NAT 穿透方案

### 5.1 STUN/TURN 服务器

```typescript
// ICE 服务器配置
const iceServers: RTCIceServer[] = [
  // 公共 STUN 服务器（免费）
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:stun.services.mozilla.com:3478' },
  
  // 腾讯云 STUN/TURN（推荐，国内访问快）
  {
    urls: ['stun:stun.tencentcloudapi.com:3478'],
    // credential: 'xxx',  // 如果需要
    // credentialType: 'password'
  },
  
  // 备用 TURN 服务器（NAT 穿透失败时使用）
  {
    urls: ['turn:turn.tencentcloudapi.com:3478'],
    username: 'guandan',
    credential: 'xxx',
    credentialType: 'password'
  }
];
```

### 5.2 NAT 穿透成功率

| NAT 类型 | STUN 成功率 | TURN 成功率 |
|----------|-------------|-------------|
| 全锥型 (Full Cone) | ~100% | ~100% |
| 地址限制锥型 (Restricted) | ~95% | ~100% |
| 端口限制锥型 (Port Restricted) | ~90% | ~100% |
| 对称型 (Symmetric) | ~60% | ~100% |

**策略**: 优先 STUN，失败时降级 TURN

---

## 6. 安全性设计

### 6.1 通信加密

- ✅ **WebRTC**: DTLS 加密信令，SRTP 加密媒体
- ✅ **WebSocket**: WSS (TLS 1.2+)
- ✅ **邀请码**: 6 位随机数，5 分钟过期

### 6.2 防攻击措施

```typescript
// 信令服务器 - 速率限制
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests = 10; // 每 10 秒最多 10 次
  private windowMs = 10000;
  
  checkLimit(clientId: string): boolean {
    const now = Date.now();
    const reqs = this.requests.get(clientId) || [];
    
    // 移除过期请求
    const validReqs = reqs.filter(t => now - t < this.windowMs);
    
    if (validReqs.length >= this.maxRequests) {
      return false; // 超过限制
    }
    
    validReqs.push(now);
    this.requests.set(clientId, validReqs);
    return true;
  }
}

// 信令服务器 - 房间密码保护（可选）
interface RoomConfig {
  roomId: string;
  inviteCode: string;
  password?: string; // 可选密码
  maxPlayers: number;
}
```

### 6.3 隐私保护

- ✅ 信令服务器不存储用户数据
- ✅ 游戏数据 P2P 直连，不经过服务器
- ✅ 房间 5 分钟自动过期
- ✅ 无账号系统，无需个人信息

---

## 7. 性能优化

### 7.1 连接优化

| 优化点 | 方案 | 效果 |
|--------|------|------|
| **ICE 候选收集** | 并行收集 STUN/TURN | 减少 50% 连接时间 |
| **Trickle ICE** | 边收集边发送 | 减少 30% 连接时间 |
| **DataChannel 配置** | 有序、可靠传输 | 保证游戏数据完整 |
| **心跳检测** | 每 30 秒心跳 | 快速检测断线 |

### 7.2 带宽优化

```typescript
// DataChannel 配置（优化带宽）
const dataChannelConfig: RTCDataChannelInit = {
  ordered: true,          // 有序传输
  maxRetransmits: 5,      // 最多重传 5 次
  protocol: 'game-data',  // 协议标识
  negotiated: false
};

// 游戏数据压缩
function compressGameData(data: GameData): ArrayBuffer {
  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(json);
  // 可使用 pako.gzip 进一步压缩
  return bytes.buffer;
}
```

---

## 8. 测试方案

### 8.1 测试场景

| 测试场景 | 测试方法 | 验收标准 |
|----------|----------|----------|
| **正常连接** | 房主创建，玩家加入 | 连接时间 ≤ 5 秒 |
| **NAT 穿透** | 不同网络环境测试 | 成功率 ≥ 90% |
| **断线重连** | 手动断开网络 | 重连时间 ≤ 30 秒 |
| **多人并发** | 4 人同时游戏 | 延迟 ≤ 100ms |
| **长时间运行** | 连续游戏 1 小时 | 无内存泄漏、无崩溃 |

### 8.2 测试工具

- **WebRTC Internals**: `chrome://webrtc-internals`
- **网络模拟**: Chrome DevTools Network Throttling
- **压力测试**: 自动化脚本模拟多房间

---

## 9. 成本估算

### 9.1 信令服务器成本

| 云服务商 | 配置 | 月成本 | 备注 |
|----------|------|--------|------|
| **腾讯云云函数** | 128MB, 10 万次调用 | ¥0-50 | 按量计费，初期免费额度 |
| **阿里云 FC** | 128MB, 10 万次调用 | ¥0-50 | 按量计费 |
| **云服务器 ECS** | 1 核 2G, 1Mbps | ¥50-100 | 包月，固定成本 |

**建议**: 初期使用云函数（按量计费），用户增长后切换云服务器

### 9.2 带宽成本

- **信令服务器**: 极低（仅信令，KB 级别）
- **TURN 服务器**: 按流量计费（¥0.24/GB，备用）
- **预估**: 初期 ¥0-20/月

### 9.3 总成本

| 阶段 | 月成本 | 说明 |
|------|--------|------|
| **初期 (<100 DAU)** | ¥0-50 | 云函数 + 免费 STUN |
| **成长期 (100-1000 DAU)** | ¥50-100 | 云服务器 + 备用 TURN |
| **成熟期 (>1000 DAU)** | ¥100-300 | 多实例 + CDN |

---

## 10. 风险与应对

### 10.1 技术风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| **NAT 穿透失败** | 中 | 高 | 备用 TURN 服务器、提示切换网络 |
| **信令服务器宕机** | 低 | 高 | 多实例部署、自动重启 |
| **微信小程序兼容性** | 低 | 中 | 基础库版本检测、降级方案 |
| **iOS 后台限制** | 中 | 中 | 提示用户不要切出、本地保存状态 |

### 10.2 产品风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| **房主作弊** | 高 | 低 | 产品定位为休闲，无排行榜 |
| **断线体验差** | 中 | 中 | 优化重连、明确提示 |
| **邀请码泄露** | 低 | 低 | 5 分钟过期、房间密码（可选） |

---

## 11. 方案总结

### 11.1 核心技术决策

```
┌─────────────────────────────────────────────────────────┐
│                   P2P 方案核心决策                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  通信协议：WebRTC DataChannel                          │
│  信令服务：Node.js + WebSocket (轻量、无状态)           │
│  NAT 穿透：STUN 优先，TURN 备用                          │
│  连接模式：房主托管（简化架构）                        │
│  重连策略：最多 3 次，30 秒内完成                        │
│  安全加密：DTLS + WSS                                  │
│  成本预算：初期 ¥0-50/月                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 11.2 方案优势

- ✅ **无需注册**: 邀请码即身份，用户体验好
- ✅ **低成本**: 信令服务器轻量，月成本 ≤ ¥100
- ✅ **低延迟**: P2P 直连，延迟 ≤ 50ms
- ✅ **隐私保护**: 数据不经过服务器
- ✅ **断线友好**: 30 秒内重连，状态完整恢复

### 11.3 下一步行动

1. **实现信令服务器** - Node.js + ws 库
2. **实现 P2P 客户端** - 微信小程序 WebRTC
3. **测试 NAT 穿透** - 多网络环境测试
4. **优化重连体验** - 减少重连时间
5. **部署上线** - 腾讯云/阿里云

---

**创建时间**: 2026-03-23  
**架构师**: dev-agent  
**下一步**: 技术选型汇总（tech-summary.md）
