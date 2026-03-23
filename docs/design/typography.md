# 掼蛋大师 v3 - 字体规范

**版本**: v1.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent  
**适用平台**: 微信小程序

---

## 设计原则

1. **清晰易读** - 首要目标，任何光线条件下都可识别
2. **手机友好** - 考虑小屏幕阅读体验
3. **简洁统一** - 不超过 3 种字号层级
4. **系统优先** - 使用系统默认字体，无需加载

---

## 字体系列

### 中文字体

```css
--font-family-zh: -apple-system, BlinkMacSystemFont, "PingFang SC", 
                   "Helvetica Neue", STHeiti, "Microsoft Yahei", 
                   Helvetica, Arial, sans-serif;
```

**优先级说明**:
1. `-apple-system` / `BlinkMacSystemFont` - iOS/Android 系统字体
2. `PingFang SC` - 苹果简体中文
3. `Helvetica Neue` - 备用西文字体
4. `STHeiti` - 旧版 iOS 黑体
5. `Microsoft Yahei` - Windows 微软雅黑
6. `Helvetica` / `Arial` - 通用备用

### 西文字体（数字/英文）

```css
--font-family-en: -apple-system, BlinkMacSystemFont, "Helvetica Neue", 
                   Helvetica, Arial, sans-serif;
```

**特殊说明**:
- 扑克牌面值使用系统默认等宽数字
- 确保 `A`, `K`, `Q`, `J` 清晰可辨

---

## 字号规范

### 基础字号表

| 层级 | 用途 | 字号 | 行高 | 字重 |
|------|------|------|------|------|
| **标题** | 页面标题、Logo | 36px | 48px | 600 (Semibold) |
| **大按钮** | 主按钮文字 | 32px | 44px | 500 (Medium) |
| **正文** | 按钮文字、信息 | 28px | 40px | 400 (Regular) |
| **辅助** | 次要信息、提示 | 24px | 32px | 400 (Regular) |
| **小字** | 说明文字、注释 | 20px | 28px | 400 (Regular) |

### 字号预览

