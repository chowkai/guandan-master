/**
 * 渲染性能优化
 * 包括 Canvas 渲染、减少重绘、动画优化等
 */

import { performanceMonitor } from '../utils/performance-monitor';

/**
 * Canvas 卡牌渲染器
 * 使用 Canvas 替代 DOM 渲染，提升性能
 */
export class CardCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cardImages: Map<string, HTMLImageElement> = new Map();
  private width: number = 0;
  private height: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  /**
   * 预加载卡牌图片
   */
  async preloadCards(cardValues: string[]): Promise<void> {
    const promises = cardValues.map(value => {
      return new Promise<void>((resolve, reject) => {
        if (this.cardImages.has(value)) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.src = `/assets/cards/${value}.png`;
        img.onload = () => {
          this.cardImages.set(value, img);
          resolve();
        };
        img.onerror = reject;
      });
    });
    
    await Promise.all(promises);
    console.log(`[CardCanvasRenderer] 预加载 ${cardValues.length} 张卡牌图片`);
  }

  /**
   * 渲染单张卡牌
   */
  renderCard(
    card: { value: string; x: number; y: number; width: number; height: number },
    selected: boolean = false
  ): void {
    const img = this.cardImages.get(card.value);
    if (!img) return;

    const { x, y, width, height } = card;
    
    // 选中的牌上移
    const renderY = selected ? y - 20 : y;
    
    // 绘制阴影
    if (selected) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetY = 5;
    }
    
    // 绘制卡牌
    this.ctx.drawImage(img, x, renderY, width, height);
    
    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * 批量渲染所有卡牌
   */
  renderAllCards(cards: Array<{
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
  }>): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 批量绘制
    cards.forEach(card => this.renderCard(card, card.selected));
    
    // 记录性能指标
    performanceMonitor.recordMetric('render_cards', cards.length, 'count');
  }

  /**
   * 使用 requestAnimationFrame 渲染动画
   */
  animateCards(
    fromPositions: Array<{ x: number; y: number }>,
    toPositions: Array<{ x: number; y: number }>,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const cards = fromPositions.map((from, i) => ({
        from,
        to: toPositions[i],
        current: { ...from }
      }));

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数（ease-out）
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // 更新位置
        cards.forEach(card => {
          card.current.x = card.from.x + (card.to.x - card.from.x) * eased;
          card.current.y = card.from.y + (card.to.y - card.from.y) * eased;
        });
        
        // 清空并重绘
        this.ctx.clearRect(0, 0, this.width, this.height);
        cards.forEach((card, i) => {
          this.renderCard({
            value: `${i}`,
            x: card.current.x,
            y: card.current.y,
            width: 80,
            height: 110
          });
        });
        
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
   * 清理资源
   */
  destroy(): void {
    this.cardImages.clear();
  }
}

/**
 * DOM 渲染优化器
 * 减少重绘和重排
 */
export class DOMRenderer {
  /**
   * 使用 CSS transform 代替 top/left
   */
  static setElementPosition(
    element: HTMLElement,
    x: number,
    y: number
  ): void {
    element.style.transform = `translate(${x}px, ${y}px)`;
  }

  /**
   * 批量更新 DOM
   */
  static batchUpdate<T>(
    elements: HTMLElement[],
    updateFn: (element: HTMLElement, index: number) => T
  ): T[] {
    // 使用 DocumentFragment 批量操作
    const results: T[] = [];
    
    // 先隐藏，减少重绘
    elements.forEach(el => el.style.display = 'none');
    
    // 批量更新
    elements.forEach((el, i) => {
      results.push(updateFn(el, i));
    });
    
    // 重新显示
    elements.forEach(el => el.style.display = 'block');
    
    return results;
  }

  /**
   * 使用 will-change 提示浏览器优化
   */
  static enableOptimization(element: HTMLElement, properties: string[]): void {
    element.style.willChange = properties.join(', ');
  }

  /**
   * 禁用优化（在动画结束后调用）
   */
  static disableOptimization(element: HTMLElement): void {
    element.style.willChange = 'auto';
  }

  /**
   * 使用 GPU 加速
   */
  static enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
  }
}

/**
 * 渲染性能监控
 */
export class RenderMonitor {
  private renderCount: number = 0;
  private lastRenderTime: number = 0;

  /**
   * 开始渲染计时
   */
  startRender(): void {
    this.lastRenderTime = performance.now();
  }

  /**
   * 结束渲染计时并记录
   */
  endRender(operation: string = 'render'): void {
    const duration = performance.now() - this.lastRenderTime;
    this.renderCount++;
    
    performanceMonitor.recordMetric(`${operation}_duration`, duration, 'ms');
    
    if (duration > 16.67) { // 超过 1 帧
      console.warn(`[RenderMonitor] ${operation} 耗时 ${duration.toFixed(2)}ms，超过 1 帧`);
    }
  }

  /**
   * 获取平均渲染时间
   */
  getAverageRenderTime(): number {
    const metrics = performanceMonitor['metrics']
      .filter(m => m.name.endsWith('_duration'));
    
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }
}

/**
 * 图片懒加载
 */
export class LazyImageLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loading: Map<string, Promise<HTMLImageElement>> = new Map();

  /**
   * 加载图片（带缓存）
   */
  async loadImage(url: string): Promise<HTMLImageElement> {
    // 检查缓存
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // 检查是否正在加载
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // 开始加载
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  /**
   * 批量预加载
   */
  async preloadAll(urls: string[]): Promise<void> {
    await Promise.all(urls.map(url => this.loadImage(url)));
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * 动画优化器
 */
export class AnimationOptimizer {
  private activeAnimations: Set<number> = new Set();

  /**
   * 使用 requestAnimationFrame 动画
   */
  animate(
    update: (progress: number) => void,
    duration: number,
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-out'
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let animationId: number;

      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 应用缓动函数
        let eased: number;
        switch (easing) {
          case 'ease-in':
            eased = progress * progress;
            break;
          case 'ease-out':
            eased = 1 - Math.pow(1 - progress, 2);
            break;
          case 'ease-in-out':
            eased = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            break;
          default:
            eased = progress;
        }
        
        update(eased);
        
        if (progress < 1) {
          animationId = requestAnimationFrame(tick);
          this.activeAnimations.add(animationId);
        } else {
          this.activeAnimations.delete(animationId);
          resolve();
        }
      };

      animationId = requestAnimationFrame(tick);
      this.activeAnimations.add(animationId);
    });
  }

  /**
   * 停止所有动画
   */
  stopAll(): void {
    this.activeAnimations.forEach(id => cancelAnimationFrame(id));
    this.activeAnimations.clear();
  }
}
