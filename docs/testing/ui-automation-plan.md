# UI 自动化测试方案

**版本**: v1.0  
**创建日期**: 2026-03-24  
**目的**: 让自动化测试能够检测 UI 渲染、交互、视觉问题

---

## 📋 问题回顾

当前 110 个测试用例**无法检测**的问题：
- ❌ 组件是否可见（白色椭圆 vs 卡牌）
- ❌ 组件位置是否正确
- ❌ 样式是否正确（颜色、大小）
- ❌ 点击是否有反应
- ❌ 布局是否错乱

---

## 🎯 解决方案分层

### 层级 1: 组件单元测试（立即实施）✅

**测试内容**:
- 组件是否正确渲染（DOM 存在）
- 属性是否正确传递
- 事件是否正确触发

**工具**: Jest + 微信小程序测试框架

**示例**:
```typescript
// tests/components/card.test.ts
describe('Card Component', () => {
  test('should render card with suit and value', () => {
    const card = render(CardComponent, {
      suit: 'heart',
      value: 'A'
    });
    
    expect(card.exists()).toBe(true);
    expect(card.data.suit).toBe('heart');
    expect(card.data.value).toBe('A');
  });
  
  test('should trigger cardtap event on click', () => {
    const card = render(CardComponent, {
      suit: 'heart',
      value: 'A',
      isPlayable: true
    });
    
    const eventHandler = jest.fn();
    card.on('cardtap', eventHandler);
    card.trigger('onTap');
    
    expect(eventHandler).toHaveBeenCalledWith({
      suit: 'heart',
      value: 'A',
      isSelected: false
    });
  });
});
```

---

### 层级 2: 视觉回归测试（推荐实施）🔧

**测试内容**:
- 截图对比（检测 UI 变化）
- 组件位置检测
- 颜色/样式验证

**工具选项**:

| 工具 | 优点 | 缺点 | 成本 |
|------|------|------|------|
| **Percy** | 成熟、集成好 | 需 CI/CD | $199/月 |
| **Chromatic** | Storybook 集成 | 需配置 | $149/月 |
| **BackstopJS** | 开源免费 | 配置复杂 | 免费 |
| **Playwright** | 微软出品、功能强 | 学习曲线 | 免费 |

**推荐**: **Playwright** (免费 + 功能强大)

**示例**:
```typescript
// tests/visual/game-page.spec.ts
import { test, expect } from '@playwright/test';

test('game page should render cards correctly', async ({ page }) => {
  // 打开小程序（需模拟器）
  await page.goto('/pages/game/game');
  
  // 截图对比
  await expect(page).toHaveScreenshot('game-page-initial.png');
  
  // 检测卡牌数量
  const cards = page.locator('.card-container');
  await expect(cards).toHaveCount(27);
  
  // 检测卡牌内容
  const firstCard = cards.first();
  await expect(firstCard).toBeVisible();
  
  // 点击卡牌
  await firstCard.click();
  
  // 检测选中状态
  await expect(firstCard).toHaveClass(/selected/);
});
```

---

### 层级 3: E2E 测试（完整流程）🚀

**测试内容**:
- 完整用户流程
- 页面跳转
- 交互反馈

**工具**: 
- 微信开发者工具 CLI + 自动化脚本
- Miniprogram-simulate (官方测试框架)

**示例**:
```typescript
// tests/e2e/game-flow.test.ts
describe('Game Flow E2E', () => {
  test('should complete a full game round', async () => {
    // 1. 打开游戏页面
    await navigateTo('/pages/game/game');
    
    // 2. 验证手牌已发
    const handArea = await getComponent('hand-area');
    expect(handArea.data.cards.length).toBe(27);
    
    // 3. 点击选牌
    await tapCard('heart', 'A');
    
    // 4. 验证选中状态
    const selectedCards = await getSelectedCards();
    expect(selectedCards.length).toBe(1);
    
    // 5. 点击出牌
    await tapButton('play-btn');
    
    // 6. 验证出牌成功
    const playArea = await getComponent('play-area');
    expect(playArea.data.currentPlay.length).toBe(1);
  });
});
```

---

## 🛠️ 实施步骤

### 阶段 1: 组件测试（1-2 小时）

```bash
# 1. 安装测试框架
cd miniprogram
npm install --save-dev miniprogram-simulate jest ts-jest @types/jest

# 2. 创建测试配置
# jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};

# 3. 编写组件测试
# tests/components/card.test.ts
```

### 阶段 2: 视觉测试（4-8 小时）

```bash
# 1. 安装 Playwright
npm install --save-dev @playwright/test

# 2. 配置 playwright.config.ts
# 3. 编写视觉测试
# 4. 生成基准截图
# 5. 集成到 CI/CD
```

### 阶段 3: E2E 测试（8-16 小时）

```bash
# 1. 配置微信开发者工具 CLI
# 2. 编写 E2E 测试脚本
# 3. 集成到自动化流程
```

---

## 📊 测试覆盖矩阵

| 测试类型 | 组件渲染 | 样式正确 | 事件触发 | 布局正确 | 流程完整 |
|----------|----------|----------|----------|----------|----------|
| **单元测试** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **视觉测试** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **E2E 测试** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 立即行动方案

### 方案 A: 快速验证（推荐先用）

**添加运行时断言**，在控制台输出关键信息：

```typescript
// 在组件中添加
onReady() {
  console.assert(this.data.cards.length > 0, '手牌数应为正数');
  console.assert(this.data.cards[0]?.suit, '卡牌应有花色');
  console.assert(this.data.cards[0]?.value, '卡牌应有牌面值');
}
```

### 方案 B: 完整实施（长期方案）

按上述三个阶段逐步实施。

---

## 📝 当前调试清单

**请检查微信开发者工具控制台**：

```
[Card] onTap called, isPlayable: true/false
[Card] Toggling selection: heart A -> true/false
[Card] Event triggered: cardtap
[HandArea] onCardTap received: {...}
[HandArea] Triggering cardselect event: ...
[Game] onCardSelect received: {...}
[Game] Current selected: X cards
[Game] Added/Removed card: ...
```

**如果看不到这些日志**：
1. 代码未更新 → 重新编译
2. 组件未渲染 → 检查数据传递
3. 事件未绑定 → 检查事件名

---

## 🔧 已修复的问题

1. ✅ 事件链断裂 → 统一事件名为 `cardselect`
2. ✅ z-index 层级 → 确保卡牌在最上层
3. ✅ pointer-events → 确保可点击
4. ✅ 调试日志 → 追踪事件流
5. ✅ 手牌数量 → 27 张（非 29 张）

---

**下一步**: 重新编译，查看控制台日志，告诉我输出了什么！
