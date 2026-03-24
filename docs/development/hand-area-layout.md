# 手牌区布局实现文档

## 概述

手牌区采用 **5 行网格布局**，用于展示玩家的 27 张手牌。设计考虑了移动端屏幕空间限制，同时保证卡牌清晰可辨、易于操作。

---

## 布局规格

### 网格参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 列数 | 5 列 | 每行最多 5 张牌 |
| 行数 | 5 行 | 最多容纳 25 张牌 (第 5 行可放剩余牌) |
| 卡牌尺寸 | 70×98px | 紧凑尺寸，1:1.4 比例 |
| 牌间距 | 10px | 横向间距 |
| 行间距 | 20rpx | 纵向间距 |

### 尺寸计算

```
总宽度 = 5 × 70px + 4 × 10px = 350px + 40px = 390px
总高度 ≈ 5 × 98px + 4 × 20rpx ≈ 490px + 80rpx ≈ 600rpx
```

### 适配说明

- 使用 `rpx` (responsive pixel) 单位
- 750rpx = 屏幕宽度
- 自动适配不同屏幕尺寸

---

## 布局实现

### WXML 结构

```html
<view class="hand-area-container">
  <view class="hand-area-grid" style="{{getGridStyle()}}">
    <!-- 5 行网格布局 -->
    <view 
      class="hand-row" 
      wx:for="{{gridRows}}" 
      wx:key="index"
      style="{{getRowStyle()}}"
    >
      <!-- 每行的卡牌 -->
      <card
        wx:for="{{item}}"
        wx:key="*this"
        class="hand-card"
        suit="{{item.suit}}"
        value="{{item.value}}"
        isSelected="{{isCardSelected(item.suit, item.value)}}"
        isPlayable="{{canPlay}}"
        cardWidth="{{cardWidth}}"
        cardHeight="{{cardHeight}}"
        bind:cardtap="onCardTap"
      />
    </view>
  </view>
</view>
```

### TypeScript 逻辑

```typescript
/**
 * 计算网格布局
 */
calculateGrid(cards: any[]) {
  const { maxRows, maxCols } = this.data;
  const gridRows: any[][] = [];
  
  // 将卡牌分配到 5 行中
  for (let i = 0; i < maxRows; i++) {
    const start = i * maxCols;
    const end = Math.min(start + maxCols, cards.length);
    if (start >= cards.length) break;
    
    gridRows.push(cards.slice(start, end));
  }
  
  this.setData({ gridRows });
}

/**
 * 获取网格容器样式
 */
getGridStyle(): string {
  const { maxCols, cardWidth, cardGap } = this.data;
  const totalWidth = maxCols * cardWidth + (maxCols - 1) * cardGap;
  
  return `
    width: ${totalWidth}px;
    gap: ${cardGap}px;
  `;
}
```

### WXSS 样式

```css
.hand-area-container {
  position: relative;
  padding: var(--spacing-md);
  background: rgba(26, 71, 42, 0.3);
  border-radius: var(--radius-lg);
  min-height: 600rpx;
}

/* 网格容器 */
.hand-area-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 每一行 */
.hand-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  min-height: 110rpx;
}

/* 手牌 */
.hand-card {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
```

---

## 交互设计

### 选牌逻辑

1. **点击选牌**: 点击卡牌切换选中状态
2. **选中标记**: 选中的牌向上偏移 20rpx
3. **批量操作**: 支持多选后统一出牌

```typescript
onCardTap(event: WechatMiniprogram.CustomEvent) {
  if (!this.data.canPlay) return;
  
  const { suit, value, isSelected } = event.detail;
  
  // 触发选牌事件
  this.triggerEvent('cardselect', {
    suit,
    value,
    isSelected
  });
}
```

### 出牌动画

```css
@keyframes cardPlayOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateY(-100rpx);
  }
}

.hand-card.playing-out {
  animation: cardPlayOut 0.3s ease forwards;
}
```

### 收牌动画

```css
@keyframes cardDealIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(100rpx);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.hand-card.deal-in {
  animation: cardDealIn 0.3s ease forwards;
}
```

---

## 响应式适配

### 小屏幕适配

```css
@media (max-width: 750rpx) {
  .hand-row {
    gap: 6px;
  }
  
  .hand-card {
    transform: scale(0.9);
  }
}
```

### 卡牌尺寸调整

根据屏幕宽度动态调整:

```typescript
getCardSize(): { width: number; height: number } {
  const systemInfo = wx.getSystemInfoSync();
  const screenWidth = systemInfo.screenWidth;
  
  if (screenWidth < 375) {
    return { width: 60, height: 84 };
  } else if (screenWidth < 414) {
    return { width: 70, height: 98 };
  } else {
    return { width: 80, height: 112 };
  }
}
```

