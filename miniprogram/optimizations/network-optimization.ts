/**
 * 网络性能优化
 * 包括消息压缩、批量发送、连接复用等
 */

import { performanceMonitor } from '../utils/performance-monitor';

/**
 * 游戏消息类型
 */
export interface GameMessage {
  type: string;
  [key: string]: any;
}

/**
 * 消息压缩器
 */
export class MessageCompressor {
  // 键名映射（缩短键名）
  private keyMap: Record<string, string> = {
    'type': 't',
    'players': 'p',
    'hand': 'h',
    'finished': 'f',
    'currentTurn': 't',
    'lastHand': 'l',
    'level': 'lv',
    'wildCard': 'w',
    'cards': 'c',
    'value': 'v',
    'suit': 's',
    'displayValue': 'd',
    'playerId': 'pid',
    'timestamp': 'ts'
  };

  // 反向映射（解压缩用）
  private reverseKeyMap: Record<string, string> = {};

  constructor() {
    // 构建反向映射
    Object.entries(this.keyMap).forEach(([full, short]) => {
      this.reverseKeyMap[short] = full;
    });
  }

  /**
   * 压缩游戏状态
   */
  compressGameState(state: any): string {
    const compact: any = {};
    
    if (state.players) {
      compact.p = state.players.map((p: any) => ({
        h: p.hand?.length || 0,
        f: p.finished || false
      }));
    }
    
    if (state.currentTurn !== undefined) {
      compact.t = state.currentTurn;
    }
    
    if (state.lastHand) {
      compact.l = this.compressHandType(state.lastHand);
    }
    
    if (state.level) {
      compact.lv = state.level;
    }
    
    if (state.wildCard) {
      compact.w = state.wildCard;
    }
    
    return JSON.stringify(compact);
  }

  /**
   * 压缩牌型
   */
  private compressHandType(handType: any): any {
    if (!handType) return null;
    
    return {
      t: handType.type,
      v: handType.value,
      l: handType.length
    };
  }

  /**
   * 解压游戏状态
   */
  decompressGameState(compressed: string): any {
    const compact = JSON.parse(compressed);
    const state: any = {};
    
    if (compact.p) {
      state.players = compact.p.map((p: any) => ({
        hand: new Array(p.h),
        finished: p.f
      }));
    }
    
    if (compact.t !== undefined) {
      state.currentTurn = compact.t;
    }
    
    if (compact.l) {
      state.lastHand = this.decompressHandType(compact.l);
    }
    
    if (compact.lv) {
      state.level = compact.lv;
    }
    
    if (compact.w) {
      state.wildCard = compact.w;
    }
    
    return state;
  }

  /**
   * 解压牌型
   */
  private decompressHandType(compact: any): any {
    if (!compact) return null;
    
    return {
      type: compact.t,
      value: compact.v,
      length: compact.l
    };
  }

  /**
   * 差分压缩（只传输变化的部分）
   */
  compressDiff(oldState: any, newState: any): string {
    const diff: any = {};
    
    if (oldState.currentTurn !== newState.currentTurn) {
      diff.t = newState.currentTurn;
    }
    
    if (JSON.stringify(oldState.lastHand) !== JSON.stringify(newState.lastHand)) {
      diff.l = this.compressHandType(newState.lastHand);
    }
    
    if (oldState.passCount !== newState.passCount) {
      diff.pc = newState.passCount;
    }
    
    // 玩家手牌变化
    if (newState.players) {
      diff.p = newState.players.map((p: any, i: number) => ({
        i,
        h: p.hand?.length || 0,
        f: p.finished || false
      }));
    }
    
    return JSON.stringify(diff);
  }

  /**
   * 计算压缩率
   */
  calculateCompressionRatio(original: string, compressed: string): number {
    return ((original.length - compressed.length) / original.length) * 100;
  }
}

/**
 * 消息批量发送器
 */
export class MessageBatcher {
  private queue: GameMessage[] = [];
  private timerId: number | null = null;
  private readonly BATCH_INTERVAL: number = 50; // ms
  private readonly MAX_BATCH_SIZE: number = 10;
  private sendFn: (batch: any) => void;

  constructor(sendFn: (batch: any) => void) {
    this.sendFn = sendFn;
  }

  /**
   * 发送消息（会批量处理）
   */
  send(message: GameMessage): void {
    this.queue.push(message);
    
    // 如果达到批次上限，立即发送
    if (this.queue.length >= this.MAX_BATCH_SIZE) {
      this.flush();
      return;
    }
    
    // 否则等待批次时间
    if (this.timerId === null) {
      this.timerId = setTimeout(() => this.flush(), this.BATCH_INTERVAL);
    }
  }

