# 卡牌系统文档

## 概述

卡牌系统是掼蛋游戏的核心模块，负责处理所有与卡牌相关的逻辑，包括：
- 卡牌数据结构定义
- 发牌算法（108 张牌，2 副牌）
- 牌型判断（11 种牌型）
- 出牌规则验证
- 智能提示系统

## 文件结构

```
utils/
├── card-core.ts        # 卡牌核心逻辑（数据结构、发牌、排序）
├── card-utils.ts       # 卡牌工具函数（扩展）
├── hand-type.ts        # 牌型判断（识别、比较）
├── play-rules.ts       # 出牌规则验证
└── play-suggestion.ts  # 智能提示系统
```

## 卡牌数据结构

### Card 接口

```typescript
interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';  // 花色
  value: number;  // 牌面值（2-15，J=11,Q=12,K=13,A=14,小王=15,大王=16）
  displayValue: string;  // 显示值（2-10,J,Q,K,A,小王，大王）
  isRed: boolean;  // 是否红色花色
  isSelected: boolean;  // 是否选中
  isPlayable: boolean;  // 是否可出
}
```

### Deck 接口

```typescript
interface Deck {
  cards: Card[];  // 牌堆
  remaining: number;  // 剩余牌数
}
```

## 核心功能

### 1. 创建牌堆

使用 `createFullDeck()` 创建一副完整的掼蛋牌堆：
- 108 张牌（2 副牌）
- 每副牌 54 张（52 张普通牌 + 2 张王牌）
- 共 4 张王牌（2 张小王 + 2 张大王）

```typescript
const deck = createFullDeck();
```

### 2. 洗牌

使用 `shuffle()` 函数进行 Fisher-Yates 洗牌：

```typescript
const shuffledDeck = shuffle(deck);
```

### 3. 发牌

使用 `deal()` 函数发牌：
- 4 家玩家，每家 25 张牌
- 剩余 8 张作为底牌

```typescript
const dealResult = deal(deck);
// dealResult.player1, dealResult.player2, dealResult.player3, dealResult.player4, dealResult.bottom
```

### 4. 排序手牌

使用 `sortCards()` 函数排序：

```typescript
// 按牌面值排序
const sortedByValue = sortCards(hand, 'value');

// 按花色排序
const sortedBySuit = sortCards(hand, 'suit');
```

## 牌型系统

掼蛋共有 11 种牌型，按优先级从低到高：

1. **单张** (single) - 1 张牌
2. **对子** (pair) - 2 张相同点数的牌
3. **三张** (triple) - 3 张相同点数的牌
4. **三带二** (triple_with_pair) - 3 张相同 + 2 张相同
5. **顺子** (straight) - 5 张连续点数的牌
6. **连对** (consecutive_pairs) - 3 对连续点数的牌
7. **钢板** (steel_plate) - 2 个连续三张
8. **炸弹** (bomb) - 4 张相同点数的牌
9. **同花顺** (same_color_straight_flush) - 5 张连续且同花色的牌
10. **四大天王** (four_kings) - 4 张王牌
11. **核弹** (nuclear_bomb) - 8 张相同点数的牌

### 牌型优先级

```
核弹 > 四大天王 > 同花顺 > 炸弹 > 钢板 > 连对 > 顺子 > 三带二 > 三张 > 对子 > 单张
```

## 出牌规则

### 验证出牌

```typescript
import { isValidPlay, canPlay } from './play-rules';

// 验证出牌是否合法
const isValid = isValidPlay(cards);

// 验证是否可以出牌（是否大过上家）
const canPlayThis = canPlay(currentHand, previousHand);
```

### 特殊规则

1. **炸弹类牌型可以管任何普通牌型**
   - 核弹 > 四大天王 > 同花顺 > 炸弹 > 其他
2. **同类型牌型比较点数**
3. **首轮出牌任意合法牌型都可以**

## 智能提示

使用 `suggestPlay()` 获取出牌建议：

```typescript
import { suggestPlay, getBestSuggestion } from './play-suggestion';

// 获取所有建议
const suggestions = suggestPlay(hand, previousHand, isPartnerTurn, partnerNeedsHelp);

// 获取最佳建议
const bestSuggestion = getBestSuggestion(hand, previousHand);
```

### 建议参数

- `hand`: 当前手牌
- `previousHand`: 上家的牌型（null 表示首轮）
- `isPartnerTurn`: 是否是队友回合
- `partnerNeedsHelp`: 队友是否需要帮助（是否快出完了）

### 建议返回值

```typescript
interface PlaySuggestion {
  cards: Card[];      // 建议出的牌
  type: CardType;     // 牌型
  confidence: number; // 推荐程度 0-1
  reason: string;     // 推荐理由
}
```

## 工具函数

### 花色转换

```typescript
suitToChinese('spades')  // '黑桃'
suitToChinese('hearts')  // '红心'
```

### 牌面转换

```typescript
valueToChinese(11)  // 'J'
valueToChinese(15)  // '小王'
valueToChinese(16)  // '大王'
```

### 牌型名称

```typescript
getHandTypeName(CardType.STRAIGHT)  // '顺子'
```

### 牌力计算

```typescript
const strength = calculateHandStrength(hand);  // 0-100
```

## 使用示例

### 完整游戏流程

```typescript
import { createFullDeck, deal, sortCards } from './card-core';
import { identifyHandType, compareHands } from './hand-type';
import { isValidPlay, canPlay } from './play-rules';
import { suggestPlay } from './play-suggestion';

// 1. 创建并洗牌
const deck = createFullDeck();
const shuffled = shuffle(deck);

// 2. 发牌
const dealResult = deal(shuffled);
const playerHand = sortCards(dealResult.player1);

// 3. 首轮出牌
const suggestions = suggestPlay(playerHand);
const bestPlay = suggestions[0];

// 4. 验证出牌
if (isValidPlay(bestPlay.cards)) {
  const handType = identifyHandType(bestPlay.cards);
  console.log(`出牌：${getHandTypeName(handType.type)}`);
}

// 5. 跟牌
const previousHand = identifyHandType(opponentCards);
const beatablePlays = suggestPlay(playerHand, previousHand);
```

## 测试

运行单元测试：

```bash
cd guandan-miniprogram
npm test
```

测试文件：`tests/card-system.test.ts`

## 注意事项

1. **牌面值范围**: 2-16（2 最小，大王最大）
2. **花色顺序**: 黑桃 > 红心 > 方块 > 梅花 > 王
3. **顺子限制**: 不能使用王牌，A-2 不算连续
4. **炸弹识别**: 4 张相同为炸弹，8 张相同为核弹
5. **同花顺**: 必须同花色且连续，优先级高于普通炸弹

## 相关文档

- [牌型判断文档](./hand-types.md)
- [出牌规则文档](./play-rules.md)
