# 掼蛋进贡还贡规则（完整版）

**版本**: v2.0  
**创建日期**: 2026-03-23 14:53  
**PM**: main  
**状态**: ✅ 已确认

---

## 📋 进贡规则详解

### 1. 进贡时机

**触发条件**: 每局游戏结束后，下一局发牌完成后

**流程**:
```
发牌完成 → 判定进贡 → 玩家选牌 → 确认进贡 → 还贡 → 开始游戏
```

---

### 2. 进贡对象判定

#### 2.1 单贡（头游 + 二游 vs 三游 + 末游）

| 进贡方 | 进贡对象 | 说明 |
|--------|----------|------|
| 末游（第 4 名） | 头游（第 1 名） | 最大牌进贡给头游 |

#### 2.2 双贡（双下：头游 + 末游 vs 二游 + 三游）

| 进贡方 | 进贡对象 | 说明 |
|--------|----------|------|
| 三游（第 3 名） | 头游（第 1 名） | 最大牌进贡给头游 |
| 末游（第 4 名） | 二游（第 2 名） | 最大牌进贡给二游 |

**注意**: 双贡时，两个进贡方是**对家关系**（第 2 名 + 第 3 名），需要分别向对手进贡

---

### 3. 进贡牌选择规则

#### 3.1 基本原则

**进贡牌**: 手牌中**最大的单牌**

**牌面大小顺序**:
```
大王 > 小王 > 级牌（非红心）> A > K > Q > J > 10 > ... > 3 > 2
```

#### 3.2 红心级牌豁免

**规则**: 红心级牌（百搭牌）**不需要进贡**

**示例**:
- 打 2 时，红桃 2 是级牌
- 如果手牌最大是红桃 2，则跳过，选择**次大的牌**进贡
- 如果手牌有：大王、红桃 2、A → 进贡大王（红桃 2 豁免）

#### 3.3 最大牌多张选择

**情况**: 手牌有**多张相同的最大牌**

**处理方式**:
1. **玩家**: 弹出选择界面，任选其中之一
2. **AI**: **智能判定最优选择**（非随机）

**AI 智能判定规则**:

#### 进贡牌选择策略

**原则**: 根据牌面分析，选择对己方最有利的牌进贡

**考虑因素**:
1. **花色分析**: 优先贡出**非关键花色**的牌
   - 如果某花色手牌较多 → 保留该花色（可能形成同花顺）
   - 如果某花色手牌较少 → 优先贡出

2. **牌型完整性**: 避免破坏手牌结构
   - 如果 A 是对子的一部分 → 优先贡出单张 A
   - 如果 A 是顺子的一部分 → 避免贡出（除非必要）

3. **队友配合**: 如果知道队友需要某花色 → 保留

**示例**:
```
手牌：♠A♠K♠Q♥A♦A♣10...
分析：
- ♠花色有 AKQ（可能形成同花顺）→ 保留
- ♥A 是单张 → 优先贡出♥A
- ♦A 是单张 → 次选
决策：贡出♥A（不影响♠同花顺潜力）
```

#### 还贡牌选择策略

**原则**: 选择对己方最不利、对对手最有利的牌

**考虑因素**:
1. **牌面值**: 优先选择**最小牌**
2. **花色**: 优先选择**非关键花色**
3. **牌型**: 避免破坏手牌结构

**示例**:
```
手牌：♠A♥K♦Q♣10♥5♠3...
分析：
- 10 以下牌：♣10、♥5、♠3
- ♠3 是最小牌且不影响牌型 → 优先还贡♠3
决策：还贡♠3
```

---

### 4. 还贡规则

#### 4.1 还贡时机

**触发**: 接受进贡后

**流程**:
```
进贡 → 还贡 → 开始游戏
```

#### 4.2 还贡牌选择

**规则**: 任选一张**10 以下**的牌（包括 10）

**牌面范围**:
```
10、9、8、7、6、5、4、3、2
```