  /**
   * 立即发送所有消息
   */
  flush(): void {
    if (this.queue.length === 0) return;
    
    const batch = {
      type: 'BATCH',
      messages: [...this.queue],
      count: this.queue.length,
      timestamp: Date.now()
    };
    
    // 记录性能指标
    performanceMonitor.recordMetric('batch_send', this.queue.length, 'count');
    performanceMonitor.recordMetric('batch_size', JSON.stringify(batch).length, 'bytes');
    
    this.sendFn(batch);
    this.queue = [];
    
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

/**
 * 连接管理器
 */
export class ConnectionManager {
  private heartbeatInterval: number | null = null;
  private readonly HEARTBEAT_INTERVAL: number = 30000; // 30 秒
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS: number = 3;
  private connectFn: () => Promise<void>;
  private isConnected: boolean = false;

  constructor(connectFn: () => Promise<void>) {
    this.connectFn = connectFn;
  }

  /**
   * 开始心跳
   */
  startHeartbeat(sendHeartbeat: () => void): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        sendHeartbeat();
        performanceMonitor.recordMetric('heartbeat', 1, 'count');
      }
    }, this.HEARTBEAT_INTERVAL);
    
    console.log('[ConnectionManager] 心跳开始');
  }

  /**
   * 停止心跳
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    console.log('[ConnectionManager] 心跳停止');
  }

  /**
   * 设置连接状态
   */
  setConnected(connected: boolean): void {
    this.isConnected = connected;
    this.reconnectAttempts = 0;
  }

  /**
   * 尝试重连
   */
  async attemptReconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log('[ConnectionManager] 达到最大重连次数');
      return false;
    }
    
    this.reconnectAttempts++;
    console.log(`[ConnectionManager] 尝试重连 (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
    
    try {
      await this.connectFn();
      this.setConnected(true);
      performanceMonitor.recordMetric('reconnect_success', 1, 'count');
      return true;
    } catch (error) {
      console.error('[ConnectionManager] 重连失败:', error);
      performanceMonitor.recordMetric('reconnect_fail', 1, 'count');
      return false;
    }
  }

  /**
   * 获取重连次数
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopHeartbeat();
  }
}

/**
 * 网络性能监控
 */
export class NetworkMonitor {
  private latencies: number[] = [];
  private requestCount: number = 0;
  private errorCount: number = 0;

  /**
   * 记录请求延迟
   */
  recordLatency(latency: number): void {
    this.latencies.push(latency);
    this.requestCount++;
    
    // 保留最近 100 次
    if (this.latencies.length > 100) {
      this.latencies = this.latencies.slice(-100);
    }
    
    performanceMonitor.recordNetworkLatency(latency);
  }

  /**
   * 记录错误
   */
  recordError(): void {
    this.errorCount++;
    performanceMonitor.recordMetric('network_error', 1, 'count');
  }

  /**
   * 获取平均延迟
   */
  getAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((acc, l) => acc + l, 0);
    return Math.round(sum / this.latencies.length);
  }

  /**
   * 获取成功率
   */
  getSuccessRate(): number {
    const total = this.requestCount + this.errorCount;
    if (total === 0) return 100;
    return Math.round((this.requestCount / total) * 100);
  }

  /**
   * 获取报告
   */
  getReport(): {
    averageLatency: number;
    successRate: number;
    requestCount: number;
    errorCount: number;
  } {
    return {
      averageLatency: this.getAverageLatency(),
      successRate: this.getSuccessRate(),
      requestCount: this.requestCount,
      errorCount: this.errorCount
    };
  }

  /**
   * 重置
   */
  reset(): void {
    this.latencies = [];
    this.requestCount = 0;
    this.errorCount = 0;
  }
}

/**
 * 消息序列化器
 */
export class MessageSerializer {
  /**
   * 序列化游戏消息
   */
  serialize(message: GameMessage): string {
    return JSON.stringify(message);
  }

  /**
   * 反序列化游戏消息
   */
  deserialize(data: string): GameMessage {
    return JSON.parse(data);
  }

  /**
   * 安全序列化（处理循环引用）
   */
  safeSerialize(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    });
  }

  /**
   * 序列化大对象（分块）
   */
  serializeLarge(obj: any, chunkSize: number = 10000): string[] {
    const full = JSON.stringify(obj);
    const chunks: string[] = [];
    
    for (let i = 0; i < full.length; i += chunkSize) {
      chunks.push(full.slice(i, i + chunkSize));
    }
    
    return chunks;
  }
}
