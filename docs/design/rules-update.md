# 掼蛋规则补充说明（v2.0 修订）

**修订日期**: 2026-03-23 14:40  
**来源**: 用户反馈（1.0 版规则回顾 + 新增需求）

---

## 📋 规则修订清单

### 1. 核弹定义修订 ⭐⭐⭐

**原定义**（错误）: 8 张相同牌

**新定义**（正确）:
| 张数 | 名称 | 优先级 | 说明 |
|------|------|--------|------|
| 4 张 | 炸弹 | ⭐⭐⭐⭐ | 传统炸弹 |
| 5 张 | 炸弹 | ⭐⭐⭐⭐ | 5 张相同也是炸弹 |
| **6 张+** | **核弹** | ⭐⭐⭐⭐⭐ | **6 张及以上称为核弹** |
| 4 张王 | 四大天王 | ⭐⭐⭐⭐⭐⭐ | 最大牌型 |

**牌型大小顺序**（修订后）:
```
四大天王 > 核弹 (6 张+) > 同花顺 > 炸弹 (4-5 张) > 其他牌型
```

**实现调整**:
```typescript
enum CardType {
  // ... 其他牌型
  BOMB = 'bomb',           // 4-5 张相同（优先级 ⭐⭐⭐⭐）
  NUCLEAR_BOMB = 'nuclear_bomb',  // 6 张及以上相同（优先级 ⭐⭐⭐⭐⭐）⭐ 新增
  SAME_COLOR_STRAIGHT_FLUSH = 'same_color_straight_flush',  // 同花顺（优先级 ⭐⭐⭐⭐）
  FOUR_KINGS = 'four_kings',  // 四大天王（优先级 ⭐⭐⭐⭐⭐⭐）
}

// 牌型优先级比较
function compareHandTypePriority(type1: CardType, type2: CardType): number {
  const priority: Record<CardType, number> = {
    [CardType.FOUR_KINGS]: 6,           // 最高
    [CardType.NUCLEAR_BOMB]: 5,         // 核弹
    [CardType.SAME_COLOR_STRAIGHT_FLUSH]: 4,  // 同花顺
    [CardType.BOMB]: 3,                 // 炸弹
    // ... 其他牌型优先级 2-1
  };
  return priority[type2] - priority[type1];
}
```

---

### 2. 飞机牌型 ~~新增~~ ❌ **已取消**

**用户反馈**（2026-03-23 14:42）: "哦钢板牌型你已经有了，我疏忽了，飞机这条新增规则取消"

**现状**:
- ✅ 已有**钢板**牌型（2 个连续三张）
- ❌ **不新增**飞机牌型
- ✅ 保持原有 11 种牌型不变

---

### 3. 级牌概念 ⭐⭐⭐⭐⭐

**需求**: 本局级牌的红心可以替代任一张非王牌

**掼蛋级牌规则**:
- **级牌**: 当前打几的牌（如打 2，则 2 是级牌）
- **逢牌配**: 级牌红心（如红桃 2）可以替代任意非王牌
- **百搭牌**: 红心级牌 = 万能牌（除王外）

**实现**:
```typescript
interface GameConfig {
  level: number;           // 当前级牌（2-14，2=A,11=J,12=Q,13=K,14=A）
  wildSuit: 'hearts';      // 固定红心为百搭
  wildCard: Card;          // 红心级牌（如红桃 2）
}

// 牌型判断时，红心级牌可替代任意牌
function identifyHandTypeWithWild(cards: Card[], wildCard: Card): HandType | null {
  // 红心级牌可替代任意非王牌
  // 例如：22233 + 红桃级牌 = 222333（三带二）
  // 例如：2345 + 红桃级牌 = 23456（顺子）
}
```

**影响范围**:
- 发牌时需要标记级牌
- 牌型判断需要考虑百搭牌
- 出牌规则验证需要特殊处理
- 智能提示需要优先使用级牌配牌

---

### 4. 进贡还贡规则 ⭐⭐⭐⭐

**需求**: 进贡还贡的操作流程

**掼蛋进贡规则**:
- **进贡**: 输家给赢家进贡（按名次）
- **还贡**: 赢家还一张牌给输家
- **抗贡**: 双下时，进贡方可以抗贡（不还贡）

**进贡流程**（产品补充）:

#### 4.1 进贡时机
```
游戏结束 → 判定名次 → 进贡 → 还贡 → 下一局
```

#### 4.2 进贡规则
| 情况 | 进贡方 | 进贡对象 | 进贡张数 |
|------|--------|----------|----------|
| 头游 + 二游 | 三游 | 头游 | 1 张（最大牌） |
| 头游 + 二游 | 末游 | 二游 | 1 张（最大牌） |
| 双下（头游 + 末游） | 二游 + 三游 | 头游 + 末游 | 2 张（每人 1 张） |

#### 4.3 还贡规则
| 情况 | 还贡方 | 还贡对象 | 还贡张数 |
|------|--------|----------|----------|
| 正常情况 | 头游 | 三游 | 1 张（任意牌） |
| 正常情况 | 二游 | 末游 | 1 张（任意牌） |
| 抗贡（双下） | 头游/末游 | 二游/三游 | 0 张（不还贡） |

