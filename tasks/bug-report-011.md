# BUG-011: 缺少首发者提示信息

**发现日期**: 2026-03-25  
**发现人**: 用户  
**优先级**: P1（影响游戏体验）  
**状态**: ⏳ 待修复

---

## 问题描述

游戏主画面没有信息提示区，无法看到当前该谁出牌、首发者是谁等关键信息。

---

## 复现步骤

1. 开始新游戏
2. 观察游戏主界面
3. 等待出牌阶段

---

## 预期结果

- 顶部有信息提示区（高度约 40-50px）
- 显示"当前出牌：玩家 X"或"等待 XX 出牌..."
- 开局时高亮提示"玩家 X 首发"

---

## 实际结果

- 无信息提示区
- 不知道当前该谁出牌
- 不知道谁是首发者

---

## 影响范围

- 所有用户
- 游戏流程不清晰
- 严重影响游戏体验

---

## 根本原因

1. 需求文档中明确了"开局随机指定首发玩家"
2. UI 设计稿中未设计提示信息区
3. 开发按设计稿实现，遗漏此功能
4. 测试未验证游戏流程信息提示

---

## 修复方案

### UI 设计补充

```markdown
## 信息提示区设计

### 位置
- 屏幕顶部
- 高度：50px
- 背景：半透明黑色 (#00000080)
- 文字：白色，居中

### 显示内容
- 开局："玩家 X 首发"（高亮，黄色 #FFD700）
- 出牌中："当前出牌：玩家 X"
- 等待中："等待 XX 出牌..."
- Pass 后："玩家 X Pass，下一位"

### 动画
- 状态变化时淡入淡出（0.3s）
```

### 代码实现

```wxml
<!-- guandan-miniprogram/pages/game/game.wxml -->

<view class="game-container">
  <!-- 信息提示区（新增） -->
  <view class="info-bar {{isFirstTurn ? 'highlight' : ''}}">
    <text class="info-text">{{infoText}}</text>
  </view>
  
  <!-- 其他游戏内容 -->
</view>
```

```wxss
.info-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.info-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.info-bar.highlight {
  background: rgba(255, 215, 0, 0.8);
}

.info-bar.highlight .info-text {
  color: #000;
}
```

```typescript
// guandan-miniprogram/pages/game/game.ts

Page({
  data: {
    infoText: '',
    isFirstTurn: false,
    currentPlayer: 0,
    // ...
  },

  onLoad() {
    this.startGame();
  },

  startGame() {
    // 随机指定首发玩家
    const firstPlayer = Math.floor(Math.random() * 4);
    this.setData({
      currentPlayer: firstPlayer,
      infoText: `玩家${firstPlayer + 1} 首发`,
      isFirstTurn: true
    });

    // 3 秒后恢复正常显示
    setTimeout(() => {
      this.updateInfoText();
    }, 3000);
  },

  updateInfoText() {
    const { currentPlayer } = this.data;
    this.setData({
      infoText: `当前出牌：玩家${currentPlayer + 1}`,
      isFirstTurn: false
    });
  },

  // ...
})
```

### 验证方法

1. 开局能看到首发提示
2. 出牌时显示当前玩家
3. 信息清晰可读

---

## 修复验证

**开发自测**:
- [ ] 开局首发提示显示
- [ ] 出牌信息正确
- [ ] 截图/录屏

**测试回归**:
- [ ] 游戏流程信息完整
- [ ] 截图/录屏

**用户确认**:
- [ ] 用户签字

---

## 关联问题

- 流程改进：设计评审必须检查需求完整性
- 验收标准：游戏流程信息必须显示

---

**创建时间**: 2026-03-25  
**修复人**: -  
**预计完成**: 2026-03-25
