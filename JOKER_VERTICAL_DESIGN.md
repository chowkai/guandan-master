# 大小王竖排 JOKER 设计说明

## 设计图

```
┌─────────────┐
│ J           │  <- 左侧：竖排 JOKER（18px）
│ O           │     writing-mode: vertical-rl
│ K           │     text-orientation: mixed
│ E           │     letter-spacing: 2px
│ R           │
│             │
│      👑     │  <- 中央：王冠图标（60px）
│             │
└─────────────┘
```

## CSS 实现

```css
/* 大小王 - 竖排 JOKER + 王冠 */
.card.joker {
    background: linear-gradient(135deg, #fff5e6, #ffe6cc);
}

.card.joker .card-value-top {
    font-size: 18px;
    font-weight: bold;
    writing-mode: vertical-rl;  /* 竖排关键属性 */
    text-orientation: mixed;
    position: absolute;
    top: 10px;
    left: 8px;
    letter-spacing: 2px;
}

.card.joker .card-suit-center {
    font-size: 60px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* 大王红色，小王绿色 */
.card.joker-big .card-value-top,
.card.joker-big .card-suit-center {
    color: #C41E3A;
}

.card.joker-small .card-value-top,
.card.joker-small .card-suit-center {
    color: #2E8B57;
}
```

## 优势

1. **节省横向空间** - 竖排不占用卡牌宽度，牌紧密排列时仍可见
2. **易于识别** - 从左侧即可快速识别大小王
3. **符合惯例** - 传统扑克牌常用竖排文字设计
4. **视觉清晰** - 配合中央王冠图标，大小王身份一目了然

## 响应式调整

### 平板（≤1024px）
```css
.card.joker .card-value-top {
    font-size: 16px;
}

.card.joker .card-suit-center {
    font-size: 48px;
}
```

### 手机（≤768px）
```css
.card.joker .card-value-top {
    font-size: 14px;
}

.card.joker .card-suit-center {
    font-size: 36px;
}
```

### 小手机（≤480px）
```css
.card.joker .card-value-top {
    font-size: 12px;
}

.card.joker .card-suit-center {
    font-size: 28px;
}
```

## 测试方法

访问测试页面查看效果：
```
http://localhost:8000/test_card_design.html
```

查看大小王部分，确认竖排 JOKER 显示正确。

---

**修改日期：** 2026-03-20  
**版本：** v1.3  
**状态：** ✅ 已完成
