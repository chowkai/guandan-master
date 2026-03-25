# Phase 3.4 游戏逻辑开发文档

**完成日期**: 2026-03-23  
**版本**: 1.0.0

## 任务概述

Phase 3.4 完成了掼蛋游戏的核心逻辑实现，包括游戏状态管理、玩家轮流出牌、AI 决策引擎和胜负判断。

## 规则更新

### 1. 核弹定义修订
- **4-5 张相同**: 炸弹（Bomb）⭐⭐⭐⭐
- **6 张及以上相同**: 核弹（Nuclear Bomb）⭐⭐⭐⭐⭐⭐
- **优先级**: 四大天王 > 同花顺 > 核弹 (6 张+) > 炸弹 (4-5 张)

### 2. 飞机牌型新增
- **飞机**: 3 个或更多连续的三张（如 333444555）
- **可带牌**: 可选带对子或单张（带牌数量 = 三张数量）
- **优先级**: 与钢板相同（⭐⭐⭐）
- **注意**: 2 个连续三张（6 张）仍为钢板

### 3. 级牌与百搭
- **级牌**: 当前打几的牌（如打 2，则 2 是级牌）
- **百搭**: 红心级牌可替代任意非王牌
- **实现**: 牌型判断需要考虑百搭牌（待完善）

### 4. 进贡还贡规则
- **进贡**: 输家给赢家进贡（按名次）
- **还贡**: 赢家还一张牌给输家
- **抗贡**: 双下时，进贡方可以抗贡

## 实现文件

### 核心文件

1. **utils/game-logic.ts** (新增)
   - 游戏状态管理
   - 玩家轮流出牌
   - AI 决策引擎
   - 胜负判断
   - 进贡还贡逻辑

2. **utils/hand-type.ts** (更新)
   - 新增 `AIRPLANE` 牌型（飞机）
   - 新增 `TRIPLE_WITH_SINGLE` 牌型（三带一）
   - 更新核弹定义（6 张+）
   - 更新炸弹定义（4-5 张）
   - 更新牌型优先级

3. **tests/game-logic.test.ts** (新增)
   - 游戏状态管理测试
   - 玩家轮流出牌测试
   - AI 决策引擎测试
   - 胜负判断测试
   - 新牌型识别测试

## API 文档

### 游戏状态管理

```typescript
enum GameState {
  IDLE = 'idle',              // 等待开始
  DEALING = 'dealing',        // 发牌中
  PLAYING = 'playing',        // 游戏中
  TRIBUTE = 'tribute',        // 进贡阶段
  RETURN_TRIBUTE = 'return',  // 还贡阶段
  GAME_OVER = 'game_over'     // 游戏结束
}

interface Game {
  state: GameState;
  players: Player[];
  currentTurn: number;        // 当前出牌玩家索引（0-3）
  lastHand: HandType | null;  // 上家出的牌
  lastPlayerIndex: number;    // 最后出牌的玩家索引
  level: number;              // 当前级牌（2-14）
  wildCard: Card | null;      // 红心级牌（百搭）
  bottomCards: Card[];        // 底牌（8 张）
  tributeInfo: TributeInfo | null;
  passCount: number;
  round: number;
}
```

### 核心函数

#### 游戏流程

```typescript
// 创建新游戏
function createGame(players: Player[], level: number = 2): Game

// 开始游戏（进入发牌阶段）
function startGame(game: Game): Game

// 发牌完成（进入游玩阶段）
function finishDealing(game: Game, bottomCards: Card[]): Game

// 玩家出牌
function playCards(game: Game, playerIndex: number, cards: Card[]): Game

// 玩家 Pass
function passTurn(game: Game, playerIndex: number): Game

// 下一个玩家回合
function nextTurn(game: Game): Game
```

#### AI 决策

```typescript
interface AIDecision {
  action: 'play' | 'pass';
  cards?: Card[];
  confidence: number;  // 0-1
  reason: string;
}

// AI 决策引擎
function aiDecision(player: Player, game: Game): AIDecision
```

