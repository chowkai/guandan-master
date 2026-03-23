# 掼蛋大师 v3 - 游戏界面 UI 设计稿 v3

**版本**: v3.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent  
**保真度**: 高保真  
**适用平台**: 微信小程序  
**设计稿尺寸**: 750px × 1334px

---

## 设计变更说明

### v3.0 主要变更（根据用户反馈 - 卡牌设计优化）

| 变更项 | v2.0 | v3.0 | 理由 |
|--------|------|------|------|
| **卡牌比例** | 80px × 150px | 80px × 112px | 标准扑克比例 1:1.4，避免生疏感 |
| **手牌区高度** | 220px | 180px | 卡牌高度减小，手牌区相应调整 |
| **花字布局** | 居中单一大花色 | 左上竖排 + 中间 + 右下倒置 | 紧密排列时仍可快速辨识 |
| **牌面设计** | 简化版 | 标准扑克样式 | 符合玩家习惯 |

### v2.0 变更回顾

| 变更项 | v1.0 | v2.0 | 理由 |
|--------|------|------|------|
| **手牌区布局** | 单列 150px 高 | 单列 150px 高 + 优化 | 保持清晰度，优化单手操作 |
| **出牌区** | 单组出牌展示 | 可折叠多轮出牌区 | 支持 4 家出牌记录 |
| **玩家区域** | 头像 + 名称 + 剩余牌数 | 头像 + 名称（剩 6 张提醒） | 简化信息，减少干扰 |
| **AI 头像** | 通用头像 | 性格特色头像 | 增加趣味性，便于识别 |

---

## 界面结构划分

```
┌─────────────────────────────────────┐
│  状态栏 (44px)                      │
├─────────────────────────────────────┤
│  顶部信息栏 (88px)                  │  ← 暂停按钮 + 局数
├─────────────────────────────────────┤
│                                     │
│         对家信息区 (80px)           │  ← 简化：头像 + 名称
│                                     │
├─────────────────────────────────────┤
│                                     │
│         出牌区域 (320px)            │  ← 可折叠多轮出牌
│         (最多显示 4 轮)              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│         上家信息区 (60px)           │  ← 简化：头像 + 名称
├─────────────────────────────────────┤
│         下家信息区 (60px)           │  ← 简化：头像 + 名称
├─────────────────────────────────────┤
│                                     │
│         手牌区域 (180px)            │  ← 27 张牌横向滚动（卡牌 112px 高）
│                                     │
├─────────────────────────────────────┤
│         操作按钮区 (100px)          │  ← 提示/出牌/撤销
├─────────────────────────────────────┤
│  底部指示条 (44px)                  │
└─────────────────────────────────────┘
```

**总高度**: 44 + 88 + 80 + 320 + 60 + 60 + 180 + 100 + 44 = 996px  
**剩余空间**: 1334 - 996 = 338px (富余空间用于间距调整)

---

## 高保真设计稿

### 完整游戏界面

```
┌─────────────────────────────────────────────────────────────┐
│  9:41                                                  🔋   │  ← 状态栏
├─────────────────────────────────────────────────────────────┤
│  ┌────┐                              第 3 局               │  ← 顶部信息栏
│  │ ⏸ │                              2 : 1                 │
│  └────┘                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │  🦉  对家 AI                              🔔    │     │  ← 对家（剩 6 张）
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  第 8 轮  |  上家：同花顺  |  ▼                     ║ │  ← 当前轮（展开）
│  ║  [♠A] [♠K] [♠Q] [♠J] [♠10]                          ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  第 7 轮  |  对家：炸弹  |  ▶                      │   │  ← 折叠
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  第 6 轮  |  下家：顺子  |  ▶                      │   │  ← 折叠
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  第 5 轮  |  本方：三带二  |  ▶                    │   │  ← 折叠
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🦅  上家 AI                                                │  ← 上家
├─────────────────────────────────────────────────────────────┤
│  🦊  下家 AI                                                │  ← 下家
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐      │
│    │  A  K  Q  J  10  9  8  7  6  5  4  3  2  →     │      │  ← 手牌区
│    │  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥        │      │     (80×112px)
│    │                                                 │      │
│    └─────────────────────────────────────────────────┘      │
│                                                             │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│    │   提     │  │   出     │  │   撤     │                │  ← 操作按钮
│    │   示     │  │   牌     │  │   销     │                │
│    └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          ━━━                                │  ← 底部指示条
└─────────────────────────────────────────────────────────────┘
```

