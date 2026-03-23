# 掼蛋大师 v3 - 组件库

**版本**: v1.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent  
**适用平台**: 微信小程序

---

## 设计原则

1. **可复用** - 组件可在多个界面使用
2. **标准化** - 统一尺寸、颜色、交互
3. **易维护** - CSS 变量集中管理
4. **手机友好** - 符合微信最小点击规范 (44px)

---

## 按钮组件

### 1. 主按钮 (Primary Button)

**使用场景**: 开始游戏、继续游戏、确认操作

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                       ┃
┃           开    始    游    戏        ┃
┃                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 280px × 80px (宽×高) |
| **圆角** | 12px |
| **背景色** | #1a472a |
| **边框** | 2px solid #2d5a3f |
| **文字** | 32px, 500, #ffffff |
| **字间距** | 8px |

**状态**:
```css
.btn-primary {
  width: 560rpx;
  height: 160rpx;
  background-color: #1a472a;
  border: 4rpx solid #2d5a3f;
  border-radius: 24rpx;
  color: #ffffff;
  font-size: 64rpx;
  font-weight: 500;
  letter-spacing: 16rpx;
}

.btn-primary:active {
  background-color: #0f2f1d;
  border-color: #0f2f1d;
  transform: scale(0.98);
}

.btn-primary.disabled {
  background-color: #6a6a6a;
  border-color: #8a8a8a;
}
```

---

### 2. 次要按钮 (Secondary Button)

**使用场景**: P2P 联机、返回主菜单

```
┌───────────────────────────────────────┐
│                                       │
│          P2P    联    机              │
│                                       │
└───────────────────────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 280px × 60px |
| **圆角** | 10px |
| **背景色** | #ffffff |
| **边框** | 2px solid #8a8a8a |
| **文字** | 28px, 500, #1a472a |

**状态**:
```css
.btn-secondary {
  width: 560rpx;
  height: 120rpx;
  background-color: #ffffff;
  border: 4rpx solid #8a8a8a;
  border-radius: 20rpx;
  color: #1a472a;
  font-size: 56rpx;
  font-weight: 500;
}

.btn-secondary:active {
  background-color: #f5f5f5;
  border-color: #6a6a6a;
}
```

---

### 3. 操作按钮 (Action Button)

**使用场景**: 提示、出牌、撤销

```
┌──────────┐
│   提     │
│   示     │
└──────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 80px × 50px |
| **圆角** | 8px |
| **背景色** | #1a472a |
| **文字** | 24px, 500, #ffffff |

**状态**:
```css
.btn-action {
  width: 160rpx;
  height: 100rpx;
  background-color: #1a472a;
  border-radius: 16rpx;
  color: #ffffff;
  font-size: 48rpx;
  font-weight: 500;
}

.btn-action.active {
  background-color: #2d5a3f;
}

.btn-action.disabled {
  background-color: #6a6a6a;
  color: #e0e0e0;
}
```

---

### 4. 图标按钮 (Icon Button)

**使用场景**: 暂停、设置、关闭

