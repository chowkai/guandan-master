# 掼蛋大师 - UI 测试 Agent

## 🤖 Agent 职责

**专业 UI/UX 测试**，包括：
- ✅ 自动化点击测试
- ✅ 视觉回归测试（截图对比）
- ✅ 交互流程测试
- ✅ 性能测试（加载时间/帧率）
- ✅ 响应式测试（多设备）
- ✅ 无障碍测试
- ✅ Console 错误监控

---

## 🧪 测试用例

### Test 1: 开新局功能

```javascript
async function testNewGame() {
    console.log('🎮 测试：开新局');
    
    // 1. 打开页面
    await page.goto('http://localhost:8000/');
    
    // 2. 点击新游戏
    await page.click('#btn-start-game');
    
    // 3. 等待发牌完成（最多 10 秒）
    await page.waitForFunction(() => {
        const game = window.guandanGame;
        return game && game.dealAnimationComplete;
    }, { timeout: 10000 });
    
    // 4. 检查游戏状态
    const status = await page.evaluate(() => {
        const game = window.guandanGame;
        return {
            currentTurn: game.state.currentTurn,
            gameStatus: game.state.gameStatus,
            myHandSize: game.state.players.bottom?.length,
            dealComplete: game.dealAnimationComplete
        };
    });
    
    // 5. 验证
    console.assert(status.myHandSize === 27, '手牌应该是 27 张');
    console.assert(status.currentTurn !== null, '应该设置先手玩家');
    console.assert(status.gameStatus === 'playing', '游戏状态应该是 playing');
    
    // 6. 截图
    await page.screenshot({ path: 'tests/screenshots/new-game.png' });
    
    console.log('✅ 开新局测试完成');
    return status;
}
```

### Test 2: 出牌功能

```javascript
async function testPlayCard() {
    console.log('🃏 测试：出牌功能');
    
    // 1. 确保是玩家回合
    const isPlayerTurn = await page.evaluate(() => {
        return window.guandanGame.state.currentTurn === 'bottom';
    });
    
    if (!isPlayerTurn) {
        console.log('⏭️ 跳过：不是玩家回合');
        return;
    }
    
    // 2. 选择第一张牌
    await page.click('.playing-card:first-child');
    
    // 3. 点击出牌按钮
    await page.click('#btn-play');
    
    // 4. 等待出牌完成
    await page.waitForSelector('.played-cards .playing-card', { timeout: 5000 });
    
    // 5. 验证手牌减少
    const handSize = await page.evaluate(() => {
        return window.guandanGame.state.players.bottom.length;
    });
    
    console.assert(handSize === 26, '出牌后手牌应该是 26 张');
    
    // 6. 截图
    await page.screenshot({ path: 'tests/screenshots/play-card.png' });
    
    console.log('✅ 出牌功能测试完成');
}
```

### Test 3: 提示条显示

```javascript
async function testTurnIndicator() {
    console.log('📊 测试：提示条显示');
    
    // 1. 检查提示条是否存在
    const indicatorExists = await page.$('#turn-indicator');
    console.assert(indicatorExists, '提示条应该存在');
    
    // 2. 检查提示条内容
    const message = await page.$eval('#turn-message', el => el.textContent);
    console.log('提示条内容:', message);
    
    // 3. 检查背景色
    const bgColor = await page.$eval('#turn-message', el => 
        window.getComputedStyle(el.parentElement).background
    );
    console.log('背景色:', bgColor);
    
    // 4. 验证颜色逻辑
    if (message.includes('你')) {
        console.assert(bgColor.includes('27ae60'), '玩家回合应该是绿色');
    } else {
        console.assert(bgColor.includes('c0392b'), 'AI 回合应该是红色');
    }
    
    // 5. 截图
    await page.screenshot({ path: 'tests/screenshots/turn-indicator.png' });
    
    console.log('✅ 提示条显示测试完成');
}
```

### Test 4: Console 错误监控

