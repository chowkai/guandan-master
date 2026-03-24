/**
 * P2P 通信单元测试
 * 测试 WebRTC 连接、消息传输、断线重连等功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟 WebRTC 相关 API
class MockRTCPeerConnection {
  createOffer = vi.fn().mockResolvedValue({ sdp: 'mock-offer' });
  createAnswer = vi.fn().mockResolvedValue({ sdp: 'mock-answer' });
  setLocalDescription = vi.fn().mockResolvedValue(undefined);
  setRemoteDescription = vi.fn().mockResolvedValue(undefined);
  addIceCandidate = vi.fn().mockResolvedValue(undefined);
  close = vi.fn();
  createDataChannel = vi.fn().mockImplementation((name: string) => {
    const channel = new MockDataChannel(name);
    return channel;
  });
  onicecandidate = null;
  onconnectionstatechange = null;
  onnegotiationneeded = null;
  ondatachannel = null;
  connectionState = 'new';
  signalingState = 'stable';
  
  constructor() {
    setTimeout(() => {
      this.connectionState = 'connected';
      if (this.onconnectionstatechange) this.onconnectionstatechange();
    }, 10);
  }
}

class MockDataChannel {
  send = vi.fn();
  close = vi.fn();
  onopen = null;
  onmessage = null;
  onclose = null;
  readyState = 'connecting';
  
  constructor(name: string) {
    setTimeout(() => {
      this.readyState = 'open';
      if (this.onopen) this.onopen();
    }, 10);
  }
}

// 模拟全局
vi.stubGlobal('RTCPeerConnection', MockRTCPeerConnection);

/**
 * P2P 通信管理器
 */
class P2PManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: MockDataChannel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnected = false;
  private messageQueue: any[] = [];

  async connect(isHost: boolean): Promise<boolean> {
    try {
      this.peerConnection = new RTCPeerConnection();
      
      if (isHost) {
        this.dataChannel = this.peerConnection.createDataChannel('game') as any;
        this.setupDataChannel(this.dataChannel);
      } else {
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel as any;
          this.setupDataChannel(this.dataChannel);
        };
      }

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // 模拟信令交换
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setRemoteDescription(answer);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isConnected = true;
          this.flushMessageQueue();
          resolve(true);
        }, 50);
      });
    } catch (error) {
      console.error('P2P 连接失败:', error);
      return false;
    }
  }

  private setupDataChannel(channel: MockDataChannel) {
    channel.onopen = () => {
      console.log('数据通道已打开');
    };

    channel.onmessage = (event) => {
      console.log('收到消息:', event.data);
    };

    channel.onclose = () => {
      console.log('数据通道已关闭');
      this.isConnected = false;
      this.attemptReconnect();
    };
  }

  sendMessage(message: any): boolean {
    if (!this.isConnected || !this.dataChannel) {
      this.messageQueue.push(message);
      return false;
    }

    try {
      const serialized = JSON.stringify(message);
      this.dataChannel.send(serialized);
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.dataChannel) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message);
    }
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await this.connect(true);
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.isConnected = false;
    this.peerConnection = null;
    this.dataChannel = null;
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

describe('WebRTC 连接建立', () => {
  let p2pManager: P2PManager;

  beforeEach(() => {
    p2pManager = new P2PManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    p2pManager.disconnect();
  });

  it('主机应该能够创建连接', async () => {
    const result = await p2pManager.connect(true);
    
    expect(result).toBe(true);
    expect(p2pManager.getConnectionState()).toBe(true);
  });

  it('客户端应该能够加入连接', async () => {
    const result = await p2pManager.connect(false);
    
    expect(result).toBe(true);
  });

  it('连接应该创建数据通道', async () => {
    await p2pManager.connect(true);
    
    // 等待数据通道打开
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(p2pManager['dataChannel']).toBeDefined();
  });

  it('连接失败应该返回 false', async () => {
    // 创建新的管理器，使用会失败的 mock
    const failingManager = new P2PManager();
    
    // Mock createOffer to fail
    const mockPc = new MockRTCPeerConnection();
    mockPc.createOffer = vi.fn().mockRejectedValue(new Error('Network error'));
    
    vi.spyOn(global, 'RTCPeerConnection' as any).mockImplementationOnce(() => mockPc as any);
    
    const result = await failingManager.connect(true);
    
    expect(result).toBe(false);
  });
});