---

## 视觉设计

### 背景设计

```css
.hand-area-container {
  background: rgba(26, 71, 42, 0.3);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}
```

### 选中效果

```css
.hand-card /deep/ .card-container.selected {
  transform: translateY(-20rpx);
  box-shadow: 0 -8rpx 16rpx rgba(0, 0, 0, 0.3);
  z-index: 10;
}
```

### 可出牌提示

```css
.hand-card.playable /deep/ .card-container {
  box-shadow: 0 0 16rpx rgba(52, 199, 89, 0.3);
}
```

---

## 性能优化

### 1. 列表渲染优化

使用 `wx:key` 提升渲染性能:

```html
<card
  wx:for="{{item}}"
  wx:key="*this"  <!-- 使用整个对象作为 key -->
  ...
/>
```

### 2. 条件渲染

空状态使用 `wx:if`:

```html
<view class="hand-area-empty" wx:if="{{cards.length === 0}}">
  <text>暂无手牌</text>
</view>
```

### 3. 避免频繁 setData

批量更新数据:

```typescript
// ❌ 避免：多次 setData
this.setData({ selectedCards: newSelected });
this.setData({ canPlay: false });
this.setData({ currentPlay: cards });

// ✅ 推荐：一次 setData
this.setData({
  selectedCards: newSelected,
  canPlay: false,
  currentPlay: cards
});
```

---

## 布局示意

### 完整手牌区 (27 张牌)

```
┌─────────────────────────────────────────┐
│                                         │
│  [♠A] [♠K] [♠Q] [♠J] [♠10]              │  ← Row 1
│  [♥A] [♥K] [♥Q] [♥J] [♥10]              │  ← Row 2
│  [♦A] [♦K] [♦Q] [♦J] [♦10]              │  ← Row 3
│  [♣A] [♣K] [♣Q] [♣J] [♣10]              │  ← Row 4
│  [🃏] [2]  [3]  [4]  [5]                │  ← Row 5
│                                         │
└─────────────────────────────────────────┘
```

### 选中状态

```
┌─────────────────────────────────────────┐
│                                         │
│  [♠A] [♠K] [♠Q] [♠J] [♠10]              │
│       ↑                                  │
│    选中的牌向上偏移                       │
│                                         │
└─────────────────────────────────────────┘
```

### 出牌动画

```
出牌前: [♠A] [♠K] [♠Q]
        ↓
出牌中:      ↑ ↑ ↑
            (飞起并淡出)
        ↓
出牌后: [ ]  [ ]  [ ]
```

---

## 技术细节

### 卡牌花字布局

```
┌─────────────────┐
│ A               │  ← 左上角：字 + 花竖排
│ ♥               │
│                 │
│           ♥     │  ← 中间：花色偏右下
│                 │
│                 │  ← 右下角：完全留空
└─────────────────┘
```

实现代码:

```html
<!-- 左上角 -->
<view class="card-corner-top-left">
  <text class="card-value">{{value}}</text>
  <text class="card-suit">{{getSuitSymbol()}}</text>
</view>

<!-- 中间 -->
<view class="card-center">
  <text class="card-suit-large">{{getSuitSymbol()}}</text>
</view>
```

### 王牌显示

```html
<view class="card-content joker" wx:if="{{isJoker()}}">
  <text class="card-value-joker">
    {{value === 'BJ' ? '小王' : '大王'}}
  </text>
</view>
```

---

## 测试要点

### 1. 功能测试

- [ ] 选牌功能正常
- [ ] 出牌动画流畅
- [ ] 收牌动画流畅
- [ ] 空状态显示正确

### 2. 兼容性测试

- [ ] iPhone 小屏 (375px)
- [ ] iPhone 标准屏 (414px)
- [ ] Android 各种分辨率
- [ ] iPad 大屏

### 3. 性能测试

- [ ] 27 张牌渲染流畅
- [ ] 选牌响应 < 100ms
- [ ] 出牌动画 60fps
- [ ] 内存占用合理

---

## 未来优化

### 1. 手势支持

- 滑动选牌
- 双击快速出牌
- 长按查看详情

### 2. 智能提示

- 可出牌高亮
- 推荐出牌提示
- 牌型识别辅助

### 3. 主题定制

- 卡牌背面图案
- 牌桌主题切换
- 音效配置

---

## 参考资源

- [微信小程序 Flex 布局](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/flex.html)
- [CSS Grid 布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [微信小程序动画](https://developers.weixin.qq.com/miniprogram/dev/framework/view/animation.html)