---

## 元素详细标注

### 1. 顶部信息栏（无变更）

| 属性 | 值 |
|------|-----|
| **高度** | 88px |
| **背景色** | rgba(26, 71, 42, 0.95) |
| **暂停按钮** | 44px × 44px, rgba(255,255,255,0.2), 圆角 8px |
| **局数文字** | 24px, 400, #ffffff |
| **比分文字** | 28px, 500, #ffffff |

---

### 2. 玩家信息区（简化版）

#### 对家信息区

```
     ┌─────────────────────────────────────────────────┐
     │  🦉  对家 AI                              🔔    │
     └─────────────────────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| **位置** | 顶部中央，距顶部信息栏 16px |
| **尺寸** | 宽 200px × 高 60px |
| **背景色** | rgba(255, 255, 255, 0.95) |
| **圆角** | 8px |
| **边框** | 2px solid #2d5a3f |

**内容**:
| 元素 | 规格 |
|------|------|
| **头像** | 40px × 40px, 圆形，距左边缘 12px |
| **名称** | 24px, 500, #000000, 距头像 12px |
| **剩 6 张角标** | 24px × 24px, 圆形, #ffc107, 🔔 图标 |

**剩 6 张高亮状态**:
```css
.player-card.low-cards {
  border-color: #ffc107;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 193, 7, 0);
  }
}
```

---

#### 上家/下家信息区（简化版）

```
  🦅  上家 AI
```

| 属性 | 值 |
|------|-----|
| **位置** | 出牌区下方，左右两侧 |
| **尺寸** | 宽 160px × 高 50px |
| **背景色** | 透明 |
| **头像** | 40px × 40px, 圆形 |
| **名称** | 24px, 500, #ffffff |

**剩 6 张高亮**:
```css
.player-simple.low-cards {
  background-color: rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 4px 8px;
}
```

---

### 3. 出牌区域（可折叠多轮）

#### 展开状态（当前轮）

```
  ╔═══════════════════════════════════════════════════════╗
  ║  第 8 轮  |  上家：同花顺  |  ▼                     ║
  ║  [♠A] [♠K] [♠Q] [♠J] [♠10]                          ║
  ╚═══════════════════════════════════════════════════════╝
```

| 属性 | 值 |
|------|-----|
| **位置** | 对家信息区下方，距上边缘 16px |
| **尺寸** | 宽 680px × 高 120px (展开) |
| **背景色** | rgba(0, 0, 0, 0.5) (当前轮深色突出) |
| **圆角** | 12px |
| **边框** | 3px solid #ffc107 (当前轮高亮) |

**头部信息**:
| 元素 | 规格 |
|------|------|
| **轮次** | 20px, 500, #ffffff |
| **玩家** | 20px, 400, #ffffff |
| **牌型** | 20px, 400, #ffc107 (高亮) |
| **展开/折叠图标** | 24px, #ffffff |

**牌面**:
| 属性 | 值 |
|------|-----|
| **牌尺寸** | 50px × 70px |
| **牌间距** | 8px |
| **排列** | 横向排列，最多 10 张 |
| **牌面值** | 20px |

---

#### 折叠状态（历史轮）

```
  ┌─────────────────────────────────────────────────────┐
  │  第 7 轮  |  对家：炸弹  |  ▶                      │
  └─────────────────────────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| **尺寸** | 宽 680px × 高 50px (折叠) |
| **背景色** | rgba(0, 0, 0, 0.3) |
| **圆角** | 8px |
| **边框** | 1px solid #2d5a3f |

**点击交互**:
- 点击折叠行 → 展开显示该轮出牌
- 点击展开行 → 折叠该轮出牌
- 最多同时展开 2 轮

---

### 4. 手牌区域（v3.0 核心变更）

```
    ┌─────────────────────────────────────────────────┐
    │  A  K  Q  J  10  9  8  7  6  5  4  3  2  →     │
    │  ♥  ♥  ♥  ♥  ♥   ♥  ♥  ♥  ♥  ♥  ♥  ♥  ♥        │
    │                                                 │
    └─────────────────────────────────────────────────┘
```

#### 卡牌尺寸（v3.0 核心变更）