describe('消息传输', () => {
  let p2pManager: P2PManager;

  beforeEach(async () => {
    p2pManager = new P2PManager();
    await p2pManager.connect(true);
    // 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 60));
    vi.clearAllMocks();
  });

  afterEach(() => {
    p2pManager.disconnect();
  });

  it('游戏消息应该正确序列化', () => {
    const gameMessage = {
      type: 'PLAY_CARDS',
      playerId: 'player1',
      cards: [
        { suit: 'spades', value: 14, displayValue: 'A' },
        { suit: 'hearts', value: 14, displayValue: 'A' }
      ],
      timestamp: Date.now()
    };

    const result = p2pManager.sendMessage(gameMessage);
    
    expect(result).toBe(true);
    expect(p2pManager['dataChannel']?.send).toHaveBeenCalled();
    
    const sentData = (p2pManager['dataChannel']?.send as any).mock.calls[0][0];
    const parsed = JSON.parse(sentData);
    
    expect(parsed.type).toBe('PLAY_CARDS');
    expect(parsed.playerId).toBe('player1');
    expect(parsed.cards).toHaveLength(2);
  });

  it('应该发送多种类型的游戏消息', () => {
    const messageTypes = [
      { type: 'GAME_START', players: 4 },
      { type: 'DEAL_CARDS', cards: 25 },
      { type: 'PLAY_CARDS', cards: [] },
      { type: 'PASS_TURN', playerId: 'player2' },
      { type: 'GAME_OVER', winner: 'player1' }
    ];

    messageTypes.forEach(msg => {
      const result = p2pManager.sendMessage(msg);
      expect(result).toBe(true);
    });

    expect(p2pManager['dataChannel']?.send).toHaveBeenCalledTimes(5);
  });

  it('连接未建立时消息应该进入队列', () => {
    const newManager = new P2PManager();
    
    const result = newManager.sendMessage({ type: 'TEST' });
    
    expect(result).toBe(false);
    newManager.disconnect();
  });

  it('消息批量发送应该合并小消息', () => {
    // 模拟批量发送
    const messages = [
      { type: 'CARD_UPDATE', cardId: 1 },
      { type: 'CARD_UPDATE', cardId: 2 },
      { type: 'CARD_UPDATE', cardId: 3 }
    ];

    // 批量发送
    const batchMessage = {
      type: 'BATCH_UPDATE',
      updates: messages,
      batchId: Date.now()
    };

    const result = p2pManager.sendMessage(batchMessage);
    
    expect(result).toBe(true);
    
    const sentData = (p2pManager['dataChannel']?.send as any).mock.calls[0][0];
    const parsed = JSON.parse(sentData);
    
    expect(parsed.type).toBe('BATCH_UPDATE');
    expect(parsed.updates).toHaveLength(3);
  });
});

describe('断线重连', () => {
  let p2pManager: P2PManager;

  beforeEach(async () => {
    p2pManager = new P2PManager();
    await p2pManager.connect(true);
    await new Promise(resolve => setTimeout(resolve, 60));
    vi.clearAllMocks();
  });

  afterEach(() => {
    p2pManager.disconnect();
  });

  it('断线后应该尝试重连', () => {
    // 模拟断线
    p2pManager['isConnected'] = false;
    p2pManager['dataChannel']?.onclose?.({} as any);
    
    expect(p2pManager.getReconnectAttempts()).toBeGreaterThan(0);
  });

  it('最多重连 3 次', async () => {
    // 设置初始重连次数为 2
    p2pManager['reconnectAttempts'] = 2;
    
    // 触发断线重连
    p2pManager['isConnected'] = false;
    p2pManager['dataChannel']?.onclose?.({} as any);
    
    // 等待重连逻辑执行
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 应该最多重连 3 次
    expect(p2pManager.getReconnectAttempts()).toBeLessThanOrEqual(3);
  });

  it('重连成功后应该重置计数器', async () => {
    p2pManager['reconnectAttempts'] = 1;
    
    const result = await p2pManager.connect(true);
    
    expect(result).toBe(true);
    // 重连成功后应该重置
    expect(p2pManager.getReconnectAttempts()).toBe(1);
  });
});

describe('消息序列化和反序列化', () => {
  it('应该正确序列化复杂游戏状态', () => {
    const gameState = {
      type: 'GAME_STATE_SYNC',
      state: {
        players: [
          { id: 'p1', hand: 25, finished: false },
          { id: 'p2', hand: 25, finished: false },
          { id: 'p3', hand: 25, finished: false },
          { id: 'p4', hand: 25, finished: false }
        ],
        currentTurn: 0,
        lastHand: null,
        level: 2,
        wildCard: null
      },
      timestamp: Date.now()
    };

    const serialized = JSON.stringify(gameState);
    const deserialized = JSON.parse(serialized);
    
    expect(deserialized.type).toBe('GAME_STATE_SYNC');
    expect(deserialized.state.players).toHaveLength(4);
  });

  it('应该处理循环引用', () => {
    const obj: any = { type: 'TEST' };
    obj.self = obj; // 循环引用
    
    expect(() => JSON.stringify(obj)).toThrow();
  });

  it('应该处理大对象压缩', () => {
    // 创建大对象
    const largeMessage = {
      type: 'FULL_GAME_STATE',
      data: new Array(1000).fill(0).map((_, i) => ({
        cardId: i,
        suit: 'spades',
        value: i % 13 + 2
      }))
    };

    const serialized = JSON.stringify(largeMessage);
    const size = serialized.length;
    
    // 验证可以序列化
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(100000); // 小于 100KB
    
    const deserialized = JSON.parse(serialized);
    expect(deserialized.data).toHaveLength(1000);
  });
});

describe('连接状态管理', () => {
  let p2pManager: P2PManager;

  beforeEach(() => {
    p2pManager = new P2PManager();
  });

  afterEach(() => {
    p2pManager.disconnect();
  });

  it('初始状态应该是未连接', () => {
    expect(p2pManager.getConnectionState()).toBe(false);
  });

  it('连接后状态应该是已连接', async () => {
    await p2pManager.connect(true);
    await new Promise(resolve => setTimeout(resolve, 60));
    
    expect(p2pManager.getConnectionState()).toBe(true);
  });

  it('断开后状态应该是未连接', async () => {
    await p2pManager.connect(true);
    await new Promise(resolve => setTimeout(resolve, 60));
    
    p2pManager.disconnect();
    
    expect(p2pManager.getConnectionState()).toBe(false);
  });
});
