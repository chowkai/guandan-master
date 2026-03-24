# 组件库文档

## 组件概览

| 组件名 | 说明 | 尺寸 | 状态 |
|--------|------|------|------|
| Card | 卡牌组件 | 80×112px / 70×98px | ✅ |
| Player | 玩家信息组件 | 自适应 | ✅ |
| Button | 按钮组件 | 自适应 | ✅ |
| HandArea | 手牌区组件 | 5 行网格 | ✅ |
| PlayArea | 出牌区组件 | 自适应 | ✅ |

---

## Card 卡牌组件

### 功能特性

- 支持 4 种花色：红心 (♥)、方块 (♦)、黑桃 (♠)、梅花 (♣)
- 支持王牌：小王 (BJ)、大王 (RJ)
- 可选尺寸：标准 (80×112px) / 紧凑 (70×98px)
- 选中/出牌动画效果
- 可禁用状态

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| suit | String | 'heart' | 花色：heart/diamond/spade/club/joker |
| value | String | 'A' | 牌面值：A/2-10/J/Q/K/BJ/RJ |
| isSelected | Boolean | false | 是否选中 |
| isPlayable | Boolean | true | 是否可出 |
| cardWidth | Number | 80 | 卡牌宽度 (px) |
| cardHeight | Number | 112 | 卡牌高度 (px) |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| cardtap | {suit, value, isSelected} | 点击卡牌时触发 |

### 使用示例

```html
<!-- 标准红心 A -->
<card suit="heart" value="A" />

<!-- 选中的黑桃 K -->
<card suit="spade" value="K" isSelected="{{true}}" />

<!-- 紧凑尺寸 (手牌区) -->
<card suit="diamond" value="10" cardWidth="70" cardHeight="98" />

<!-- 大王 -->
<card suit="joker" value="RJ" />

<!-- 绑定点击事件 -->
<card 
  suit="heart" 
  value="A" 
  bind:cardtap="onCardTap" 
/>
```

### 布局设计

```
┌─────────────────┐
│ A               │  ← 左上角：字 + 花竖排
│ ♥               │
│                 │
│           ♥     │  ← 中间：花色偏右下
│                 │
│                 │  ← 右下角：留空
└─────────────────┘
```

---

## Player 玩家信息组件

### 功能特性

- 头像显示
- 玩家名称
- 剩余牌数角标
- 地主标识
- 出牌状态指示器
- 支持 4 个位置：top/left/right/bottom

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| playerId | String | '' | 玩家唯一 ID |
| playerName | String | '玩家' | 玩家名称 |
| avatarUrl | String | '' | 头像 URL |
| cardCount | Number | 0 | 剩余牌数 |
| isSelf | Boolean | false | 是否是自己 |
| isLandlord | Boolean | false | 是否是地主 |
| position | String | 'bottom' | 位置：top/left/right/bottom |

### 使用示例

```html
<!-- 自己 (底部) -->
<player
  player-id="player1"
  player-name="我"
  avatar-url="{{userInfo.avatarUrl}}"
  card-count="27"
  is-self="{{true}}"
  position="bottom"
/>

<!-- 对家 (顶部) -->
<player
  player-id="player3"
  player-name="对家"
  card-count="25"
  position="top"
/>

<!-- 上家 (左侧) -->
<player
  player-id="player2"
  player-name="上家"
  card-count="26"
  position="left"
/>

<!-- 下家 (右侧) -->
<player
  player-id="player4"
  player-name="下家"
  card-count="24"
  position="right"
/>
```

### 剩余牌数颜色

- **绿色** (>10 张): `var(--active-green)`
- **黄色** (5-10 张): `var(--yellow)`
- **红色** (≤5 张): `var(--red)`

---

## Button 按钮组件

### 功能特性

- 多种类型：主按钮/次要按钮/操作按钮/危险按钮
- 三种尺寸：small/medium/large
- 加载状态
- 禁用状态
- 全屏宽度支持

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | String | 'primary' | 类型：primary/secondary/action/danger/warning |
| text | String | '按钮' | 按钮文字 |
| disabled | Boolean | false | 是否禁用 |
| loading | Boolean | false | 是否加载中 |
| size | String | 'medium' | 尺寸：small/medium/large |
| block | Boolean | false | 是否全屏宽度 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| tap | {type, text} | 点击按钮时触发 |

### 使用示例

```html
<!-- 主按钮 -->
<button type="primary" text="开始游戏" bind:tap="onStartGame" />

<!-- 次要按钮 -->
<button type="secondary" text="取消" />

<!-- 操作按钮 -->
<button type="action" text="出牌" />

<!-- 危险按钮 -->
<button type="danger" text="退出房间" />

<!-- 加载状态 -->
<button type="primary" text="加载中" loading="{{true}}" />

<!-- 禁用状态 -->
<button type="primary" text="不可点击" disabled="{{true}}" />

<!-- 全屏宽度 -->
<button type="primary" text="确认" block="{{true}}" />

<!-- 小尺寸 -->
<button type="primary" text="确定" size="small" />
```

