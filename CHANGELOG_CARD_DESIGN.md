# 牌面设计更新 - 极简设计 v1.4

## 更新日期
2026-03-20

## 设计说明

### 普通牌（A-K）
```
┌─────────────┐
│ A  ♥        │  <- 左上角：牌字 + 小花色（24px）
│             │
│      ♥      │  <- 中央：一个大花色图标（80px）
│             │
└─────────────┘
```

### 大小王
```
┌─────────────┐
│   JOKER     │  <- 顶部横排
│      👑     │  <- 中央：王冠图标（60px）
└─────────────┘
```

## 修改要点

1. **左上角**：牌字 + 小花色（24px）- 横排紧密排列 ✅
2. **中央**：一个大花色图标（80px）- 保留 ✅
3. **右下角**：~~倒置牌字~~ - **已移除** ✅
4. **大小王**：JOKER 横排 + 王冠图标 - 不要中文 ✅

## 修改文件

### 前端
- `src/client/css/style.css` - 卡牌样式
  - 移除 `.card-corner-bottom` 样式
  - 更新 `.card-value-top` - 左上角牌字 + 花色（横排）
  - 保留 `.card-suit-center` - 中央大花色图标
  - 更新 `.card.joker` - 横排 JOKER 样式
  - 简化响应式设计

- `src/client/js/game.js` - 卡牌渲染逻辑
  - 更新 `createCardElement()` 函数
  - 普通牌：两个元素（左上、中央）
  - 大小王：JOKER + 👑（无中文）

## CSS 类结构

```css
.card {
    width: var(--card-width);
    height: var(--card-height);
    position: relative;
}

.card-value-top {
    position: absolute;
    top: 5px;
    left: 8px;
    font-size: 24px;
    font-weight: bold;
    display: flex;
    gap: 4px;
}

.card-suit-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 80px;
}

/* 大小王 */
.card.joker .card-value-top {
    font-size: 20px;
    writing-mode: horizontal-tb;
    text-align: center;
    width: 100%;
    left: 0;
    justify-content: center;
}

.card.joker .card-suit-center {
    font-size: 60px;
}
```

## 响应式设计

### 平板（≤1024px）
- 卡牌尺寸：100px × 150px

### 手机（≤768px）
- 卡牌尺寸：70px × 105px
- 左上角：16px
- 中央花色：48px
- 大小王：12px / 36px

### 小手机（≤480px）
- 卡牌尺寸：60px × 90px
- 左上角：14px
- 中央花色：40px

## 测试

创建测试文件：`test-cards.html`

打开方式：
```bash
# 在项目根目录
open test-cards.html
# 或
start test-cards.html  # Windows
```

## 版本历史

### v1.4 - 极简设计（当前版本）
- 移除右下角倒置牌字
- 左上角改为横排
- 大小王简化为 JOKER + 👑

### v1.3 - 简洁设计
- 左上角竖排牌字 + 小花色
- 中央大花色
- 右下角倒置牌字
- 大小王竖排 JOKER

## 注意事项

1. 移除了右下角元素，牌面更简洁
2. 左上角改为横排（非竖排）
3. 大小王不再显示"大王"/"小王"中文
4. 花色和牌字紧密排列（gap: 4px）
5. 所有卡牌元素使用绝对定位

## 作者
代码虾
