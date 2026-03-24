# 信令服务器 (Signaling Server)

WebRTC 信令服务器，用于实时通信应用中的 SDP 和 ICE 候选交换。

## 技术栈

- Node.js (v18+)
- Express
- WebSocket (ws)
- PM2 (进程管理)

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置实际值
```

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs signaling-server

# 重启服务
pm2 restart signaling-server

# 停止服务
pm2 stop signaling-server

# 开机自启
pm2 startup
pm2 save
```

## API 端点

### HTTP

- `GET /health` - 健康检查
- `GET /status` - 服务器状态

### WebSocket

连接：`ws://localhost:3000/ws`

#### 消息类型

**客户端 → 服务器**:

```json
// 加入房间
{ "type": "join", "payload": { "roomId": "room123" } }

// 离开房间
{ "type": "leave", "payload": { "roomId": "room123" } }

// 发送 Offer
{ "type": "offer", "payload": { "targetId": "client_xxx", "sdp": {...} } }

// 发送 Answer
{ "type": "answer", "payload": { "targetId": "client_xxx", "sdp": {...} } }

// 发送 ICE 候选
{ "type": "ice-candidate", "payload": { "targetId": "client_xxx", "candidate": {...} } }

// 心跳
{ "type": "heartbeat" }
```

**服务器 → 客户端**:

```json
// 欢迎消息
{ "type": "welcome", "clientId": "client_xxx", "timestamp": "..." }

// 加入成功
{ "type": "join-success", "payload": { "roomId": "room123", "members": [...] } }

// 用户加入
{ "type": "user-joined", "payload": { "clientId": "client_xxx", "roomId": "room123" } }

// 用户离开
{ "type": "user-left", "payload": { "clientId": "client_xxx", "roomId": "room123" } }

// 信令消息
{ "type": "offer|answer|ice-candidate", "payload": { "from": "client_xxx", ... } }

// 心跳确认
{ "type": "heartbeat_ack" }
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | HTTP/WS 端口 | 3000 |
| NODE_ENV | 运行环境 | production |
| LOG_LEVEL | 日志级别 | info |
| ALLOWED_ORIGINS | CORS 允许的来源 | * |
| MAX_CONNECTIONS | 最大连接数 | 100 |
| HEARTBEAT_INTERVAL | 心跳间隔 (ms) | 30000 |

## 目录结构

```
signaling-server/
├── src/
│   └── index.js      # 主程序
├── logs/             # 日志目录 (自动创建)
├── .env.example      # 环境变量模板
├── .env              # 环境变量配置
├── package.json      # 依赖配置
├── ecosystem.config.js # PM2 配置
└── README.md         # 本文档
```

## 监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs signaling-server --lines 100

# 健康检查
curl http://localhost:3000/health
```

## 许可证

MIT