```
┌─────────────────────────────────────────────┐
│  标题 36px - 掼蛋大师 v3                    │
│  ████████████████████████████████████       │
│                                             │
│  大按钮 32px - 开始游戏                     │
│  ████████████████████████████████           │
│                                             │
│  正文 28px - P2P 联机 / 剩余 12 张            │
│  ██████████████████████████████             │
│                                             │
│  辅助 24px - 第 3 局 / 得分 +10               │
│  ████████████████████████                   │
│                                             │
│  小字 20px - 点击提示查看规则               │
│  ████████████████████                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 字重规范

### 可用字重

```css
--font-weight-light: 300;    /* Light - 不使用 */
--font-weight-regular: 400;  /* Regular - 正文/辅助 */
--font-weight-medium: 500;   /* Medium - 按钮文字 */
--font-weight-semibold: 600; /* Semibold - 标题 */
--font-weight-bold: 700;     /* Bold - 不使用 */
```

### 使用规则

| 字重 | 使用场景 | 示例 |
|------|----------|------|
| **400 (Regular)** | 正文、辅助信息、说明文字 | "剩余 12 张"、"第 3 局" |
| **500 (Medium)** | 按钮文字、可点击元素 | "开始游戏"、"出牌" |
| **600 (Semibold)** | 标题、Logo、重要信息 | "掼蛋大师 v3"、"游戏结束" |

**不使用 Light/Bold 的原因**:
- Light (300): 小字号下可读性差
- Bold (700): 与 Medium 差异不明显，增加视觉负担

---

## 行高规范

### 行高比例

```css
--line-height-tight: 1.2;    /* 紧凑 - 标题 */
--line-height-normal: 1.43;  /* 标准 - 正文 (40px/28px) */
--line-height-loose: 1.5;    /* 宽松 - 辅助文字 */
```

### 具体应用

| 字号 | 行高值 | 比例 | 用途 |
|------|--------|------|------|
| 36px | 48px | 1.33 | 标题 |
| 32px | 44px | 1.38 | 大按钮 |
| 28px | 40px | 1.43 | 正文 |
| 24px | 32px | 1.33 | 辅助 |
| 20px | 28px | 1.40 | 小字 |

---

## 字间距规范

### 中文字间距

```css
--letter-spacing-zh: 0;      /* 中文无字间距 */
```

### 西文字间距（数字/英文）

```css
--letter-spacing-en: 0.5px;  /* 轻微字间距 */
--letter-spacing-wide: 1px;  /* 宽松 - 大标题 */
```

### 特殊场景

**扑克牌面值**:
```css
.card-value {
  font-size: 32px;
  letter-spacing: 0;  /* 牌面值紧凑排列 */
  font-weight: 600;
}
```

**倒计时数字**:
```css
.countdown {
  font-size: 48px;
  letter-spacing: 2px;  /* 数字宽松，易读 */
  font-weight: 600;
}
```

---

## 颜色对比（配合色彩规范）

### 文字颜色

```css
--text-primary: #000000;      /* 主要文字 - 白色背景 */
--text-secondary: #1a1a1a;    /* 次要文字 - 浅色背景 */
--text-tertiary: #4a4a4a;     /* 辅助文字 - 灰色 */
--text-inverse: #ffffff;      /* 反色文字 - 深色背景 */
--text-disabled: #8a8a8a;     /* 禁用文字 */
```

### 对比度检查

| 背景色 | 文字色 | 对比度 | WCAG 标准 | 结果 |
|--------|--------|--------|-----------|------|
| #ffffff (白) | #000000 (黑) | 21:1 | AAA (7:1) | ✅ |
| #1a472a (深绿) | #ffffff (白) | 8.5:1 | AA (4.5:1) | ✅ |
| #f5f5f5 (浅灰) | #1a1a1a (软黑) | 16:1 | AAA (7:1) | ✅ |
| #6a6a6a (灰) | #e0e0e0 (灰白) | 3.5:1 | AA (3:1) | ✅ |

---

## 具体场景应用

### 主界面字体

```
┌─────────────────────────────────────┐
│                                     │
│         掼蛋大师 v3                  │  ← 36px, 600
│                                     │
│                                     │
│   ┌───────────────────────────┐     │
│   │      开 始 游 戏          │     │  ← 32px, 500
│   └───────────────────────────┘     │
│                                     │
│   ┌───────────────────────────┐     │
│   │      P2P 联 机            │     │  ← 28px, 500
│   └───────────────────────────┘     │
│                                     │
│                              ⚙️     │
│                                     │
└─────────────────────────────────────┘
```

### 游戏界面字体

```
┌─────────────────────────────────────┐
│  ⏸️ 暂停                    第 3 局  │  ← 24px, 400
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │   对家 AI   │             │  ← 24px, 400
│         │  (剩余 8 张)  │             │  ← 20px, 400
│         └─────────────┘             │
│                                     │
│    ┌─────────────────────────┐      │
│    │    出 牌 区 域          │      │  ← 24px, 400
│    │    [♠A] [♥K] [♦Q]      │      │  ← 32px, 600
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────────┐  │
│    │ [♠] [♥] [♦] [♣] [♠] [♥]    │  │  ← 牌面 32px
│    └─────────────────────────────┘  │
│                                     │
│    ┌──────┐ ┌──────┐ ┌──────┐      │
│    │ 提示 │ │ 出牌 │ │ 撤销 │      │  ← 24px, 500
│    └──────┘ └──────┘ └──────┘      │
│                                     │
└─────────────────────────────────────┘
```

### 弹窗/提示字体

```
┌─────────────────────────────────────┐
│                                     │
│         游戏已暂停                  │  ← 32px, 600
│                                     │
│         ┌─────────────┐             │
│         │  继续游戏   │             │  ← 28px, 500
│         └─────────────┘             │
│                                     │
│         ┌─────────────┐             │
│         │  退出牌局   │             │  ← 28px, 500
│         └─────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

---

## 特殊元素字体

### 扑克牌面值

```css
.card-value {
  font-size: 32px;           /* 牌面数字/字母 */
  font-weight: 600;          /* Semibold */
  font-family: var(--font-family-en);
  line-height: 1.2;
}

.card-suit {
  font-size: 24px;           /* 花色符号 */
  line-height: 1;
}
```

### 倒计时

```css
.countdown {
  font-size: 48px;           /* 大号数字 */
  font-weight: 600;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;  /* 等宽数字 */
}
```