---

## HandArea 手牌区组件

### 功能特性

- 5 行网格布局 (5 列 × 5 行)
- 紧凑尺寸：70×98px
- 牌间距：10px
- 点击选牌
- 出牌动画
- 批量操作支持

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cards | Array | [] | 手牌数组 [{suit, value}] |
| selectedCards | Array | [] | 已选中的牌 |
| maxRows | Number | 5 | 最大行数 |
| maxCols | Number | 5 | 最大列数 |
| cardWidth | Number | 70 | 卡牌宽度 (px) |
| cardHeight | Number | 98 | 卡牌高度 (px) |
| cardGap | Number | 10 | 牌间距 (px) |
| canPlay | Boolean | true | 是否可操作 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| cardselect | {suit, value, isSelected} | 选牌时触发 |

### 使用示例

```html
<hand-area
  cards="{{myCards}}"
  selected-cards="{{selectedCards}}"
  can-play="{{canPlay}}"
  bind:cardselect="onCardSelect"
/>
```

### 布局示意

```
┌─────────────────────────────────┐
│ [♠A] [♠K] [♠Q] [♠J] [♠10]      │  ← 第 1 行
│ [♥A] [♥K] [♥Q] [♥J] [♥10]      │  ← 第 2 行
│ [♦A] [♦K] [♦Q] [♦J] [♦10]      │  ← 第 3 行
│ [♣A] [♣K] [♣Q] [♣J] [♣10]      │  ← 第 4 行
│ [🃏] [2]  [3]  [4]  [5]        │  ← 第 5 行
└─────────────────────────────────┘
```

---

## PlayArea 出牌区组件

### 功能特性

- 当前出牌显示
- 历史记录 (可折叠)
- 牌型识别
- 轮次显示
- 玩家名称显示

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| playHistory | Array | [] | 出牌历史记录 |
| currentPlay | Array | [] | 当前出牌 |
| isExpanded | Boolean | false | 是否展开 |
| maxVisibleRounds | Number | 5 | 最大可见轮数 |
| showPlayerName | Boolean | true | 显示玩家名称 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| expandchange | {isExpanded} | 展开状态变化时触发 |

### 使用示例

```html
<play-area
  play-history="{{playHistory}}"
  current-play="{{currentPlay}}"
  is-expanded="{{false}}"
  bind:expandchange="onExpandChange"
/>
```

### 数据结构

```typescript
// 出牌记录
interface IPlayRecord {
  round: number;          // 轮次
  playerName: string;     // 玩家名称
  playType: string;       // 牌型：single/pair/bomb/...
  cards: ICard[];         // 出的牌
}
```

### 支持的牌型

| 牌型 | 说明 | 示例 |
|------|------|------|
| single | 单张 | A |
| pair | 对子 | AA |
| triple | 三张 | AAA |
| bomb | 炸弹 | AAAA |
| straight | 顺子 | 34567 |
| consecutive_pairs | 连对 | 334455 |
| airplane | 飞机 | 333444 |
| full_house | 葫芦 | 33344 |
| four_with_two | 四带二 | 333344 |

---

## 色彩规范

### 主色调

```css
--deep-green: #1a472a;     /* 牌桌背景 */
--light-green: #2d5a3f;    /* 边框/强调 */
--active-green: #34c759;   /* 成功/可出牌 */
```

### 辅助色

```css
--white: #ffffff;
--yellow: #ffc107;         /* 高亮/提醒 */
--red: #d32f2f;            /* 红心/错误 */
--gray: #8a8a8a;           /* 次要文字 */
```

### 花色颜色

```css
--heart-red: #d32f2f;
--diamond-red: #d32f2f;
--spade-black: #212121;
--club-black: #212121;
```

---

## 动画效果

### 选牌动画

```css
@keyframes cardSelect {
  0% { transform: translateY(0); }
  100% { transform: translateY(-20rpx); }
}
```

### 出牌动画

```css
@keyframes cardPlay {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: translateY(-200rpx) scale(0.8); }
}
```

### 脉冲动画 (状态指示器)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
```

---

## 最佳实践

### 1. 组件复用

所有组件都设计为可复用，通过属性控制行为：

```html
<!-- 同一组件，不同场景 -->
<card suit="heart" value="A" cardWidth="80" cardHeight="112" />
<card suit="heart" value="A" cardWidth="70" cardHeight="98" />
```

### 2. 事件处理

统一事件命名规范：

- 点击：`tap` / `cardtap`
- 变化：`change` / `expandchange`
- 选择：`select` / `cardselect`

### 3. 样式隔离

每个组件样式独立，避免全局污染：

```css
/* 组件内部样式 */
.card-container { ... }

/* 使用 CSS 变量保持主题一致 */
background: var(--deep-green);
```

### 4. 性能优化

- 避免频繁 setData
- 使用 wx:if 条件渲染
- 列表使用 wx:key
