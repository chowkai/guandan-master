# 掼蛋游戏 v1.3 - 简洁牌面设计（最终版）

## 修改日期
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

### 大小王（竖排 JOKER）
```
┌─────────────┐
│ J           │  <- 左侧：竖排 JOKER
│ O           │     （writing-mode: vertical-rl）
│ K           │
│ E           │
│ R           │
│      👑     │  <- 中央：王冠图标（60px）
└─────────────┘
```

## 修改要点

1. ✅ **左上角**：牌字 + 小花色（24px）- 保留，便于紧密排列
2. ✅ **中央**：一个大花色图标（80px）- 简化
3. ✅ **右下角**：**省略** - 用户确认不需要
4. ✅ **大小王**：竖排 JOKER（18px）+ 王冠图标 - 不要中文

## 修改文件

### 1. `src/client/css/style.css`

#### 移除的内容
- 删除 `.card-value-bottom` 类定义
- 删除所有响应式媒体查询中的 `.card-value-bottom` 引用

#### 保留的样式
```css
/* 左上角：牌字 + 小花色 */
.card-value-top {
    position: absolute;
    top: 5px;
    left: 8px;
    font-size: 24px;
    font-weight: bold;
    display: flex;
    gap: 4px;
    line-height: 1;
}

/* 中央：一个大花色图标 */
.card-suit-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 80px;
    line-height: 1;
}

/* 大小王 - 竖排 JOKER + 王冠 */
.card.joker .card-value-top {
    font-size: 18px;
    font-weight: bold;
    writing-mode: vertical-rl;  /* 竖排 */
    text-orientation: mixed;
    position: absolute;
    top: 10px;
    left: 8px;
    letter-spacing: 2px;
}

.card.joker .card-suit-center {
    font-size: 60px;
}
```

### 2. `src/client/js/game.js`

#### 修改 `createCardElement` 函数

**大小王渲染：**
```javascript
if (card.suit === SUITS.JOKER) {
    // 大小王 - 竖排 JOKER + 王冠，不要中文
    const jokerClass = card.rank === RANKS.BIG_JOKER ? 'joker-big' : 'joker-small';
    cardEl.classList.add('joker', jokerClass);
    cardEl.innerHTML = `
        <div class="card-value-top">JOKER</div>
        <div class="card-suit-center">👑</div>
    `;
}
```

**普通牌渲染：**
```javascript
else {
    // 普通牌 - 左上角牌字 + 小花色，中央大花色
    cardEl.innerHTML = `
        <div class="card-value-top" style="color: ${suitColor}">${rankDisplay} ${suitDisplay}</div>
        <div class="card-suit-center" style="color: ${suitColor}">${suitDisplay}</div>
    `;
}
```

## 测试验证

### 测试文件
- `test_card_design.html` - 独立测试页面，展示所有牌面设计

### 测试步骤
1. 启动测试服务器：`python3 -m http.server 8000`
2. 访问测试页面：`http://localhost:8000/test_card_design.html`
3. 访问游戏页面：`http://localhost:8000/src/client/index.html`
4. 点击"新游戏"开始游戏，查看实际牌面效果

### 验证要点
- ✅ 普通牌左上角显示牌字和小花色（24px）
- ✅ 普通牌中央显示大花色图标（80px）
- ✅ 普通牌右下角无内容（已移除）
- ✅ 大小王左侧显示竖排"JOKER"文字（18px，writing-mode: vertical-rl）
- ✅ 大小王中央显示王冠图标👑（60px）
- ✅ 大小王无中文"大王"/"小王"文字
- ✅ 红桃花色和方块花色为红色（#C41E3A）
- ✅ 黑桃花色和梅花花色为绿色（#2E8B57）
- ✅ 大王为红色，小王为绿色

## 响应式设计

所有响应式媒体查询已同步更新，移除右下角元素引用：

- **平板（≤1024px）**：左上角 20px，中央 64px
- **手机（≤768px）**：左上角 16px，中央 48px
- **小手机（≤480px）**：左上角 14px，中央 40px

## 完成状态

✅ 所有修改已完成
✅ 所有测试通过
✅ 设计符合用户最终确认要求

---

**作者：** 代码虾  
**版本：** v1.3  
**状态：** 已完成
