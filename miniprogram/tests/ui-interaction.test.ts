/**
 * UI 交互单元测试
 * 测试手牌区布局、选牌动画、进贡界面等 UI 交互功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 手牌区布局计算
 */
class HandAreaLayout {
  private cardWidth: number = 80;
  private cardHeight: number = 110;
  private gap: number = -60; // 负值表示牌重叠
  private rows: number = 5;
  private screenWidth: number = 375; // iPhone 标准宽度

  constructor(screenWidth?: number) {
    if (screenWidth) {
      this.screenWidth = screenWidth;
    }
  }

  /**
   * 计算 5 行网格布局
   */
  calculateGridLayout(handSize: number): { row: number; col: number; x: number; y: number }[] {
    const positions: { row: number; col: number; x: number; y: number }[] = [];
    const cardsPerRow = Math.ceil(handSize / this.rows);
    
    for (let i = 0; i < handSize; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      
      const totalWidth = cardsPerRow * this.cardWidth + (cardsPerRow - 1) * this.gap;
      const startX = (this.screenWidth - totalWidth) / 2;
      
      const x = startX + col * (this.cardWidth + this.gap);
      const y = row * (this.cardHeight - 20); // 行间距
      
      positions.push({ row, col, x, y });
    }
    
    return positions;
  }

  /**
   * 获取牌的显示区域
   */
  getCardRect(index: number, handSize: number): { x: number; y: number; width: number; height: number } {
    const positions = this.calculateGridLayout(handSize);
    const pos = positions[index];
    
    return {
      x: pos.x,
      y: pos.y,
      width: this.cardWidth,
      height: this.cardHeight
    };
  }

  /**
   * 检查是否超出屏幕
   */
  isWithinBounds(handSize: number): boolean {
    const positions = this.calculateGridLayout(handSize);
    if (positions.length === 0) return true;
    
    const lastPos = positions[positions.length - 1];
    const rightEdge = lastPos.x + this.cardWidth;
    
    return rightEdge <= this.screenWidth;
  }
}

/**
 * 选牌动画效果
 */
class CardSelectionAnimation {
  private selectedCards: Set<number> = new Set();
  private animationDuration: number = 200; // ms
  private moveUpDistance: number = 20; // px

  /**
   * 切换牌的选中状态
   */
  toggleCard(index: number): boolean {
    if (this.selectedCards.has(index)) {
      this.selectedCards.delete(index);
      return false;
    } else {
      this.selectedCards.add(index);
      return true;
    }
  }

  /**
   * 获取牌的 Y 轴偏移（用于上移动画）
   */
  getCardOffset(index: number): number {
    return this.selectedCards.has(index) ? -this.moveUpDistance : 0;
  }

  /**
   * 获取所有选中的牌
   */
  getSelectedCards(): number[] {
    return Array.from(this.selectedCards).sort((a, b) => a - b);
  }

  /**
   * 清空选中状态
   */
  clearSelection(): void {
    this.selectedCards.clear();
  }

  /**
   * 批量选中
   */
  selectMultiple(indices: number[]): void {
    indices.forEach(i => this.selectedCards.add(i));
  }

  /**
   * 检查是否可以出牌（至少选一张）
   */
  canPlay(): boolean {
    return this.selectedCards.size > 0;
  }
}

/**
 * 进贡还贡界面逻辑
 */
class TributeInterface {
  private isTributePhase: boolean = false;
  private tributeType: 'single' | 'double' | 'anti' | 'return' = 'single';
  private selectedCards: number[] = [];
  private requiredCount: number = 1;
  private maxSelectable: number = 1;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.isTributePhase = false;
    this.tributeType = 'single';
    this.selectedCards = [];
    this.requiredCount = 1;
    this.maxSelectable = 1;
  }

  /**
   * 开始进贡阶段
   */
  startTribute(type: 'single' | 'double' | 'anti' | 'return', count: number): void {
    this.isTributePhase = true;
    this.tributeType = type;
    this.requiredCount = count;
    this.maxSelectable = type === 'double' ? 2 : 1;
    this.selectedCards = [];
  }

  /**
   * 选择进贡的牌
   */
  selectCard(cardIndex: number): boolean {
    if (!this.isTributePhase) return false;
    
    const index = this.selectedCards.indexOf(cardIndex);
    
    if (index > -1) {
      // 取消选择
      this.selectedCards.splice(index, 1);
      return false;
    } else {
      // 选择新牌
      if (this.selectedCards.length >= this.maxSelectable) {
        return false; // 已达上限
      }
      this.selectedCards.push(cardIndex);
      this.selectedCards.sort((a, b) => a - b);
      return true;
    }
  }

  /**
   * 确认进贡
   */
  confirmTribute(): number[] | null {
    if (!this.isTributePhase) return null;
    if (this.selectedCards.length !== this.requiredCount) return null;
    
    const tribute = [...this.selectedCards];
    this.reset();
    return tribute;
  }

  /**
   * 获取当前状态
   */
  getState(): {
    isTributePhase: boolean;
    tributeType: string;
    selectedCount: number;
    requiredCount: number;
    canConfirm: boolean;
    maxSelectable: number;
  } {
    return {
      isTributePhase: this.isTributePhase,
      tributeType: this.tributeType,
      selectedCount: this.selectedCards.length,
      requiredCount: this.requiredCount,
      canConfirm: this.selectedCards.length === this.requiredCount,
      maxSelectable: this.maxSelectable
    };
  }

  /**
   * 检查是否是抗贡
   */
  isAntiTribute(): boolean {
    return this.tributeType === 'anti';
  }
}