**选择方式**:
1. **玩家**: 弹出选择界面，任选一张 10 以下的牌
2. **AI**: 随机选择一张 10 以下的牌（优先最小牌）

**特殊情况**:
- 如果手牌**没有 10 以下的牌**：任选一张牌还贡
- 如果手牌**全是级牌/王牌**：任选一张还贡

---

### 5. 抗贡规则

#### 5.1 抗贡条件

**单贡抗贡**:
- 进贡方手牌有**2 个大王**
- 可以抗贡（跳过进贡还贡阶段）

**双贡抗贡**:
- 两个进贡方（对家）手牌**共有 2 个大王**
- 可以抗贡（跳过进贡还贡阶段）

#### 5.2 抗贡流程

**判定流程**:
```
发牌完成 → 检查抗贡条件 → 抗贡 → 直接开始游戏
```

**出牌权**:
- **抗贡成功**: 由上一局头家出牌
- **正常进贡**: 由接受进贡的玩家（头游）出牌

---

### 6. 出牌权判定

#### 6.1 正常情况

**出牌权**: 接受进贡的玩家（上一局头游）

**说明**: 进贡方 → 头游进贡，头游还贡后，头游出牌

#### 6.2 抗贡情况

**出牌权**: 上一局头游（即使没有接受进贡）

**说明**: 抗贡成功后，直接由上一局头家开始出牌

#### 6.3 双贡情况

**出牌权**: 头游（接受三游进贡的玩家）

**说明**: 双贡时，头游接受三游进贡，二游接受末游进贡，由头游开始出牌

---

## 📊 进贡流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      发牌完成                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 判定上一局名次                              │
│  头游（第 1 名）、二游（第 2 名）、三游（第 3 名）、末游（第 4 名）│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 检查抗贡条件                                │
│  单贡：进贡方有 2 个大王？                                   │
│  双贡：两个进贡方共有 2 个大王？                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────┴───────────────┐
            │                               │
           是                              否
            │                               │
            ↓                               ↓
┌───────────────────────┐   ┌─────────────────────────────────┐
│    抗贡成功！          │   │        确定进贡关系              │
│  跳过进贡还贡阶段      │   │  单贡：末游 → 头游             │
│  上一局头家出牌        │   │  双贡：三游 → 头游，末游 → 二游 │
└───────────────────────┘   └─────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      进贡方选牌进贡            │
                    │  最大牌（红心级牌豁免）        │
                    │  多张最大牌：玩家选/AI 随机     │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      受贡方还贡               │
                    │  任选一张 10 以下的牌           │
                    │  没有 10 以下：任选一张         │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      开始游戏                 │
                    │  受贡方（头游）出牌           │
                    └───────────────────────────────┘
```

---

## 🎯 实现细节

### 数据结构

```typescript
interface TributeConfig {
  type: 'single' | 'double';  // 单贡/双贡
  tributeFrom: Player[];       // 进贡方
  tributeTo: Player[];         // 受贡方
  tributeCard: Card | null;    // 进贡牌
  returnCard: Card | null;     // 还贡牌
  isAntiTribute: boolean;      // 是否抗贡
}

interface TributeRule {
  // 进贡牌选择
  getTributeCard(hand: Card[], levelCard: Card): Card | null;
  
  // 还贡牌选择
  getReturnCard(hand: Card[]): Card | null;
  
  // 抗贡检查
  checkAntiTribute(players: Player[]): boolean;
  
