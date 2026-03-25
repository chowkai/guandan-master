/**
 * 性能监控工具
 * 用于追踪 FPS、内存使用、网络延迟等性能指标
 */

export interface PerformanceMetrics {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface PerformanceReport {
  fps: number;
  memory: number;
  networkLatency: number;
  metrics: PerformanceMetrics[];
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  private fps: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private memoryUsage: number = 0;
  private networkLatency: number = 0;
  private metrics: PerformanceMetrics[] = [];
  private frameId: number | null = null;
  private listeners: Set<(report: PerformanceReport) => void> = new Set();

  private constructor() {
    this.lastTime = performance.now();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.frameId !== null) return;
    
    const track = () => {
      this.trackFPS();
      this.trackMemory();
      this.frameId = requestAnimationFrame(track);
    };
    
    this.frameId = requestAnimationFrame(track);
    console.log('[PerformanceMonitor] 开始监控');
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    console.log('[PerformanceMonitor] 停止监控');
  }

  /**
   * 追踪 FPS
   */
  trackFPS(): number {
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      // 记录 FPS 指标
      this.recordMetric('fps', this.fps, 'fps');
    }
    
    return this.fps;
  }

  /**
   * 追踪内存使用
   */
  trackMemory(): number {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      this.memoryUsage = Math.round(mem.usedJSHeapSize / 1048576); // MB
      
      // 每 5 秒记录一次内存
      if (this.frameCount % 300 === 0) {
        this.recordMetric('memory', this.memoryUsage, 'MB');
      }
    }
    return this.memoryUsage;
  }

  /**
   * 记录网络延迟
   */
  recordNetworkLatency(latency: number): void {
    this.networkLatency = latency;
    this.recordMetric('network_latency', latency, 'ms');
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, unit: string = 'ms'): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now()
    });
    
    // 保留最近 1000 条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // 通知监听器
    this.notifyListeners();
  }

  /**
   * 记录时间点（用于计算耗时）
   */
  mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * 测量两个时间点之间的耗时
   */
  measure(name: string, startMark: string, endMark: string): number {
    if ('performance' in window && 'measure' in performance) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0) {
        const duration = entries[0].duration;
        this.recordMetric(name, duration, 'ms');
        return duration;
      }
    }
    return 0;
  }

  /**
   * 上报性能数据
   */
  reportPerformance(): PerformanceReport {
    return {
      fps: this.getAverageFPS(),
      memory: this.memoryUsage,
      networkLatency: this.networkLatency,
      metrics: this.metrics.slice(-100), // 保留最近 100 条
      timestamp: Date.now()
    };
  }

  /**
   * 获取平均 FPS
   */
  getAverageFPS(): number {
    const fpsMetrics = this.metrics.filter(m => m.name === 'fps');
    if (fpsMetrics.length === 0) return this.fps;
    
    const sum = fpsMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / fpsMetrics.length);
  }

  /**
   * 获取平均内存使用
   */
  getAverageMemory(): number {
    const memMetrics = this.metrics.filter(m => m.name === 'memory');
    if (memMetrics.length === 0) return this.memoryUsage;
    
    const sum = memMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / memMetrics.length);
  }

  /**
   * 添加性能报告监听器
   */
  addListener(callback: (report: PerformanceReport) => void): void {
    this.listeners.add(callback);
  }

  /**
   * 移除监听器
   */
  removeListener(callback: (report: PerformanceReport) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    const report = this.reportPerformance();
    this.listeners.forEach(callback => callback(report));
  }

  /**
   * 重置所有数据
   */
  reset(): void {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.memoryUsage = 0;
    this.networkLatency = 0;
    this.metrics = [];
  }
}

/**
 * 性能优化辅助函数
 */
export class PerformanceUtils {
  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
        func(...args);
      };
      
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 批量处理（合并多次调用为一次）
   */
  static batch<T>(
    callback: (items: T[]) => void,
    interval: number = 50
  ): (item: T) => void {
    const queue: T[] = [];
    let timer: number | null = null;

    return function process(item: T) {
      queue.push(item);
      
      if (timer === null) {
        timer = setTimeout(() => {
          const batch = [...queue];
          queue.length = 0;
          timer = null;
          callback(batch);
        }, interval);
      }
    };
  }

  /**
   * 使用 requestAnimationFrame 进行动画
   */
  static animate(
    update: (progress: number) => void,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        update(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * 图片预加载
   */
  static preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }

  /**
   * 计算数组差异（用于差分更新）
   */
  static diffArrays<T>(oldArr: T[], newArr: T[]): { added: T[]; removed: T[] } {
    const added = newArr.filter(item => !oldArr.includes(item));
    const removed = oldArr.filter(item => !newArr.includes(item));
    return { added, removed };
  }

  /**
   * 深拷贝（用于不可变数据）
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 对象池
   */
  static createPool<T>(
    create: () => T,
    reset: (item: T) => void,
    initialSize: number = 10
  ): { acquire: () => T; release: (item: T) => void } {
    const pool: T[] = [];
    const active: T[] = [];

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      pool.push(create());
    }

    return {
      acquire: () => {
        let item: T;
        if (pool.length > 0) {
          item = pool.pop()!;
        } else {
          item = create();
        }
        active.push(item);
        return item;
      },
      release: (item: T) => {
        const index = active.indexOf(item);
        if (index > -1) {
          active.splice(index, 1);
          reset(item);
          pool.push(item);
        }
      }
    };
  }
}

// 导出单例
export const performanceMonitor = PerformanceMonitor.getInstance();