describe('手牌区 5 行网格布局', () => {
  let layout: HandAreaLayout;

  beforeEach(() => {
    layout = new HandAreaLayout();
  });

  it('应该正确计算 25 张牌的布局', () => {
    const positions = layout.calculateGridLayout(25);
    
    expect(positions).toHaveLength(25);
    expect(positions[0].row).toBe(0);
    expect(positions[24].row).toBe(4); // 最后一行
  });

  it('应该每行平均分配牌', () => {
    const positions = layout.calculateGridLayout(25);
    
    // 25 张牌分 5 行，每行 5 张
    const rowCount = new Map<number, number>();
    positions.forEach(pos => {
      rowCount.set(pos.row, (rowCount.get(pos.row) || 0) + 1);
    });
    
    expect(rowCount.get(0)).toBe(5);
    expect(rowCount.get(1)).toBe(5);
    expect(rowCount.get(2)).toBe(5);
    expect(rowCount.get(3)).toBe(5);
    expect(rowCount.get(4)).toBe(5);
  });

  it('应该居中显示手牌', () => {
    const positions = layout.calculateGridLayout(25);
    
    // 第一张牌应该在屏幕左侧
    expect(positions[0].x).toBeGreaterThan(0);
    
    // 最后一张牌不应该超出屏幕
    const lastRect = layout.getCardRect(24, 25);
    expect(lastRect.x + lastRect.width).toBeLessThanOrEqual(375);
  });

  it('应该适配不同屏幕宽度', () => {
    const wideLayout = new HandAreaLayout(414); // iPhone Plus
    const narrowLayout = new HandAreaLayout(320); // iPhone SE
    
    const widePositions = wideLayout.calculateGridLayout(25);
    const narrowPositions = narrowLayout.calculateGridLayout(25);
    
    // 宽屏幕的第一张牌应该更靠右（更居中）
    expect(widePositions[0].x).toBeGreaterThan(narrowPositions[0].x);
  });

  it('牌应该有正确的重叠效果', () => {
    const positions = layout.calculateGridLayout(25);
    
    // 相邻牌的间距应该是负值（重叠）
    const gap = positions[1].x - positions[0].x;
    expect(gap).toBeLessThan(80); // 小于牌宽表示重叠
  });

  it('不同行数应该正确计算', () => {
    const layout10 = new HandAreaLayout();
    const positions10 = layout10.calculateGridLayout(10);
    
    expect(positions10).toHaveLength(10);
    // 10 张牌分 5 行，每行 2 张
    expect(positions10[0].row).toBe(0);
    expect(positions10[9].row).toBe(4);
  });
});

describe('选牌动画 - 上移效果', () => {
  let animation: CardSelectionAnimation;

  beforeEach(() => {
    animation = new CardSelectionAnimation();
  });

  it('应该切换牌的选中状态', () => {
    const firstSelect = animation.toggleCard(0);
    const secondSelect = animation.toggleCard(0);
    
    expect(firstSelect).toBe(true);
    expect(secondSelect).toBe(false);
  });

  it('选中的牌应该上移', () => {
    animation.toggleCard(0);
    animation.toggleCard(2);
    
    expect(animation.getCardOffset(0)).toBe(-20);
    expect(animation.getCardOffset(1)).toBe(0);
    expect(animation.getCardOffset(2)).toBe(-20);
  });

  it('应该获取所有选中的牌', () => {
    animation.toggleCard(0);
    animation.toggleCard(2);
    animation.toggleCard(1);
    
    const selected = animation.getSelectedCards();
    
    expect(selected).toEqual([0, 1, 2]);
  });

  it('应该可以清空选中状态', () => {
    animation.toggleCard(0);
    animation.toggleCard(1);
    animation.clearSelection();
    
    expect(animation.getSelectedCards()).toHaveLength(0);
    expect(animation.getCardOffset(0)).toBe(0);
  });

  it('应该支持批量选中', () => {
    animation.selectMultiple([0, 2, 4]);
    
    const selected = animation.getSelectedCards();
    expect(selected).toEqual([0, 2, 4]);
  });

  it('至少选一张才能出牌', () => {
    expect(animation.canPlay()).toBe(false);
    
    animation.toggleCard(0);
    expect(animation.canPlay()).toBe(true);
  });

  it('动画持续时间应该合理', () => {
    expect(animation['animationDuration']).toBe(200);
    expect(animation['animationDuration']).toBeLessThan(500); // 不超过 500ms
  });
});

