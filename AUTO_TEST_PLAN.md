# 掼蛋大师 - 自动化测试计划

## 🐛 待验证 BUG

### BUG 1: 开新局没有玩家出牌
**现象**: 开始新游戏后，始终无法出牌

**可能原因**:
1. `currentTurn` 未正确设置
2. AI 逻辑卡住
3. 事件监听未绑定
4. 发牌动画未完成就尝试出牌

**测试步骤**:
```javascript
// 浏览器 Console 执行
const game = window.gameInstance;  // 假设有全局引用

// 检查 1: currentTurn 是否设置
console.log('currentTurn:', game.state.currentTurn);

// 检查 2: gameStatus 是否正确
console.log('gameStatus:', game.state.gameStatus);

// 检查 3: 玩家手牌是否存在
console.log('my hand:', game.state.players['bottom']);

// 检查 4: 出牌按钮是否可点击
console.log('play button:', document.getElementById('btn-play'));
```

### BUG 2: 发牌时挤开画面
**现象**: 发牌动画导致 UI 布局错乱

**可能原因**:
1. 卡牌容器未预设高度
2. 发牌动画使用 absolute 定位但容器无相对定位
3. 响应式布局未考虑动画空间

**检查点**:
```css
/* 检查发牌容器是否有相对定位 */
#player-bottom .hand-cards {
    position: relative;  /* 必须有 */
    min-height: 200px;   /* 预设高度 */
}

/* 检查发牌动画 */
.dealing-card {
    position: absolute;  /* 绝对定位 */
    z-index: 1000;       /* 在最上层 */
}
```

---

## 🤖 AI 自动化测试方案

### 方案 1: Puppeteer 端到端测试

```javascript
// tests/e2e/game.test.js
const puppeteer = require('puppeteer');

describe('掼蛋游戏 UI 测试', () => {
    let browser;
    let page;
    
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.goto('http://localhost:8000/src/client/');
    });
    
    test('开新局应该能正常出牌', async () => {
        // 点击新游戏
        await page.click('#btn-start-game');
        
        // 等待发牌完成
        await page.waitForSelector('.hand-cards .playing-card', { timeout: 10000 });
        
        // 检查提示条
        const turnMessage = await page.$eval('#turn-message', el => el.textContent);
        expect(turnMessage).toMatch(/轮到你先出牌|XX 先出牌/);
        
        // 检查出牌按钮
        const playButton = await page.$('#btn-play');
        const isDisabled = await page.evaluate(el => el.disabled, playButton);
        
        // 如果是玩家回合，按钮应该可用
        if (turnMessage.includes('你')) {
            expect(isDisabled).toBe(false);
        }
        
        // 截图
        await page.screenshot({ path: 'tests/screenshots/new-game.png' });
    }, 30000);
    
    test('AI 应该能正常出牌', async () => {
        // 等待 AI 回合
        await page.waitForFunction(() => {
            const msg = document.querySelector('#turn-message');
            return msg && msg.textContent.includes('AI');
        }, { timeout: 30000 });
        
        // 等待 AI 出牌完成
        await page.waitForSelector('.played-cards .playing-card', { timeout: 10000 });
        
        // 截图
        await page.screenshot({ path: 'tests/screenshots/ai-turn.png' });
    }, 60000);
    
    afterAll(async () => {
        await browser.close();
    });
});
```

### 方案 2: 内置调试模式