#### 4.4 UI 流程设计

**进贡阶段**:
```
┌─────────────────────────────────────┐
│         请选择进贡的牌              │
│                                     │
│   进贡给：头游玩家                  │
│   进贡张数：1 张（最大牌）          │
│                                     │
│   [♠A] [♥K] [♦Q] [♣J]...          │
│                                     │
│   [确认进贡]                        │
└─────────────────────────────────────┘
```

**还贡阶段**:
```
┌─────────────────────────────────────┐
│         请选择还贡的牌              │
│                                     │
│   还贡给：三游玩家                  │
│   还贡张数：1 张                    │
│                                     │
│   [♠2] [♥3] [♦4] [♣5]...          │
│                                     │
│   [确认还贡]  [抗贡]（如适用）      │
└─────────────────────────────────────┘
```

**实现**:
```typescript
interface TributePhase {
  phase: 'tribute' | 'return' | 'anti_tribute';
  tributeFrom: Player;
  tributeTo: Player;
  tributeCard: Card | null;
  returnCard: Card | null;
  isAntiTribute: boolean;
}

function startTributePhase(gameState: GameState): TributePhase;
function processTribute(tribute: TributePhase): GameState;
```

---

## 📊 牌型优先级总表（修订后）

| 优先级 | 牌型 | 说明 | 示例 |
|--------|------|------|------|
| ⭐⭐⭐⭐⭐⭐ | 四大天王 | 4 张王 | 👑👑👑👑 |
| ⭐⭐⭐⭐⭐ | **核弹** | **6 张及以上相同** | **222222** ⭐ |
| ⭐⭐⭐⭐ | 同花顺 | 同花色顺子 | ♥34567 |
| ⭐⭐⭐⭐ | 炸弹 | 4-5 张相同 | 2222、22222 |
| ⭐⭐⭐⭐ | 同花 | 5 张同花色（非顺子） | ♥23579 |
| ⭐⭐⭐ | 钢板 | 2 个连续三张 | 333444 ⭐ |
| ⭐⭐⭐ | 连对 | 3 对连续 | 334455 |
| ⭐⭐ | 顺子 | 5 张连续 | 34567 |
| ⭐⭐ | 三带二 | 三张 + 一对 | 33344 |
| ⭐ | 三张 | 3 张相同 | 333 |
| ⭐ | 对子 | 2 张相同 | 33 |
| ⭐ | 单张 | 单牌 | 3 |

---

## 🎯 级牌与百搭实现

### 级牌配置
```typescript
interface LevelConfig {
  level: number;        // 当前打几（2-14）
  wildCard: Card;       // 红心级牌（如红桃 2）
  isWild: (card: Card) => boolean;  // 判断是否为百搭
}

// 示例：打 2 时
const levelConfig: LevelConfig = {
  level: 2,
  wildCard: { suit: 'hearts', value: 2 },
  isWild: (card) => card.suit === 'hearts' && card.value === 2
};
```

### 百搭牌识别
```typescript
// 红心级牌可替代任意非王牌
function canSubstitute(wildCard: Card, targetCard: Card): boolean {
  if (!isWild(wildCard)) return false;
  if (targetCard.suit === 'joker') return false;  // 不能替代王
  return true;
}

// 牌型判断时考虑百搭
function identifyHandTypeWithWild(cards: Card[], wildCard: Card): HandType | null {
  // 分离百搭牌和普通牌
  const wildCards = cards.filter(c => isWild(c));
  const normalCards = cards.filter(c => !isWild(c));
  
  // 尝试用百搭牌配成各种牌型
  // 例如：22233 + 百搭 = 222333（三带二）
  // 例如：2345 + 百搭 = 23456（顺子）
}
```

---

## 📋 待办事项

### 代码更新
- [ ] 更新 `utils/hand-type.ts` - 添加核弹（6 张+）和飞机牌型
- [ ] 更新 `utils/play-rules.ts` - 更新牌型优先级
- [ ] 新增 `utils/level-card.ts` - 级牌与百搭逻辑
- [ ] 新增 `utils/tribute.ts` - 进贡还贡逻辑
- [ ] 更新 `utils/play-suggestion.ts` - 考虑级牌配牌

### 文档更新
- [ ] 更新 `docs/development/hand-types.md` - 牌型文档
- [ ] 新增 `docs/rules/tribute-rules.md` - 进贡还贡规则
- [ ] 新增 `docs/rules/level-card.md` - 级牌规则

### UI 补充
- [ ] 进贡阶段 UI 页面
- [ ] 还贡阶段 UI 页面
- [ ] 抗贡按钮与逻辑
- [ ] 级牌标识（红心级牌特殊标记）

---

**修订时间**: 2026-03-23 14:40  
**影响范围**: Phase 3.3 卡牌系统（小幅修订）、Phase 3.4 游戏逻辑（进贡流程）  
**开发进度**: 不影响主流开发，同步推进