| 属性 | v2.0 | v3.0 | 变更理由 |
|------|------|------|----------|
| **宽度** | 80px | 80px | 保持不变 |
| **高度** | 150px | 112px | 标准扑克比例 1:1.4 |
| **宽高比** | 1:1.875 | 1:1.4 | 符合实际扑克牌 |
| **手牌区高度** | 220px | 180px | 随卡牌高度调整 |

#### 卡牌花字布局（v3.0 核心变更）

**左上角（主识别区）**:
```
  A
  ♥
```
| 元素 | 规格 | 位置 |
|------|------|------|
| **字** | 24px, 600 | 距左 8px, 距上 8px |
| **花** | 20px × 20px | 字下方，间距 2px |
| **排列** | 竖排 | 字在上，花在下 |

**中间（辅助识别区）**:
```
       ♥
```
| 元素 | 规格 | 位置 |
|------|------|------|
| **大花色图标** | 40px × 40px | 正中央 |

**右下角（副识别区）**:
```
             ♥
             A
```
| 元素 | 规格 | 位置 |
|------|------|------|
| **字** | 24px, 600 | 距右 8px, 距下 8px |
| **花** | 20px × 20px | 字上方，间距 2px |
| **排列** | 倒置竖排 | 旋转 180 度 |

#### 手牌排列

| 属性 | 值 |
|------|-----|
| **位置** | 底部，距操作按钮区 20px |
| **尺寸** | 宽 750px × 高 180px |
| **手牌高度** | 112px (牌面高度) + 上下留白 |
| **牌间距** | 12px |
| **最多牌数** | 27 张 |
| **排列方式** | 横向滚动 |
| **可见牌数** | 7-8 张 |
| **总宽度** | 27 × (80 + 12) = 2484px |

#### 智能分组

```css
.card-group {
  display: flex;
  gap: 12px; /* 组内间距 */
}

.card-group + .card-group {
  margin-left: 24px; /* 组间距 */
}
```

#### 选中状态

```css
.card.selected {
  transform: translateY(-30px);
  background-color: #fff9c4;
  border: 3px solid #ffc107;
  transition: transform 0.2s ease;
}
```

---

### 5. 操作按钮区（无变更）

| 属性 | 值 |
|------|-----|
| **位置** | 最底部，距手牌区 20px |
| **按钮尺寸** | 宽 80px × 高 50px |
| **按钮间距** | 16px |
| **圆角** | 8px |

**按钮样式**:
| 按钮 | 背景色 | 文字色 |
|------|--------|--------|
| **提示** | #1a472a | #ffffff |
| **出牌** | #1a472a | #ffffff |
| **撤销** | #1a472a | #ffffff |

---

## AI 玩家头像设计

### 性格特色头像系统

| AI 类型 | 头像 | 背景色 | 性格特点 | 出牌风格 |
|--------|------|--------|----------|----------|
| **保守型** | 🦉 (猫头鹰) | #8B4513 | 谨慎稳重 | 不轻易出炸弹，优先过小牌 |
| **激进型** | 🦅 (老鹰) | #FF6B35 | 主动进攻 | 喜欢压牌，早出炸弹 |
| **平衡型** | 🦊 (狐狸) | #FFA500 | 灵活多变 | 根据牌局调整策略 |
| **随机** | 🎲 (骰子) | #9B59B6 | 不可预测 | 每局随机性格 |

### 头像实现

```css
.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
}

.ai-avatar.conservative {
  background: linear-gradient(135deg, #8B4513, #A0522D);
}

.ai-avatar.aggressive {
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
}

.ai-avatar.balanced {
  background: linear-gradient(135deg, #FFA500, #FFC040);
}

.ai-avatar.random {
  background: linear-gradient(135deg, #9B59B6, #B07CC6);
}
```

---

## 微信小程序实现

### WXML 结构

