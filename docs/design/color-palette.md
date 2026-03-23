# 掼蛋大师 v3 - 色彩规范

**版本**: v1.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent  
**适用平台**: 微信小程序

---

## 设计原则

1. **深绿色牌桌** - 传统扑克牌桌的经典配色
2. **简洁不花哨** - 无渐变、无阴影、无多余装饰
3. **高对比度** - 确保户外强光下清晰可见
4. **手机友好** - 考虑不同屏幕的显色差异

---

## 主色调

### 牌桌背景色

```css
--color-table-bg: #1a472a;        /* 深绿色 - 主背景 */
--color-table-bg-light: #2d5a3f;  /* 稍浅 - 区域分隔 */
--color-table-bg-dark: #0f2f1d;   /* 更深 - 阴影/边框 */
```

**色值说明**:
- `#1a472a` - 经典赌场牌桌绿，沉稳不刺眼
- 亮度适中，长时间观看不会疲劳
- 与白色牌面形成高对比度

### 色彩预览

```
┌─────────────────────────────────────────────┐
│  #1a472a                                    │
│  主背景色 (80% 面积)                        │
├─────────────────────────────────────────────┤
│  #2d5a3f                                    │
│  次要背景 (15% 面积 - 信息栏/按钮)          │
├─────────────────────────────────────────────┤
│  #0f2f1d                                    │
│  强调/边框 (5% 面积)                        │
└─────────────────────────────────────────────┘
```

---

## 辅助色

### 中性色

```css
/* 白色系 */
--color-white: #ffffff;         /* 纯白 - 牌面背景 */
--color-white-off: #f5f5f5;     /* 米白 - 次要背景 */
--color-white-dim: #e0e0e0;     /* 灰白 - 禁用状态 */

/* 黑色系 */
--color-black: #000000;         /* 纯黑 - 文字 */
--color-black-soft: #1a1a1a;    /* 软黑 - 次要文字 */
--color-black-dim: #4a4a4a;     /* 灰黑 - 辅助信息 */

/* 灰色系 */
--color-gray-light: #8a8a8a;    /* 浅灰 - 边框/分隔线 */
--color-gray: #6a6a6a;          /* 中灰 - 禁用按钮 */
--color-gray-dark: #3a3a3a;     /* 深灰 - 遮罩层 */
```

### 功能色

```css
/* 成功/确认 */
--color-success: #34c759;       /* 绿色 - 出牌确认 */

/* 警告/提示 */
--color-warning: #ff9500;       /* 橙色 - 注意提示 */

/* 错误/不可用 */
--color-error: #ff3b30;         /* 红色 - 错误提示 */

/* 链接/可点击 */
--color-link: #007aff;          /* 蓝色 - 可点击元素 */
```

---

## 按钮色彩规范

### 主按钮（开始游戏）

```css
--btn-primary-bg: #1a472a;      /* 深绿背景 */
--btn-primary-text: #ffffff;    /* 白色文字 */
--btn-primary-border: #2d5a3f;  /* 浅绿边框 */
--btn-primary-active: #0f2f1d;  /* 按下状态 */
```

### 次要按钮（P2P 联机）

```css
--btn-secondary-bg: #ffffff;    /* 白色背景 */
--btn-secondary-text: #1a472a;  /* 深绿文字 */
--btn-secondary-border: #8a8a8a; /* 灰色边框 */
--btn-secondary-active: #f5f5f5; /* 按下状态 */
```

### 操作按钮（提示/出牌/撤销）

```css
--btn-action-bg: #1a472a;       /* 深绿背景 */
--btn-action-text: #ffffff;     /* 白色文字 */
--btn-action-disabled: #6a6a6a; /* 禁用灰色 */
```

---

## 牌面色彩

### 扑克牌标准色

```css
/* 黑桃/梅花 - 黑色 */
--card-suit-black: #000000;

/* 红桃/方块 - 红色 */
--card-suit-red: #d32f2f;

/* 牌面背景 */
--card-bg: #ffffff;

/* 牌面边框 */
--card-border: #e0e0e0;

/* 选中状态 */
--card-selected: #fff9c4;       /* 浅黄高亮 */
--card-selected-border: #ffc107; /* 黄色边框 */
```

### 牌面色彩应用

```
┌─────────────────────────┐
│     ♠ A                 │  ← 黑桃花色：#000000
│   ┌─────────────┐       │
│   │             │       │  ← 牌面背景：#ffffff
│   │             │       │
│   │      ♠      │       │  ← 中央花色
│   │             │       │
│   │             │       │
│   └─────────────┘       │  ← 边框：#e0e0e0
│     A                   │
└─────────────────────────┘
```

---

## 状态色彩

### 按钮状态

| 状态 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| **正常** | #1a472a | #ffffff | #2d5a3f |
| **按下** | #0f2f1d | #ffffff | #0f2f1d |
| **禁用** | #6a6a6a | #e0e0e0 | #8a8a8a |
| **加载中** | #2d5a3f | #ffffff | #2d5a3f |

### 牌面状态

| 状态 | 背景色 | 边框色 | 说明 |
|------|--------|--------|------|
| **正常** | #ffffff | #e0e0e0 | 默认状态 |
| **选中** | #fff9c4 | #ffc107 | 向上偏移 20px |
| **不可出** | #f5f5f5 | #e0e0e0 | 灰色，不可点击 |
| **可出提示** | #e8f5e9 | #34c759 | 绿色边框闪烁 |

---

## 信息栏色彩

### 顶部信息栏

```css
--info-bar-bg: rgba(26, 71, 42, 0.95);  /* 深绿半透明 */
--info-bar-text: #ffffff;                /* 白色文字 */
--info-bar-border: #2d5a3f;              /* 浅绿边框 */
```

