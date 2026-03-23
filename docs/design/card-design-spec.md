# 掼蛋大师 v3 - 卡牌设计规范

**版本**: v1.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent  
**适用场景**: 游戏界面手牌区、出牌区展示

---

## 设计原则

1. **熟悉感优先**: 卡牌比例与实际扑克牌一致，避免玩家生疏感
2. **单手操作友好**: 紧密排列但不影响选牌精度
3. **清晰识别**: 花字布局支持快速辨识，即使在小尺寸下

---

## 1. 卡牌比例与尺寸

### 标准扑克比例

| 属性 | 值 | 说明 |
|------|-----|------|
| **宽高比** | 1:1.4 | 标准扑克牌比例 |
| **建议尺寸** | 80px × 112px | 手牌区使用尺寸 |
| **出牌区尺寸** | 50px × 70px | 出牌展示区缩小版 |
| **圆角** | 8px | 柔和边角 |

### 尺寸对比

```
手牌区卡牌：
┌────────────────┐
│                │
│                │ 112px
│                │
│                │
└────────────────┘
       80px

出牌区卡牌（缩小版）:
┌────────────┐
│            │ 70px
│            │
└────────────┘
     50px
```

---

## 2. 花字布局设计

### 整体布局结构

```
┌────────────────┐
│ A              │ ← 左上角：字 + 花（竖排）
│ ♥              │
│                │
│       ♥        │ ← 中间：大花色图标（40px）
│                │
│                │
│              ♥ │ ← 右下角：字 + 花（倒置竖排）
│              A │
└────────────────┘
```

### 左上角（主识别区）

| 元素 | 规格 | 位置 |
|------|------|------|
| **字** | 24px, 600 | 距左 8px, 距上 8px |
| **花** | 20px × 20px | 字下方，间距 2px |
| **排列** | 竖排 | 字在上，花在下 |
| **颜色** | 红桃/方片：#d32f2f<br>黑桃/梅花：#212121 | 根据花色 |

**示例代码**:
```css
.card-corner-top {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-corner-top .value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

.card-corner-top .suit {
  width: 20px;
  height: 20px;
  margin-top: 2px;
}
```

### 中间（辅助识别区）

| 元素 | 规格 | 位置 |
|------|------|------|
| **大花色图标** | 40px × 40px | 正中央 |
| **位置** | `top: 50%, left: 50%` | `transform: translate(-50%, -50%)` |
| **颜色** | 红桃/方片：#d32f2f<br>黑桃/梅花：#212121 | 根据花色 |

**示例代码**:
```css
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
}

.card-center.suit-red {
  color: #d32f2f;
}

.card-center.suit-black {
  color: #212121;
}
```

### 右下角（副识别区）

| 元素 | 规格 | 位置 |
|------|------|------|
| **字** | 24px, 600 | 距右 8px, 距下 8px |
| **花** | 20px × 20px | 字上方，间距 2px |
| **排列** | 倒置竖排 | 旋转 180 度 |
| **颜色** | 同左上角 | 根据花色 |

**示例代码**:
```css
.card-corner-bottom {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: rotate(180deg);
}

.card-corner-bottom .value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

.card-corner-bottom .suit {
  width: 20px;
  height: 20px;
  margin-top: 2px;
}
```

---

## 3. 紧密排列设计

### 手牌区排列

| 属性 | 值 | 说明 |
|------|-----|------|
| **牌间距** | 12px | 单手选牌友好（8-12px 范围） |
| **选中偏移** | 30px | 向上偏移，清晰标识 |
| **排列方式** | 单列横向滚动 | 支持 27 张牌 |
| **总宽度** | 2484px | 27 × (80 + 12) = 2484px |

**手牌区布局**:
```
手牌容器（横向滚动）
├─ 牌组 1（同花色）
│  ├─ [♠A] ← 12px → [♠K] ← 12px → [♠Q]
│  └─ 组间距 24px
├─ 牌组 2（同花色）
│  ├─ [♥J] ← 12px → [♥10] ← 12px → [♥9]
│  └─ 组间距 24px
└─ ...（最多 27 张）
```