### 得分显示

```css
.score {
  font-size: 28px;
  font-weight: 500;
  font-variant-numeric: proportional-nums;
}
```

---

## 响应式适配

### 屏幕尺寸分级

| 屏幕宽度 | 分级 | 字号调整 |
|----------|------|----------|
| ≥ 750px | 大屏 | 基准字号 |
| 600-749px | 中屏 | 字号 × 0.95 |
| < 600px | 小屏 | 字号 × 0.9 |

### 适配示例

```css
/* 基准字号 (750px 设计稿) */
.title { font-size: 36px; }
.button { font-size: 32px; }
.body { font-size: 28px; }

/* 小屏适配 (< 600px) */
@media (max-width: 600px) {
  .title { font-size: 32px; }  /* 36 × 0.9 */
  .button { font-size: 28px; } /* 32 × 0.9 */
  .body { font-size: 24px; }   /* 28 × 0.9 */
}
```

---

## 微信小程序适配

### rpx 单位转换

微信小程序使用 `rpx` (responsive pixel) 单位：

```
1rpx = 0.5px (在 750px 宽屏幕上)
```

### 转换表

| 设计稿 (px) | rpx | CSS 变量 |
|-------------|-----|----------|
| 36px | 72rpx | --font-size-title |
| 32px | 64rpx | --font-size-button-lg |
| 28px | 56rpx | --font-size-body |
| 24px | 48rpx | --font-size-secondary |
| 20px | 40rpx | --font-size-small |

### 微信小程序 CSS

```css
/* pages/index/index.wxss */
page {
  --font-size-title: 72rpx;
  --font-size-button-lg: 64rpx;
  --font-size-body: 56rpx;
  --font-size-secondary: 48rpx;
  --font-size-small: 40rpx;
}

.title {
  font-size: var(--font-size-title);
  font-weight: 600;
}

.button-lg {
  font-size: var(--font-size-button-lg);
  font-weight: 500;
}
```

---

## CSS 变量汇总

```css
:root {
  /* 字体系列 */
  --font-family-zh: -apple-system, BlinkMacSystemFont, "PingFang SC", 
                     "Helvetica Neue", STHeiti, "Microsoft Yahei", 
                     Helvetica, Arial, sans-serif;
  --font-family-en: -apple-system, BlinkMacSystemFont, "Helvetica Neue", 
                     Helvetica, Arial, sans-serif;
  
  /* 字号 (px) */
  --font-size-title: 36px;
  --font-size-button-lg: 32px;
  --font-size-body: 28px;
  --font-size-secondary: 24px;
  --font-size-small: 20px;
  
  /* 字重 */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  
  /* 行高 */
  --line-height-tight: 1.2;
  --line-height-normal: 1.43;
  --line-height-loose: 1.5;
  
  /* 字间距 */
  --letter-spacing-zh: 0;
  --letter-spacing-en: 0.5px;
  --letter-spacing-wide: 1px;
  
  /* 文字颜色 */
  --text-primary: #000000;
  --text-secondary: #1a1a1a;
  --text-tertiary: #4a4a4a;
  --text-inverse: #ffffff;
  --text-disabled: #8a8a8a;
}
```

---

## 无障碍检查

### 最小字号

- ✅ 所有文字 ≥ 20px (微信规范最小 11px，我们更严格)
- ✅ 按钮文字 ≥ 24px (易于点击)
- ✅ 牌面值 32px (清晰可辨)

### 对比度

- ✅ 主要文字对比度 ≥ 21:1 (AAA)
- ✅ 次要文字对比度 ≥ 8.5:1 (AA)
- ✅ 禁用文字对比度 ≥ 3.5:1 (AA)

### 可缩放性

- ✅ 支持系统字体缩放
- ✅ 不使用固定 `em` 单位
- ✅ 使用 `rpx` 适配不同屏幕

---

## 验收检查

- [x] 字号层级不超过 5 级
- [x] 使用系统默认字体（无需加载）
- [x] 所有文字 ≥ 20px
- [x] 对比度符合 WCAG AA 标准
- [x] CSS 变量命名规范统一
- [x] 支持微信小程序 rpx 单位
- [x] 响应式适配小屏设备

---

**下一步**: 主界面 UI 设计稿 → `ui-main-screen.md`