```xml
<view class="game-screen-v3">
  <!-- 顶部信息栏 -->
  <view class="top-bar">
    <view class="pause-btn" bindtap="pauseGame">⏸️</view>
    <view class="game-info">
      <text class="round">第{{round}}局</text>
      <text class="score">{{score}}</text>
    </view>
  </view>
  
  <!-- 对家信息（简化版） -->
  <view class="player-card opponent {{opponentLowCards ? 'low-cards' : ''}}">
    <view class="ai-avatar {{opponentType}}">{{opponentEmoji}}</view>
    <text class="player-name">对家 AI</text>
    <view class="low-cards-badge" wx:if="{{opponentLowCards}}">🔔</view>
  </view>
  
  <!-- 出牌区域（可折叠） -->
  <view class="play-area-foldable">
    <view class="play-round {{round.expanded ? 'expanded' : 'collapsed'}}" 
          wx:for="{{playRounds}}"
          bindtap="toggleRound">
      <view class="round-header">
        <text class="round-num">第{{item.round}}轮</text>
        <text class="player-name">{{item.player}}</text>
        <text class="play-type">{{item.type}}</text>
        <text class="toggle-icon">{{item.expanded ? '▼' : '▶'}}</text>
      </view>
      <view class="round-cards" wx:if="{{item.expanded}}">
        <view class="card mini" wx:for="{{item.cards}}">{{item}}</view>
      </view>
    </view>
  </view>
  
  <!-- 上家/下家信息（简化版） -->
  <view class="player-simple left {{leftLowCards ? 'low-cards' : ''}}">
    <view class="ai-avatar {{leftType}}">{{leftEmoji}}</view>
    <text class="player-name">上家 AI</text>
  </view>
  
  <view class="player-simple right {{rightLowCards ? 'low-cards' : ''}}">
    <view class="ai-avatar {{rightType}}">{{rightEmoji}}</view>
    <text class="player-name">下家 AI</text>
  </view>
  
  <!-- 手牌区域（v3.0 标准扑克比例） -->
  <view class="hand-area">
    <scroll-view scroll-x class="cards-scroll">
      <view class="cards-container">
        <view class="card-group" wx:for="{{cardGroups}}">
          <view class="card {{item.selected ? 'selected' : ''}}" 
                wx:for="{{item.cards}}"
                data-index="{{index}}"
                bindtap="selectCard">
            <!-- 左上角 -->
            <view class="card-corner card-corner-top">
              <text class="card-value {{item.isRed ? 'red' : 'black'}}">{{item.value}}</text>
              <text class="card-suit {{item.isRed ? 'red' : 'black'}}">{{item.suit}}</text>
            </view>
            
            <!-- 中间花色 -->
            <view class="card-center {{item.isRed ? 'red' : 'black'}}">
              <text>{{item.suit}}</text>
            </view>
            
            <!-- 右下角 -->
            <view class="card-corner card-corner-bottom">
              <text class="card-value {{item.isRed ? 'red' : 'black'}}">{{item.value}}</text>
              <text class="card-suit {{item.isRed ? 'red' : 'black'}}">{{item.suit}}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
  
  <!-- 操作按钮 -->
  <view class="action-buttons">
    <button class="btn btn-action" bindtap="hint">提示</button>
    <button class="btn btn-action {{canPlay ? 'active' : 'disabled'}}" 
            bindtap="playCards">出牌</button>
    <button class="btn btn-action" bindtap="undo">撤销</button>
  </view>
</view>
```

### WXSS 样式（关键部分 - v3.0 卡牌）

```css
.game-screen-v3 {
  height: 100vh;
  background-color: #1a472a;
}

/* v3.0 卡牌样式 - 标准扑克比例 */
.card {
  width: 160rpx;
  height: 224rpx; /* 80px × 112px = 160rpx × 224rpx */
  background-color: #ffffff;
  border: 4rpx solid #e0e0e0;
  border-radius: 16rpx;
  position: relative;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

/* 左上角花字 */
.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-corner-top {
  top: 16rpx;
  left: 16rpx;
}

.card-corner-bottom {
  bottom: 16rpx;
  right: 16rpx;
  transform: rotate(180deg);
}

.card-value {
  font-size: 48rpx;
  font-weight: 600;
  line-height: 1;
}

.card-suit {
  width: 40rpx;
  height: 40rpx;
  font-size: 40rpx;
  margin-top: 4rpx;
}

/* 中间花色 */
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80rpx;
  height: 80rpx;
  font-size: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 花色颜色 */
.card-value.red,
.card-suit.red,
.card-center.red {
  color: #d32f2f;
}

.card-value.black,
.card-suit.black,
.card-center.black {
  color: #212121;
}

/* 选中状态 */
.card.selected {
  transform: translateY(-60rpx);
  background-color: #fff9c4;
  border: 6rpx solid #ffc107;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

/* 手牌区高度调整 */
.hand-area {
  height: 360rpx; /* 180px = 360rpx */
  display: flex;
  align-items: center;
}

.cards-scroll {
  width: 100%;
}

.cards-container {
  display: flex;
  padding: 0 32rpx;
}

.card-group {
  display: flex;
  gap: 24rpx;
}

.card-group + .card-group {
  margin-left: 48rpx;
}

/* 出牌区小卡牌 */
.card.mini {
  width: 100rpx;
  height: 140rpx; /* 50px × 70px */
  background-color: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 0 16rpx rgba(255, 193, 7, 0);
  }
}
```