```javascript
// 在 game.js 中添加调试命令
class Game {
    constructor() {
        // ... 现有代码 ...
        
        // 调试命令
        if (window.location.search.includes('debug=true')) {
            this.enableDebugMode();
        }
    }
    
    enableDebugMode() {
        console.log('🎮 调试模式已启用');
        
        // 暴露 game 实例到全局
        window.gameInstance = this;
        
        // 添加调试命令
        window.debug = {
            // 强制玩家回合
            forcePlayerTurn: () => {
                this.state.currentTurn = PLAYER_POSITIONS.BOTTOM;
                this.updateTurnIndicator();
                console.log('✅ 已强制玩家回合');
            },
            
            // 跳过发牌动画
            skipDealAnimation: () => {
                this.state.dealAnimationComplete = true;
                console.log('✅ 已跳过发牌动画');
            },
            
            // 打印游戏状态
            status: () => {
                console.table({
                    currentTurn: this.state.currentTurn,
                    gameStatus: this.state.gameStatus,
                    myHandSize: this.state.players[PLAYER_POSITIONS.BOTTOM]?.length,
                    isPlayerTurn: this.state.currentTurn === PLAYER_POSITIONS.BOTTOM
                });
            },
            
            // 自动出牌测试
            autoPlay: async (times = 10) => {
                for (let i = 0; i < times; i++) {
                    if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
                        const card = this.state.players[PLAYER_POSITIONS.BOTTOM][0];
                        this.playCard([card]);
                        await this.sleep(1000);
                    }
                    await this.sleep(500);
                }
            }
        };
        
        console.log('🔧 可用命令:');
        console.log('  debug.forcePlayerTurn() - 强制玩家回合');
        console.log('  debug.skipDealAnimation() - 跳过发牌动画');
        console.log('  debug.status() - 打印游戏状态');
        console.log('  debug.autoPlay(10) - 自动出牌 10 次');
    }
}
```

---

## 📋 手动测试清单

### 快速测试（5 分钟）

```bash
# 1. 启动服务器
cd /home/zhoukai/openclaw/workspace/projects/guandan
python3 -m http.server 8000

# 2. 打开浏览器（带调试参数）
http://localhost:8000/src/client/?debug=true

# 3. 打开开发者工具（F12）

# 4. 点击"新游戏"

# 5. 在 Console 执行
debug.status()

# 6. 检查输出
✅ currentTurn 应该有值（不是 null）
✅ gameStatus 应该是 'playing'
✅ myHandSize 应该是 27
✅ isPlayerTurn 如果是 true，就可以出牌

# 7. 如果不是玩家回合
debug.forcePlayerTurn()

# 8. 尝试出牌
```

### 完整测试（30 分钟）

- [ ] 新游戏随机先手（测试 10 次）
- [ ] 玩家回合能出牌
- [ ] AI 回合自动出牌
- [ ] 提示条正确显示
- [ ] 发牌动画不遮挡 UI
- [ ] 贡牌流程正常
- [ ] 游戏结束能再来一局

---

## 🛠️ 修复建议

### 如果 currentTurn 为 null

**修复**:
```javascript
// game.js 第 228 行 startNewGame()
async startNewGame() {
    this.state = new GameState();
    
    // ... 发牌 ...
    
    // 确保 currentTurn 一定被设置
    const positions = Object.values(PLAYER_POSITIONS);
    this.state.currentTurn = positions[Math.floor(Math.random() * 4)];
    this.state.gameStatus = 'playing';
    
    console.log('✅ currentTurn set to:', this.state.currentTurn);
    
    this.updateTurnIndicator();
}
```

### 如果发牌遮挡 UI

**修复**:
```css
/* style.css */
.hand-cards {
    position: relative;
    min-height: 200px;  /* 预留空间 */
}

.dealing-card {
    position: absolute;
    z-index: 1000;
    pointer-events: none;  /* 不阻挡点击 */
}
```

---

## 📊 测试结果记录

| 测试项 | 日期 | 结果 | 备注 |
|--------|------|------|------|
| 新游戏随机先手 | | ⬜ 待测 | |
| 玩家能出牌 | | ⬜ 待测 | |
| AI 自动出牌 | | ⬜ 待测 | |
| 提示条显示 | | ⬜ 待测 | |
| 发牌不遮挡 | | ⬜ 待测 | |

---

**下一步**: 运行测试 → 记录结果 → 修复 BUG → 重新测试