```javascript
async function monitorConsoleErrors() {
    console.log('🔍 监控 Console 错误');
    
    const errors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
        }
    });
    
    // 执行游戏操作
    await page.click('#btn-start-game');
    await page.waitForTimeout(5000);
    
    // 报告错误
    if (errors.length > 0) {
        console.log('❌ 发现错误:');
        errors.forEach(err => {
            console.log(`  - ${err.text} at ${err.location.url}:${err.location.lineNumber}`);
        });
    } else {
        console.log('✅ 没有发现 Console 错误');
    }
    
    return errors;
}
```

### Test 5: 性能测试

```javascript
async function testPerformance() {
    console.log('⚡ 性能测试');
    
    // 1. 测量发牌时间
    const startTime = Date.now();
    
    await page.click('#btn-start-game');
    await page.waitForFunction(() => {
        return window.guandanGame?.dealAnimationComplete;
    }, { timeout: 15000 });
    
    const dealTime = Date.now() - startTime;
    console.log(`发牌耗时：${dealTime}ms`);
    
    // 2. 测量帧率
    const fps = await page.evaluate(() => {
        let frames = 0;
        let lastTime = performance.now();
        let fps = 0;
        
        function count() {
            frames++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                fps = frames;
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(count);
        }
        count();
        
        // 1 秒后返回 FPS
        return new Promise(resolve => {
            setTimeout(() => resolve(fps), 1000);
        });
    });
    
    console.log(`当前帧率：${fps} FPS`);
    
    // 3. 验证性能指标
    console.assert(dealTime < 10000, '发牌时间应该 < 10 秒');
    console.assert(fps >= 30, '帧率应该 >= 30 FPS');
    
    console.log('✅ 性能测试完成');
}
```

---

## 📋 测试清单

### 功能测试
- [ ] 开新局功能
- [ ] 发牌动画
- [ ] 先手玩家设置
- [ ] 出牌功能
- [ ] 不要功能
- [ ] 提示功能
- [ ] 排序功能
- [ ] 游戏结束判定

### UI 测试
- [ ] 提示条显示
- [ ] 手牌显示
- [ ] 出牌区显示
- [ ] 玩家信息栏
- [ ] 按钮状态
- [ ] 响应式布局

### 性能测试
- [ ] 发牌时间 < 10 秒
- [ ] 帧率 >= 30 FPS
- [ ] 内存占用 < 200MB
- [ ] 无 Console 错误

### 兼容性测试
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] 桌面端 (1920px)
- [ ] 平板端 (1024px)
- [ ] 手机端 (768px/480px)

---

## 🚀 运行测试

### 方式 1: Puppeteer (Node.js)

```bash
# 安装依赖
npm install puppeteer

# 运行测试
node tests/ui-test.js
```

### 方式 2: Playwright (推荐)

```bash
# 安装
npm install -D @playwright/test

# 运行测试
npx playwright test
```

### 方式 3: OpenClaw Browser 工具

```javascript
// 使用 OpenClaw 的 browser 工具直接测试
browser(action="open", targetUrl="http://localhost:8000/")
browser(action="act", kind="click", ref="e6")
browser(action="act", kind="evaluate", fn="() => game.state")
```

---

## 📊 测试报告模板

```markdown
# UI 测试报告

**日期**: 2026-03-21
**版本**: v1.3
**测试环境**: Chrome 122, 1920x1080

## 测试结果

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 开新局 | ❌ 失败 | currentTurn 为 null |
| 发牌动画 | ✅ 通过 | 耗时 5.4 秒 |
| 提示条显示 | ⚠️ 部分 | 内容不正确 |
| 出牌功能 | ⬜ 未测 | 依赖开新局 |

## Console 错误

```
无错误 / 或列出错误列表
```

## 性能指标

- 发牌时间：5400ms
- 帧率：60 FPS
- 内存：120MB

## 建议

1. 修复 currentTurn 设置问题
2. 优化发牌动画性能
3. 改进提示条显示逻辑
```

---

**测试 Agent 已就绪！** 随时可以执行 UI 测试。