```
┌────┐
│ ⏸ │
└────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 44px × 44px (最小点击区) |
| **图标** | 28px × 28px |
| **圆角** | 8px |
| **背景** | rgba(255,255,255,0.2) |

**状态**:
```css
.btn-icon {
  width: 88rpx;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon text {
  font-size: 56rpx;
  color: #ffffff;
}

.btn-icon:active {
  background-color: rgba(255, 255, 255, 0.3);
}
```

---

## 扑克牌组件

### 标准牌面

```
┌──────────────────┐
│ ♠ A              │
│                  │
│       ♠          │
│                  │
│              A ♠ │
└──────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 80px × 150px |
| **圆角** | 8px |
| **背景色** | #ffffff |
| **边框** | 1px solid #e0e0e0 |
| **牌面值** | 32px, 600 |
| **中央花色** | 48px |

**CSS 实现**:
```css
.card {
  width: 160rpx;
  height: 300rpx;
  background-color: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16rpx;
}

.card-value {
  font-size: 64rpx;
  font-weight: 600;
}

.card-value.black {
  color: #000000;
}

.card-value.red {
  color: #d32f2f;
}

.card-suit-center {
  font-size: 96rpx;
  align-self: center;
}
```

**花色颜色**:
```css
.suit-spade, .suit-club {
  color: #000000;
}

.suit-heart, .suit-diamond {
  color: #d32f2f;
}
```

---

### 牌面状态

**正常状态**:
```css
.card.normal {
  background-color: #ffffff;
  border-color: #e0e0e0;
}
```

**选中状态**:
```css
.card.selected {
  transform: translateY(-40rpx);
  background-color: #fff9c4;
  border: 4rpx solid #ffc107;
  transition: transform 0.2s ease;
}
```

**不可出状态**:
```css
.card.disabled {
  background-color: #f5f5f5;
  opacity: 0.6;
}
```

**可出提示状态**:
```css
.card.hint {
  animation: hintPulse 1s infinite;
}

@keyframes hintPulse {
  0%, 100% {
    border-color: #34c759;
  }
  50% {
    border-color: #2d5a3f;
  }
}
```

---

### 小王/大王

```
┌──────────────────┐
│ 🃏               │
│                  │
│       👑         │
│                  │
│              🃏 │
└──────────────────┘
```

**规格**: 与标准牌一致，中央使用 emoji 或 SVG 图标

---

## 信息卡片组件

### 玩家信息卡

```
┌─────────────────────┐
│     对家 AI         │
│   (剩余 8 张)        │
└─────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 200px × 60px |
| **圆角** | 8px |
| **背景色** | rgba(255,255,255,0.95) |
| **边框** | 2px solid #2d5a3f |

**CSS 实现**:
```css
.player-card {
  width: 400rpx;
  height: 120rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border: 4rpx solid #2d5a3f;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.player-name {
  font-size: 48rpx;
  font-weight: 500;
  color: #000000;
}

.player-cards {
  font-size: 40rpx;
  color: #4a4a4a;
}
```

---

### 结算卡片

```
┌─────────────────────┐
│  本局得分    +10    │
│  总得分      35     │
│  剩余牌数    0      │
│  用时        3:25   │
└─────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 300px × 160px |
| **圆角** | 12px |
| **背景色** | #ffffff |
| **边框** | 2px solid #2d5a3f |

**CSS 实现**:
```css
.score-card {
  width: 600rpx;
  height: 320rpx;
  background-color: #ffffff;
  border: 4rpx solid #2d5a3f;
  border-radius: 24rpx;
  padding: 32rpx;
}

.score-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.score-label {
  font-size: 48rpx;
  color: #4a4a4a;
}

.score-value {
  font-size: 48rpx;
  font-weight: 600;
  color: #000000;
}

.score-value.highlight {
  color: #34c759;
}
```

---

## 信息栏组件

### 顶部信息栏

```
┌─────────────────────────────────────────┐
│  ┌────┐              第 3 局            │
│  │ ⏸ │              2 : 1              │
│  └────┘                                │
└─────────────────────────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **高度** | 88px |
| **背景色** | rgba(26,71,42,0.95) |
| **内边距** | 左右 16px |

**CSS 实现**:
```css
.top-bar {
  height: 176rpx;
  background-color: rgba(26, 71, 42, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.game-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.round-text {
  font-size: 48rpx;
  color: #ffffff;
}

.score-text {
  font-size: 56rpx;
  font-weight: 500;
  color: #ffffff;
}
```

---

## 出牌区域组件

```
┌─────────────────────────────────────┐
│                                     │
│      [♠A] [♠K] [♠Q] [♠J] [♠10]     │
│      (同花顺)                       │
│                                     │
└─────────────────────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **尺寸** | 500px × 300px |
| **背景色** | rgba(0,0,0,0.3) |
| **圆角** | 12px |
| **边框** | 2px solid #2d5a3f |

**CSS 实现**:
```css
.play-area {
  width: 1000rpx;
  height: 600rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border: 4rpx solid #2d5a3f;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.played-cards {
  display: flex;
  gap: 16rpx;
}

.played-card {
  width: 120rpx;
  height: 180rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.play-type {
  margin-top: 32rpx;
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.8);
}
```

---

## 提示条组件

### 错误提示

```
┌─────────────────────────────┐
│  ❌ 不符合规则              │
│     请重新选择牌            │
└─────────────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **高度** | 60px |
| **背景色** | rgba(255,59,48,0.9) |
| **圆角** | 8px |
| **文字** | 24px, #ffffff |

**CSS 实现**:
```css
.error-toast {
  height: 120rpx;
  background-color: rgba(255, 59, 48, 0.9);
  border-radius: 16rpx;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-text {
  font-size: 48rpx;
  color: #ffffff;
}
```

---

## 遮罩层组件

### 暂停遮罩

```
全屏半透明黑色遮罩 + 居中内容
```

**规格**:
| 属性 | 值 |
|------|-----|
| **背景** | rgba(0,0,0,0.6) |
| **位置** | fixed, 全屏 |

**CSS 实现**:
```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-title {
  font-size: 64rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 80rpx;
}
```

---

## 弹窗组件

### 设置面板

```
┌─────────────────────────┐
│  设置                   │
├─────────────────────────┤
│  ☑ 音效开关             │
│  📖 规则说明             │
│  ℹ️  关于               │
├─────────────────────────┤
│        关 闭            │
└─────────────────────────┘
```

**规格**:
| 属性 | 值 |
|------|-----|
| **宽度** | 600px |
| **背景色** | #ffffff |
| **圆角** | 12px (顶部) |
| **位置** | 底部弹出 |

**CSS 实现**:
```css
.modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 1200rpx;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 48rpx;
}

.modal-title {
  font-size: 64rpx;
  font-weight: 600;
  margin-bottom: 48rpx;
}

.modal-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
}

.modal-close {
  margin-top: 48rpx;
  width: 100%;
  height: 100rpx;
  background-color: #1a472a;
  color: #ffffff;
  border-radius: 16rpx;
}
```

---

## CSS 变量汇总

```css
:root {
  /* 按钮尺寸 */
  --btn-primary-width: 560rpx;
  --btn-primary-height: 160rpx;
  --btn-secondary-width: 560rpx;
  --btn-secondary-height: 120rpx;
  --btn-action-width: 160rpx;
  --btn-action-height: 100rpx;
  --btn-icon-size: 88rpx;
  
  /* 按钮颜色 */
  --btn-primary-bg: #1a472a;
  --btn-primary-border: #2d5a3f;
  --btn-primary-active: #0f2f1d;
  --btn-secondary-bg: #ffffff;
  --btn-secondary-border: #8a8a8a;
  --btn-action-bg: #1a472a;
  --btn-action-disabled: #6a6a6a;
  
  /* 按钮圆角 */
  --btn-primary-radius: 24rpx;
  --btn-secondary-radius: 20rpx;
  --btn-action-radius: 16rpx;
  --btn-icon-radius: 16rpx;
  
  /* 扑克牌 */
  --card-width: 160rpx;
  --card-height: 300rpx;
  --card-radius: 16rpx;
  --card-bg: #ffffff;
  --card-border: #e0e0e0;
  --card-selected-bg: #fff9c4;
  --card-selected-border: #ffc107;
  
  /* 信息卡片 */
  --player-card-width: 400rpx;
  --player-card-height: 120rpx;
  --player-card-bg: rgba(255, 255, 255, 0.95);
  --player-card-border: #2d5a3f;
  
  /* 信息栏 */
  --top-bar-height: 176rpx;
  --top-bar-bg: rgba(26, 71, 42, 0.95);
  
  /* 出牌区域 */
  --play-area-width: 1000rpx;
  --play-area-height: 600rpx;
  --play-area-bg: rgba(0, 0, 0, 0.3);
  --play-area-border: #2d5a3f;
  
  /* 提示条 */
  --toast-height: 120rpx;
  --toast-error-bg: rgba(255, 59, 48, 0.9);
  
  /* 遮罩层 */
  --overlay-bg: rgba(0, 0, 0, 0.6);
  
  /* 动画 */
  --transition-fast: 0.1s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

---

## 组件使用示例

### WXML 模板

```xml
<!-- 主按钮 -->
<button class="btn btn-primary" bindtap="startGame">
  开始游戏
</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary" bindtap="openP2P">
  P2P 联机
</button>

<!-- 操作按钮组 -->
<view class="action-buttons">
  <button class="btn btn-action" bindtap="hint">提示</button>
  <button class="btn btn-action {{canPlay ? 'active' : 'disabled'}}" 
          bindtap="play">出牌</button>
  <button class="btn btn-action" bindtap="undo">撤销</button>
</view>

<!-- 扑克牌 -->
<view class="card {{card.selected ? 'selected' : ''}}" 
      wx:for="{{cards}}"
      bindtap="selectCard">
  <text class="card-value {{card.isRed ? 'red' : 'black'}}">
    {{card.value}}{{card.suit}}
  </text>
</view>

<!-- 玩家信息卡 -->
<view class="player-card">
  <text class="player-name">对家 AI</text>
  <text class="player-cards">(剩余 8 张)</text>
</view>
```

---

## 验收检查

- [x] 所有按钮点击区≥44px
- [x] 组件样式统一
- [x] CSS 变量集中管理
- [x] 支持状态变化 (正常/按下/禁用)
- [x] 符合微信小程序规范
- [x] 组件可复用

---

**下一步**: UI 设计汇总 → `ui-summary.md`