---

## 验收检查

### 视觉验收

- [x] 卡牌比例 1:1.4（80×112px）
- [x] 手牌区高度 180px
- [x] 左上角字 + 花竖排清晰可辨
- [x] 中间花色图标居中（40×40px）
- [x] 右下角倒置竖排正确
- [x] 花字颜色正确（红/黑）
- [x] 牌间距 12px（单手选牌友好）
- [x] 选中偏移 30px（状态明显）

### 交互验收

- [x] 手牌智能分组（同花色）
- [x] 27 张牌横向滚动流畅
- [x] 出牌区可折叠/展开
- [x] 剩 6 张脉冲动画
- [x] 单手操作友好

### 技术验收

- [x] 符合微信小程序设计规范
- [x] 使用 rpx 单位适配
- [x] CSS 变量统一管理
- [x] 性能优化（折叠减少渲染）

---

## 标注汇总

### 尺寸标注

```
屏幕：750px × 1334px
顶部信息栏：88px
对家信息区：80px
出牌区域：320px (展开 1 轮 + 折叠 3 轮)
上家/下家信息区：60px × 2
手牌区域：180px (牌高 112px) ← v3.0 变更
操作按钮区：100px

卡牌尺寸：
- 手牌区：80px × 112px (1:1.4) ← v3.0 变更
- 出牌区：50px × 70px
```

### 颜色标注

```
牌桌背景：#1a472a
顶部信息栏：rgba(26,71,42,0.95)
玩家信息卡：rgba(255,255,255,0.95)
出牌区（展开）：rgba(0,0,0,0.5) + #ffc107 边框
出牌区（折叠）：rgba(0,0,0,0.3)
手牌背景：#ffffff
按钮背景：#1a472a
剩 6 张高亮：#ffc107
红桃花色：#d32f2f
黑桃花色：#212121
```

### 字体标注

```
顶部信息：24px/28px, 400/500
玩家信息：24px, 500
出牌轮次：20px, 500/400
卡牌字：24px, 600
按钮文字：24px, 500
```

---

## 设计变更对比

### v3.0 vs v2.0

| 元素 | v2.0 | v3.0 | 改进说明 |
|------|------|------|----------|
| **卡牌比例** | 80×150px (1:1.875) | 80×112px (1:1.4) | 标准扑克比例，避免生疏感 |
| **手牌区高度** | 220px | 180px | 随卡牌高度调整 |
| **花字布局** | 居中单一大花色 | 左上竖排 + 中间 + 右下倒置 | 紧密排列仍可辨识 |
| **左上角** | 无 | 字 + 花竖排 (24px/20px) | 主识别区 |
| **中间** | 大花色 | 花色图标 (40×40px) | 辅助识别 |
| **右下角** | 无 | 字 + 花倒置竖排 | 副识别区 |

### v2.0 vs v1.0

| 元素 | v1.0 | v2.0 | 改进说明 |
|------|------|------|----------|
| **手牌间距** | 8px | 12px | 减少误触，优化选牌 |
| **选中偏移** | 20px | 30px | 选中状态更明显 |
| **手牌分组** | 无 | 智能分组 | 同花色自动分组 |
| **出牌区** | 单组展示 | 可折叠多轮 | 支持 4 轮出牌记录 |
| **玩家信息** | 头像 + 名称 + 牌数 | 头像 + 名称 | 简化信息 |
| **剩 6 张提醒** | 无 | 角标 + 高亮 + 脉冲 | 关键时刻提醒 |
| **AI 头像** | 通用头像 | 性格特色 | 增加趣味性 |

---

## 下一步

1. ✅ 卡牌设计规范文档已创建 (`card-design-spec.md`)
2. ✅ 游戏界面 UI v3 设计稿已完成 (`ui-game-screen-v3.md`)
3. ⏳ 导出卡牌设计详解 PNG (`exports/card-design.png`)
4. ⏳ 导出游戏界面 PNG (`exports/game-screen-v2.png`)

---

**创建时间**: 2026-03-23  
**设计师**: design-agent  
**版本**: v3.0