  // 出牌权判定
  getFirstTurnPlayer(gameState: GameState): Player;
}
```

### 核心函数

```typescript
// 1. 进贡牌选择
function selectTributeCard(hand: Card[], wildCard: Card, playerType: 'human' | 'ai'): Card | null {
  // 排除红心级牌（百搭）
  const eligibleCards = hand.filter(card => {
    if (card.suit === 'hearts' && card.value === wildCard.value) {
      return false;  // 红心级牌豁免
    }
    return true;
  });
  
  // 找到最大牌
  const maxCard = findMaxCard(eligibleCards);
  
  // 检查是否有多个最大牌
  const maxCards = eligibleCards.filter(c => c.value === maxCard.value);
  if (maxCards.length > 1) {
    if (playerType === 'human') {
      // 弹出选择界面（玩家）
      return showCardSelection(maxCards);
    } else {
      // AI 智能判定最优选择
      return aiSelectBestTributeCard(maxCards, hand);
    }
  }
  
  return maxCard;
}

// AI 智能选择进贡牌
function aiSelectBestTributeCard(maxCards: Card[], hand: Card[]): Card {
  // 分析每个最大牌的花色在手牌中的数量
  const suitCounts: Record<string, number> = {};
  hand.forEach(card => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  
  // 优先贡出花色数量最少的牌（不影响同花顺潜力）
  let bestCard = maxCards[0];
  let minCount = suitCounts[bestCard.suit] || 0;
  
  for (const card of maxCards) {
    const count = suitCounts[card.suit] || 0;
    if (count < minCount) {
      minCount = count;
      bestCard = card;
    }
  }
  
  return bestCard;
}

// 2. 还贡牌选择
function selectReturnCard(hand: Card[], playerType: 'human' | 'ai'): Card | null {
  // 找到 10 以下的牌
  const lowCards = hand.filter(card => card.value <= 10);
  
  if (lowCards.length > 0) {
    if (playerType === 'human') {
      // 弹出选择界面（玩家）
      return showCardSelection(lowCards);
    } else {
      // AI 智能选择最小牌（最不利己方）
      return aiSelectBestReturnCard(lowCards, hand);
    }
  }
  
  // 没有 10 以下的牌，任选一张（AI 选最小）
  if (playerType === 'ai') {
    return findMinCard(hand);
  }
  return hand[0];
}

// AI 智能选择还贡牌
function aiSelectBestReturnCard(lowCards: Card[], hand: Card[]): Card {
  // 优先选择最小牌（最不利己方）
  let minCard = lowCards[0];
  for (const card of lowCards) {
    if (card.value < minCard.value) {
      minCard = card;
    }
  }
  return minCard;
}

// 3. 抗贡检查
function checkAntiTribute(tributePlayers: Player[]): boolean {
  // 统计大王数量
  let kingCount = 0;
  tributePlayers.forEach(player => {
    kingCount += player.hand.filter(card => 
      card.suit === 'joker' && card.value === 16  // 大王
    ).length;
  });
  
  // 单贡：进贡方有 2 个大王
  // 双贡：两个进贡方共有 2 个大王
  return kingCount >= 2;
}

// 4. 出牌权判定
function getFirstTurnPlayer(gameState: GameState): Player {
  if (gameState.isAntiTribute) {
    // 抗贡：上一局头家出牌
    return gameState.lastGameWinner;
  } else {
    // 正常：受贡方（头游）出牌
    return gameState.tributeTo[0];
  }
}
```

---

## 📋 UI 流程设计

### 进贡阶段 UI

```
┌─────────────────────────────────────┐
│         请选择进贡的牌              │
│                                     │
│   进贡给：头游玩家                  │
│   进贡张数：1 张                    │
│   提示：选择最大的单牌              │
│         （红心级牌不需要进贡）       │
│                                     │
│   [大王] [小王] [♠A] [♥A] [♦K]...  │
│                                     │
│   [确认进贡]                        │
│                                     │
│   抗贡提示：您有 2 个大王，可以抗贡！  │
│   [申请抗贡]                        │
└─────────────────────────────────────┘
```

### 还贡阶段 UI

```
┌─────────────────────────────────────┐
│         请选择还贡的牌              │
│                                     │
│   还贡给：末游玩家                  │
│   还贡张数：1 张                    │
│   提示：选择一张 10 以下的牌          │
│                                     │
│   [10] [9] [8] [7] [6] [5]...      │
│                                     │
│   [确认还贡]                        │
└─────────────────────────────────────┘
```

### 抗贡提示 UI

```
┌─────────────────────────────────────┐
│           抗贡成功！                │
│                                     │
│   进贡方有 2 个大王，跳过进贡还贡    │
│                                     │
│   由上一局头家开始出牌              │
│                                     │
│   [确定]                            │
└─────────────────────────────────────┘
```

---

## 🧪 测试用例

### 单贡测试

```typescript
test('单贡 - 正常进贡', () => {
  const hand = [♠A, ♥K, ♦Q, ♣J, ...];
  const tributeCard = selectTributeCard(hand, wildCard);
  expect(tributeCard).toBe(♠A);  // 最大牌
});

test('单贡 - 红心级牌豁免', () => {
  const hand = [♥2, ♠A, ♥K, ...];  // 打 2，红桃 2 是级牌
  const tributeCard = selectTributeCard(hand, wildCard);
  expect(tributeCard).toBe(♠A);  // 红桃 2 豁免，选 A
});

test('单贡 - 多张最大牌选择', () => {
  const hand = [♠A, ♥A, ♦K, ...];
  const tributeCard = selectTributeCard(hand, wildCard);
  // 弹出选择界面，玩家选择 ♠A 或 ♥A
});
```

### 双贡测试

```typescript
test('双贡 - 分别进贡', () => {
  const player3Hand = [♠A, ...];  // 三游
  const player4Hand = [♥K, ...];  // 末游
  const tribute3 = selectTributeCard(player3Hand, wildCard);
  const tribute4 = selectTributeCard(player4Hand, wildCard);
  expect(tribute3).toBe(♠A);  // 进贡给头游
  expect(tribute4).toBe(♥K);  // 进贡给二游
});
```

### 抗贡测试

```typescript
test('抗贡 - 单贡有 2 个大王', () => {
  const hand = [大王，大王，♠A, ...];
  const isAntiTribute = checkAntiTribute([player]);
  expect(isAntiTribute).toBe(true);
});

test('抗贡 - 双贡共有 2 个大王', () => {
  const player2Hand = [大王，♠A, ...];  // 二游
  const player3Hand = [大王，♥K, ...];  // 三游
  const isAntiTribute = checkAntiTribute([player2, player3]);
  expect(isAntiTribute).toBe(true);
});
```

### 还贡测试

```typescript
test('还贡 - 有 10 以下的牌', () => {
  const hand = [♠A, 10, 9, 8, ...];
  const returnCard = selectReturnCard(hand);
  expect(returnCard.value).toBeLessThanOrEqual(10);
});

test('还贡 - 没有 10 以下的牌', () => {
  const hand = [♠A, ♥K, ♦Q, ♣J, 10];
  const returnCard = selectReturnCard(hand);
  expect(returnCard).toBe(10);  // 最小的牌
});
```

---

## 📝 待办事项

### 代码实现
- [ ] `utils/tribute.ts` - 进贡还贡逻辑（完整实现）
- [ ] `components/tribute-phase` - 进贡阶段 UI 组件
- [ ] `components/return-phase` - 还贡阶段 UI 组件
- [ ] `components/anti-tribute-dialog` - 抗贡提示对话框

### 测试
- [ ] 单贡流程测试
- [ ] 双贡流程测试
- [ ] 抗贡流程测试
- [ ] 红心级牌豁免测试
- [ ] 多张最大牌选择测试
- [ ] 还贡牌选择测试

### 文档
- [x] `tribute-rules.md` - 进贡规则文档（本文档）
- [ ] 更新 `docs/PHASE-3.4-GAME-LOGIC.md` - 补充进贡逻辑

---

**创建时间**: 2026-03-23 14:53  
**状态**: ✅ 规则已确认，待实现