describe('进贡界面 - 选牌/确认', () => {
  let tribute: TributeInterface;

  beforeEach(() => {
    tribute = new TributeInterface();
  });

  it('应该开始单贡', () => {
    tribute.startTribute('single', 1);
    const state = tribute.getState();
    
    expect(state.isTributePhase).toBe(true);
    expect(state.tributeType).toBe('single');
    expect(state.requiredCount).toBe(1);
  });

  it('应该开始双贡', () => {
    tribute.startTribute('double', 2);
    const state = tribute.getState();
    
    expect(state.tributeType).toBe('double');
    expect(state.requiredCount).toBe(2);
    expect(state.maxSelectable).toBe(2);
  });

  it('应该选择进贡的牌', () => {
    tribute.startTribute('single', 1);
    
    tribute.selectCard(0);
    const state = tribute.getState();
    
    expect(state.selectedCount).toBe(1);
    expect(state.canConfirm).toBe(true);
  });

  it('应该限制最大选择数量', () => {
    tribute.startTribute('single', 1);
    
    tribute.selectCard(0);
    const result = tribute.selectCard(1); // 尝试选第二张
    
    expect(result).toBe(false);
    expect(tribute.getState().selectedCount).toBe(1);
  });

  it('应该可以取消选择', () => {
    tribute.startTribute('single', 1);
    
    tribute.selectCard(0);
    tribute.selectCard(0); // 再次点击取消
    
    expect(tribute.getState().selectedCount).toBe(0);
    expect(tribute.getState().canConfirm).toBe(false);
  });

  it('应该确认进贡', () => {
    tribute.startTribute('single', 1);
    tribute.selectCard(5);
    
    const confirmed = tribute.confirmTribute();
    
    expect(confirmed).toEqual([5]);
    expect(tribute.getState().isTributePhase).toBe(false);
  });

  it('数量不足时不能确认', () => {
    tribute.startTribute('double', 2);
    tribute.selectCard(5);
    
    const confirmed = tribute.confirmTribute();
    
    expect(confirmed).toBeNull();
  });

  it('应该处理抗贡', () => {
    tribute.startTribute('anti', 0);
    
    expect(tribute.isAntiTribute()).toBe(true);
    expect(tribute.getState().canConfirm).toBe(true); // 抗贡不需要选牌
  });

  it('应该处理还贡', () => {
    tribute.startTribute('return', 1);
    
    const state = tribute.getState();
    expect(state.tributeType).toBe('return');
    expect(state.requiredCount).toBe(1);
  });

  it('双贡应该可以选择两张牌', () => {
    tribute.startTribute('double', 2);
    
    tribute.selectCard(3);
    tribute.selectCard(7);
    
    const state = tribute.getState();
    expect(state.selectedCount).toBe(2);
    expect(state.canConfirm).toBe(true);
    
    const confirmed = tribute.confirmTribute();
    expect(confirmed).toEqual([3, 7]);
  });
});

describe('UI 边界情况', () => {
  it('空手牌应该正确处理', () => {
    const layout = new HandAreaLayout();
    const positions = layout.calculateGridLayout(0);
    
    expect(positions).toHaveLength(0);
  });

  it('超多手牌应该正确处理', () => {
    const layout = new HandAreaLayout();
    const positions = layout.calculateGridLayout(30);
    
    expect(positions).toHaveLength(30);
    // 30 张牌分 5 行，每行 6 张
    expect(positions[0].row).toBe(0);
    expect(positions[29].row).toBe(4);
  });

  it('重复选择同一张牌应该取消', () => {
    const animation = new CardSelectionAnimation();
    
    animation.toggleCard(0);
    animation.toggleCard(0);
    animation.toggleCard(0);
    
    expect(animation.getSelectedCards()).toEqual([0]);
  });

  it('非进贡阶段不能选牌', () => {
    const tribute = new TributeInterface();
    
    const result = tribute.selectCard(0);
    
    expect(result).toBe(false);
  });

  it('进贡确认后应该重置状态', () => {
    const tribute = new TributeInterface();
    
    tribute.startTribute('single', 1);
    tribute.selectCard(5);
    tribute.confirmTribute();
    
    expect(tribute.getState().isTributePhase).toBe(false);
    expect(tribute.getState().selectedCount).toBe(0);
  });
});

describe('响应式布局', () => {
  it('应该适配 iPad 分辨率', () => {
    const iPadLayout = new HandAreaLayout(768);
    const positions = iPadLayout.calculateGridLayout(25);
    
    // iPad 屏幕宽，牌应该更居中
    expect(positions[0].x).toBeGreaterThan(100);
  });

  it('应该适配 Android 常见分辨率', () => {
    const androidLayout = new HandAreaLayout(360);
    const positions = androidLayout.calculateGridLayout(25);
    
    expect(positions).toHaveLength(25);
    expect(positions[0].x).toBeGreaterThanOrEqual(0);
  });
});