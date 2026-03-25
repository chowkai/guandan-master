# BUG-010: onCardTap 事件未定义

**发现日期**: 2026-03-25  
**发现人**: 用户  
**优先级**: P0（功能不可用）  
**状态**: ⏳ 待修复

---

## 问题描述

选牌时控制台报错：`Component "pages/game/game" does not have a method "onCardTap" to handle event "tap"`，导致牌无法被选中。

---

## 复现步骤

1. 打开游戏页面
2. 点击任意卡牌
3. 打开控制台查看错误

---

## 预期结果

- 点击卡牌能正常选中/反选
- 控制台无错误
- 选中后卡牌向上移动 10-15px

---

## 实际结果

- 控制台报错
- 卡牌无法选中
- 无视觉反馈

---

## 影响范围

- 所有用户
- 核心交互功能完全不可用
- 游戏无法进行

---

## 根本原因

1. `card` 组件的 `tap` 事件绑定到了父组件
2. `pages/game/game.ts` 中未定义 `onCardTap` 处理方法
3. 代码审查未发现此问题
4. 自测未检查控制台错误

---

## 修复方案

### 代码修改

```typescript
// guandan-miniprogram/pages/game/game.ts

Page({
  data: {
    selectedCards: [],
    // ...
  },

  /**
   * 卡牌点击事件处理
   */
  onCardTap(event: any) {
    const { cardId } = event.currentTarget.dataset;
    if (!cardId) return;
    
    this.toggleCardSelection(cardId);
  },

  /**
   * 切换卡牌选中状态
   */
  toggleCardSelection(cardId: string) {
    const { selectedCards } = this.data;
    const index = selectedCards.indexOf(cardId);
    
    if (index > -1) {
      // 反选：移除
      selectedCards.splice(index, 1);
    } else {
      // 选中：添加（最多 5 张）
      if (selectedCards.length >= 5) {
        wx.showToast({ title: '最多选 5 张牌', icon: 'none' });
        return;
      }
      selectedCards.push(cardId);
    }
    
    this.setData({ selectedCards });
  },

  // ...
})
```

```wxml
<!-- guandan-miniprogram/components/card/card.wxml -->

<view 
  class="card {{isSelected ? 'selected' : ''}}"
  data-card-id="{{cardId}}"
  bind:tap="onCardTap"
>
  <!-- 卡牌内容 -->
</view>
```

```wxss
.card {
  transition: transform 0.2s ease;
}

.card.selected {
  transform: translateY(-12px); /* 向上移动 12px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### 验证方法

1. 控制台无错误
2. 点击卡牌能选中/反选
3. 选中后有向上位移效果

---

## 修复验证

**开发自测**:
- [ ] 控制台无错误
- [ ] 选中/反选功能正常
- [ ] 截图/录屏

**测试回归**:
- [ ] 功能测试通过
- [ ] 截图/录屏

**用户确认**:
- [ ] 用户签字

---

## 关联问题

- 流程改进：代码审查必须检查事件绑定
- 自测要求：必须检查控制台错误

---

**创建时间**: 2026-03-25  
**修复人**: dev-agent  
**预计完成**: 2026-03-25  
**实际完成**: 2026-03-25 09:15  
**状态**: ✅ 已修复，待用户验证

---

## 修复记录

**修复时间**: 2026-03-25 09:15  
**提交**: fd07beb

**修改内容**:
- `pages/game/game.ts`: 添加 onCardTap/toggleCardSelection 方法
- `pages/game/game.wxml`: 添加信息提示区
- `pages/game/game.wxss`: 添加信息提示区样式
- `components/card/card.wxml`: 添加 data-card-id
- `components/card/card.ts`: 传递 cardId 到事件
- `components/hand-area/hand-area.wxml`: 添加 data-card-id
- `components/hand-area/hand-area.ts`: 传递 cardId 到父组件
