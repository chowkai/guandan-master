# BUG-009: 卡牌间距太近（触摸不准确）

**发现日期**: 2026-03-25  
**发现人**: 用户  
**优先级**: P1（严重影响体验）  
**状态**: ⏳ 待修复

---

## 问题描述

卡牌之间的距离太近，导致手指在手机上无法准确选择目标卡牌。

---

## 复现步骤

1. 打开游戏页面
2. 尝试点击某张特定的牌
3. 观察是否能准确选中

---

## 预期结果

- 牌间距 ≥ 16px（确保手指触摸不误触）
- 单张牌触摸区域 ≥ 44×44pt（iOS 人机界面指南）
- 点击能准确选中目标卡牌

---

## 实际结果

- 牌间距过近（约 8-10px）
- 容易误触相邻的牌
- 触摸体验差

---

## 影响范围

- 所有移动端用户
- 核心交互功能
- 严重影响游戏体验

---

## 根本原因

1. 需求文档未量化牌间距标准
2. 设计文档未明确标注间距数值
3. 开发自测未测量实际间距
4. 测试未在真机验证触摸体验

---

## 修复方案

### 代码修改

```typescript
// guandan-miniprogram/components/hand-area/hand-area.wxml
// 修改牌间距样式

.hand-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 180px;
  padding: 0 20px;
}

.card-item {
  margin-left: 16px; /* 原 8px → 改为 16px */
  transition: transform 0.2s ease;
}

.card-item:first-child {
  margin-left: 0;
}

/* 小屏设备适配 */
@media (max-width: 375px) {
  .card-item {
    margin-left: 12px; /* 小屏最小 12px */
  }
}
```

### 验证方法

1. 使用开发者工具测量实际间距
2. 真机测试触摸准确性
3. 录屏验证

---

## 修复验证

**开发自测**:
- [ ] 间距测量 ≥ 16px
- [ ] 截图/录屏

**测试回归**:
- [ ] 真机触摸测试
- [ ] 截图/录屏

**用户确认**:
- [ ] 用户签字

---

## 关联问题

- 流程改进：`docs/process/full-process-spec-v2.md`
- 验收标准：`requirements/acceptance-criteria.md`

---

**创建时间**: 2026-03-25  
**修复人**: -  
**预计完成**: 2026-03-25