**AI 类型**:
- `conservative` 🦉 - 保守型：谨慎出牌，优先小牌
- `aggressive` 🦅 - 激进型：主动进攻，优先大牌
- `balanced` 🦊 - 平衡型：灵活多变

#### 胜负判断

```typescript
interface GameResult {
  winner: Player;
  ranking: Player[];      // 名次排序（1-4）
  isDoubleWin: boolean;   // 是否双下
  attackWin: boolean;     // 攻方是否赢
  levelUp: number;        // 升级数（0-3）
}

// 判断游戏结果
function judgeGameResult(game: Game): GameResult
```

**升级规则**:
- 头游 + 二游 → 攻方升 2 级
- 头游 + 末游 → 平局，不升级
- 双下（头游 + 二游都是队友） → 升 3 级

#### 进贡还贡

```typescript
// 进贡
function doTribute(game: Game, fromPlayerIndex: number, toPlayerIndex: number, card: Card): Game

// 还贡
function doReturnTribute(game: Game, fromPlayerIndex: number, toPlayerIndex: number, card: Card): Game

// 抗贡
function doAntiTribute(game: Game, playerIndex: number): Game

// 进入进贡阶段
function enterTributePhase(game: Game, loserIndex: number, winnerIndex: number): Game
```

### 辅助函数

```typescript
// 获取可出牌提示
function getPlayableHints(player: Player, game: Game): HandType[]

// 评估手牌强度（0-100）
function evaluateHandStrength(hand: Card[]): number

// 检查是否可以使用百搭牌
function canUseWildCard(card: Card, game: Game): boolean

// 使用百搭牌替代
function useWildCardAs(wildCard: Card, asValue: number, asSuit?: Card['suit']): Card
```

## 牌型优先级

| 优先级 | 牌型 | 最少牌数 | 说明 |
|--------|------|----------|------|
| 12 | 核弹 | 6 张 | 6 张及以上相同 |
| 11 | 四大天王 | 4 张 | 4 张王 |
| 10 | 同花顺 | 5 张 | 同花色顺子 |
| 9 | 炸弹 | 4-5 张 | 4-5 张相同 |
| 8 | 飞机/钢板 | 6-9 张 | 连续三张 |
| 6 | 连对 | 6 张 | 3 对连续 |
| 5 | 顺子 | 5 张 | 5 张连续 |
| 4 | 三带二/三带一 | 4-5 张 | 三张带牌 |
| 3 | 三张 | 3 张 | 三张相同 |
| 2 | 对子 | 2 张 | 对子 |
| 1 | 单张 | 1 张 | 单牌 |

## 测试覆盖

### 单元测试

运行测试：
```bash
cd /home/zhoukai/openclaw/workspace/guandan-miniprogram
npm test
```

**测试文件**:
- `tests/card-system.test.ts` - 41 个测试（卡牌系统）
- `tests/game-logic.test.ts` - 22 个测试（游戏逻辑）

**总计**: 63 个测试全部通过 ✅

### 测试覆盖范围

1. **游戏状态管理**
   - ✅ 创建新游戏
   - ✅ 开始游戏
   - ✅ 完成发牌

2. **玩家轮流出牌**
   - ✅ 玩家出牌
   - ✅ 玩家 Pass
   - ✅ 下一个玩家
   - ✅ 连续 Pass 重置

3. **AI 决策引擎**
   - ✅ 保守型 AI
   - ✅ 激进型 AI
   - ✅ 平衡型 AI
   - ✅ AI Pass 逻辑

4. **胜负判断**
   - ✅ 游戏结果判断
   - ✅ 双下识别
   - ✅ 升级计算

5. **新牌型识别**
   - ✅ 核弹（6 张+）
   - ✅ 飞机（3+ 连续三张）
   - ✅ 飞机带对子
   - ✅ 三带一
   - ✅ 炸弹（4-5 张）
   - ✅ 牌型优先级

## 使用示例

### 初始化游戏