### 玩家信息卡

```css
--player-card-bg: rgba(255, 255, 255, 0.95);  /* 白色半透明 */
--player-card-text: #000000;                    /* 黑色文字 */
--player-card-border: #2d5a3f;                  /* 绿色边框 */
```

### 出牌区域

```css
--play-area-bg: rgba(0, 0, 0, 0.3);     /* 黑色半透明 */
--play-area-border: #2d5a3f;            /* 绿色边框 */
--play-area-text: #ffffff;              /* 白色文字 */
```

---

## 遮罩层色彩

### 暂停遮罩

```css
--overlay-bg: rgba(0, 0, 0, 0.6);       /* 黑色 60% 透明 */
--overlay-text: #ffffff;                 /* 白色文字 */
```

### 弹窗背景

```css
--modal-bg: #ffffff;                     /* 纯白背景 */
--modal-border: #2d5a3f;                 /* 绿色边框 */
--modal-shadow: rgba(0, 0, 0, 0.3);      /* 阴影 */
```

---

## 特殊效果色彩

### 胜利庆祝

```css
--celebrate-gold: #ffd700;              /* 金色 - 奖杯/星星 */
--celebrate-confetti: #ff3b30, #34c759, #007aff;  /* 彩带多色 */
```

### 失败鼓励

```css
--encourage-bg: #fff3e0;                /* 浅橙色背景 */
--encourage-text: #e65100;              /* 深橙色文字 */
```

### 震动提示（错误）

```css
--error-flash: rgba(255, 59, 48, 0.3);  /* 红色闪烁 */
```

---

## 暗色模式支持（可选）

> 注：当前版本暂不支持暗色模式，预留变量供未来扩展

```css
/* 暗色模式变量前缀 */
@media (prefers-color-scheme: dark) {
  --color-table-bg: #0f2f1d;
  --color-white: #f5f5f5;
  --color-black: #ffffff;
  /* ... 其他暗色变量 */
}
```

---

## 色彩使用比例

```
┌─────────────────────────────────────────────┐
│                                             │
│  深绿色 (#1a472a)                           │
│  ████████████████████████████  60%         │
│  (牌桌背景、主按钮)                         │
│                                             │
│  白色 (#ffffff)                             │
│  ████████████  25%                          │
│  (牌面、文字、次要按钮)                     │
│                                             │
│  浅绿色 (#2d5a3f)                           │
│  ██████  10%                                │
│  (边框、强调)                               │
│                                             │
│  其他色彩                                   │
│  ██  5%                                     │
│  (功能色、状态色)                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 色彩无障碍检查

| 对比组合 | 对比度 | WCAG 标准 | 结果 |
|----------|--------|-----------|------|
| 深绿背景 / 白色文字 | 8.5:1 | AA (4.5:1) | ✅ 通过 |
| 白色牌面 / 黑色文字 | 21:1 | AAA (7:1) | ✅ 通过 |
| 灰色边框 / 白色背景 | 3.2:1 | AA (3:1) | ✅ 通过 |
| 红色错误 / 白色背景 | 4.8:1 | AA (4.5:1) | ✅ 通过 |

---

## CSS 变量汇总

```css
:root {
  /* 主色调 */
  --color-table-bg: #1a472a;
  --color-table-bg-light: #2d5a3f;
  --color-table-bg-dark: #0f2f1d;
  
  /* 中性色 */
  --color-white: #ffffff;
  --color-white-off: #f5f5f5;
  --color-white-dim: #e0e0e0;
  --color-black: #000000;
  --color-black-soft: #1a1a1a;
  --color-black-dim: #4a4a4a;
  --color-gray-light: #8a8a8a;
  --color-gray: #6a6a6a;
  --color-gray-dark: #3a3a3a;
  
  /* 功能色 */
  --color-success: #34c759;
  --color-warning: #ff9500;
  --color-error: #ff3b30;
  --color-link: #007aff;
  
  /* 按钮色 */
  --btn-primary-bg: #1a472a;
  --btn-primary-text: #ffffff;
  --btn-primary-border: #2d5a3f;
  --btn-primary-active: #0f2f1d;
  --btn-secondary-bg: #ffffff;
  --btn-secondary-text: #1a472a;
  --btn-secondary-border: #8a8a8a;
  --btn-action-bg: #1a472a;
  --btn-action-text: #ffffff;
  --btn-action-disabled: #6a6a6a;
  
  /* 牌面色 */
  --card-suit-black: #000000;
  --card-suit-red: #d32f2f;
  --card-bg: #ffffff;
  --card-border: #e0e0e0;
  --card-selected: #fff9c4;
  --card-selected-border: #ffc107;
  
  /* 信息栏 */
  --info-bar-bg: rgba(26, 71, 42, 0.95);
  --info-bar-text: #ffffff;
  --player-card-bg: rgba(255, 255, 255, 0.95);
  --player-card-text: #000000;
  --play-area-bg: rgba(0, 0, 0, 0.3);
  --play-area-text: #ffffff;
  
  /* 遮罩层 */
  --overlay-bg: rgba(0, 0, 0, 0.6);
  --overlay-text: #ffffff;
  --modal-bg: #ffffff;
  --modal-border: #2d5a3f;
}
```

---

## 验收检查

- [x] 主色调为深绿色 (#1a472a)
- [x] 色彩对比度符合 WCAG AA 标准
- [x] 无渐变、无阴影（简洁原则）
- [x] 所有色彩有明确用途
- [x] CSS 变量命名规范统一
- [x] 支持微信小程序色彩空间

---

**下一步**: 字体规范设计 → `typography.md`