**选中状态样式**:
```css
.card {
  width: 80px;
  height: 112px;
  background-color: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card.selected {
  transform: translateY(-30px);
  background-color: #fff9c4;
  border: 3px solid #ffc107;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### 出牌区排列

| 属性 | 值 | 说明 |
|------|-----|------|
| **牌间距** | 8px | 出牌展示更紧凑 |
| **牌尺寸** | 50px × 70px | 缩小版 |
| **最多牌数** | 10 张 | 单轮最大出牌数 |

---

## 4. 花色颜色规范

### 标准花色颜色

| 花色 | 图标 | 颜色值 | 使用场景 |
|------|------|--------|----------|
| **红桃** | ♥ | #d32f2f | 字、花、图标 |
| **方片** | ♦ | #d32f2f | 字、花、图标 |
| **黑桃** | ♠ | #212121 | 字、花、图标 |
| **梅花** | ♣ | #212121 | 字、花、图标 |

### 特殊牌颜色

| 牌型 | 颜色值 | 说明 |
|------|--------|------|
| **小王** | #1976d2 | 蓝色 |
| **大王** | #d32f2f | 红色 |
| **级牌** | #f57c00 | 橙色高亮 |

---

## 5. 字体规范

### 数字与字母

| 元素 | 字重 | 字间距 | 说明 |
|------|------|--------|------|
| **A, K, Q, J** | 600 | 正常 | 左上/右下角 |
| **10, 9-2** | 600 | 正常 | 左上/右下角 |

### 中文字体（如使用）

| 元素 | 字重 | 说明 |
|------|------|------|
| **级牌标识** | 500 | 如"级"字 |

---

## 6. 卡牌状态

### 正常状态

```css
.card {
  background-color: #ffffff;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 选中状态

```css
.card.selected {
  transform: translateY(-30px);
  background-color: #fff9c4;
  border: 3px solid #ffc107;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### 可出牌状态（提示）

```css
.card.playable {
  animation: playable-pulse 1.5s infinite;
}

@keyframes playable-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);
  }
}
```

### 不可出牌状态（置灰）

```css
.card.disabled {
  opacity: 0.5;
  filter: grayscale(50%);
}
```

---

## 7. 微信小程序实现

### WXML 结构

```xml
<view class="card {{selected ? 'selected' : ''}} {{playable ? 'playable' : ''}}">
  <!-- 左上角 -->
  <view class="card-corner card-corner-top">
    <text class="card-value {{isRed ? 'red' : 'black'}}">{{value}}</text>
    <text class="card-suit {{isRed ? 'red' : 'black'}}">{{suit}}</text>
  </view>
  
  <!-- 中间花色 -->
  <view class="card-center {{isRed ? 'red' : 'black'}}">
    <text>{{suit}}</text>
  </view>
  
  <!-- 右下角 -->
  <view class="card-corner card-corner-bottom">
    <text class="card-value {{isRed ? 'red' : 'black'}}">{{value}}</text>
    <text class="card-suit {{isRed ? 'red' : 'black'}}">{{suit}}</text>
  </view>
</view>
```

### WXSS 样式

```css
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

.card.selected {
  transform: translateY(-60rpx);
  background-color: #fff9c4;
  border: 6rpx solid #ffc107;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

.card.playable {
  animation: playable-pulse 1.5s infinite;
}

@keyframes playable-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12rpx rgba(255, 193, 7, 0);
  }
}
```

---

## 8. 设计验收标准

### 视觉验收

- [ ] 卡牌比例 1:1.4（80×112px）
- [ ] 左上角字 + 花竖排清晰可辨
- [ ] 中间花色图标居中
- [ ] 右下角倒置竖排正确
- [ ] 花字颜色正确（红/黑）

### 交互验收

- [ ] 手牌间距 12px，单手选牌友好
- [ ] 选中偏移 30px，状态明显
- [ ] 27 张牌横向滚动流畅
- [ ] 智能分组（同花色）正常

### 技术验收

- [ ] 使用 rpx 单位适配不同屏幕
- [ ] CSS 动画性能优化
- [ ] 符合微信小程序规范

---

## 9. 设计变更历史

| 版本 | 日期 | 变更内容 | 理由 |
|------|------|----------|------|
| v1.0 | 2026-03-23 | 初始版本 | 用户反馈：卡牌比例应与普通扑克一致 |

---

**创建时间**: 2026-03-23  
**设计师**: design-agent  
**版本**: v1.0