```typescript
import { createGame, startGame, finishDealing } from './utils/game-logic';
import { createFullDeck, deal } from './utils/card-core';

// 创建玩家
const players = [
  { id: 'p1', name: '玩家 1', hand: [], isAI: true, aiType: 'balanced', isPartner: true, finished: false },
  { id: 'p2', name: '玩家 2', hand: [], isAI: true, aiType: 'aggressive', isPartner: false, finished: false },
  { id: 'p3', name: '玩家 3', hand: [], isAI: true, aiType: 'conservative', isPartner: true, finished: false },
  { id: 'p4', name: '玩家 4', hand: [], isAI: true, aiType: 'balanced', isPartner: false, finished: false }
];

// 创建游戏
let game = createGame(players, 2);  // 打 2

// 开始游戏
game = startGame(game);

// 发牌
const deck = createFullDeck();
const dealResult = deal(deck);

players[0].hand = dealResult.player1;
players[1].hand = dealResult.player2;
players[2].hand = dealResult.player3;
players[3].hand = dealResult.player4;

game.players = players;
game = finishDealing(game, dealResult.bottom);
```

### 玩家出牌

```typescript
import { playCards, passTurn, nextTurn } from './utils/game-logic';

// 玩家 0 出牌
const cardsToPlay = game.players[0].hand.slice(0, 1);  // 出单张
game = playCards(game, 0, cardsToPlay);

// 更新当前玩家
game = nextTurn(game);

// 玩家 1 Pass
game = passTurn(game, 1);
game = nextTurn(game);
```

### AI 自动出牌

```typescript
import { aiDecision } from './utils/game-logic';

// AI 玩家决策
const player = game.players[game.currentTurn];
if (player.isAI) {
  const decision = aiDecision(player, game);
  
  if (decision.action === 'play') {
    game = playCards(game, game.currentTurn, decision.cards!);
  } else {
    game = passTurn(game, game.currentTurn);
  }
  
  game = nextTurn(game);
}
```

### 游戏结束判断

```typescript
import { judgeGameResult, GameState } from './utils/game-logic';

if (game.state === GameState.GAME_OVER) {
  const result = judgeGameResult(game);
  
  console.log(`获胜者：${result.winner.name}`);
  console.log(`是否双下：${result.isDoubleWin}`);
  console.log(`升级数：${result.levelUp}`);
  
  // 排名
  result.ranking.forEach((player, index) => {
    console.log(`${index + 1}. ${player.name}`);
  });
}
```

## 待完善功能

### 1. 百搭牌逻辑
- [ ] 牌型判断时考虑百搭牌替代
- [ ] AI 决策时考虑百搭牌使用策略

### 2. 进贡还贡完整流程
- [ ] 自动判断进贡顺序（按名次）
- [ ] 自动选择进贡牌（最大牌）
- [ ] 自动选择还贡牌（最小牌）
- [ ] 抗贡条件判断

### 3. AI 优化
- [ ] 记牌功能
- [ ] 队友配合策略
- [ ] 级牌使用策略
- [ ] 炸弹使用策略

### 4. 性能优化
- [ ] 牌型判断缓存
- [ ] AI 决策优化

## 下一步计划

### Phase 3.5 游戏界面集成
- [ ] 将游戏逻辑集成到小程序页面
- [ ] 实现出牌动画
- [ ] 实现 AI 自动出牌演示
- [ ] 实现游戏结果显示

### Phase 3.6 网络对战
- [ ] 集成信令服务器
- [ ] 实现多人在线对战
- [ ] 实现房间管理
- [ ] 实现聊天功能

## 变更日志

### v1.0.0 (2026-03-23)
- ✅ 新增游戏状态管理
- ✅ 新增玩家轮流出牌逻辑
- ✅ 新增 AI 决策引擎（3 种类型）
- ✅ 新增胜负判断
- ✅ 新增进贡还贡逻辑
- ✅ 更新核弹定义（6 张+）
- ✅ 更新炸弹定义（4-5 张）
- ✅ 新增飞机牌型
- ✅ 新增三带一牌型
- ✅ 新增 63 个单元测试
