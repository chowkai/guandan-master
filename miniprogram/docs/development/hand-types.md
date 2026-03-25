# 牌型判断文档

## 概述

牌型判断模块负责识别和比较掼蛋游戏中的 11 种牌型。

## 文件

`utils/hand-type.ts`

## 牌型枚举

```typescript
enum CardType {
  SINGLE = 'single',                    // 单张
  PAIR = 'pair',                        // 对子
  TRIPLE = 'triple',                    // 三张
  TRIPLE_WITH_PAIR = 'triple_with_pair', // 三带二
  STRAIGHT = 'straight',                // 顺子
  CONSECUTIVE_PAIRS = 'consecutive_pairs', // 连对
  STEEL_PLATE = 'steel_plate',          // 钢板
  BOMB = 'bomb',                        // 炸弹
  SAME_COLOR_STRAIGHT_FLUSH = 'same_color_straight_flush', // 同花顺
  FOUR_KINGS = 'four_kings',            // 四大天王
  NUCLEAR_BOMB = 'nuclear_bomb'         // 核弹
}
```

## 牌型详细说明

### 1. 单张 (SINGLE)

- **牌数**: 1 张
- **规则**: 任意单张牌
- **大小比较**: 比较牌面值
- **示例**: `[大王]`, `[A]`, `[2]`, `[3]`

### 2. 对子 (PAIR)

- **牌数**: 2 张
- **规则**: 2 张相同点数的牌
- **大小比较**: 比较点数
- **示例**: `[A, A]`, `[K, K]`, `[2, 2]`

### 3. 三张 (TRIPLE)

- **牌数**: 3 张
- **规则**: 3 张相同点数的牌
- **大小比较**: 比较点数
- **示例**: `[A, A, A]`, `[K, K, K]`

### 4. 三带二 (TRIPLE_WITH_PAIR)

- **牌数**: 5 张
- **规则**: 3 张相同点数 + 2 张相同点数
- **大小比较**: 比较三张的点数
- **示例**: `[A, A, A, K, K]`, `[K, K, K, 2, 2]`

### 5. 顺子 (STRAIGHT)

- **牌数**: 5 张
- **规则**: 5 张连续点数的牌（不能包含王）
- **大小比较**: 比较最大牌的点数
- **限制**: A-2 不算连续，2 不能用于顺子
- **示例**: `[10, J, Q, K, A]`, `[3, 4, 5, 6, 7]`

### 6. 连对 (CONSECUTIVE_PAIRS)

- **牌数**: 6 张或更多（3 对或更多）
- **规则**: 3 对或更多连续点数的对子
- **大小比较**: 比较最大对的点数
- **示例**: `[3, 3, 4, 4, 5, 5]`, `[10, 10, J, J, Q, Q]`

### 7. 钢板 (STEEL_PLATE)

- **牌数**: 6 张
- **规则**: 2 个连续的三张
- **大小比较**: 比较较大的三张的点数
- **示例**: `[3, 3, 3, 4, 4, 4]`, `[J, J, J, Q, Q, Q]`

### 8. 炸弹 (BOMB)

- **牌数**: 4 张
- **规则**: 4 张相同点数的牌
- **大小比较**: 比较点数
- **优先级**: 可以管所有普通牌型
- **示例**: `[3, 3, 3, 3]`, `[A, A, A, A]`

### 9. 同花顺 (SAME_COLOR_STRAIGHT_FLUSH)

- **牌数**: 5 张或更多
- **规则**: 5 张或更多连续且同花色的牌
- **大小比较**: 比较最大牌的点数 + 长度
- **优先级**: 高于普通炸弹
- **示例**: `[♥10, ♥J, ♥Q, ♥K, ♥A]`, `[♠3, ♠4, ♠5, ♠6, ♠7]`

### 10. 四大天王 (FOUR_KINGS)

- **牌数**: 4 张
- **规则**: 4 张王牌（2 小王 + 2 大王）
- **大小比较**: 固定值，仅小于核弹
- **优先级**: 第二大的牌型
- **示例**: `[小王，小王，大王，大王]`

### 11. 核弹 (NUCLEAR_BOMB)

- **牌数**: 8 张
- **规则**: 8 张相同点数的牌（两副牌的特殊牌型）
- **大小比较**: 比较点数
- **优先级**: 最大的牌型
- **示例**: `[3, 3, 3, 3, 3, 3, 3, 3]`, `[A, A, A, A, A, A, A, A]`

## 牌型优先级

```
核弹 (11) > 四大天王 (10) > 同花顺 (9) > 炸弹 (8) > 
钢板 (7) > 连对 (6) > 顺子 (5) > 三带二 (4) > 
三张 (3) > 对子 (2) > 单张 (1)
```

## API 函数

### identifyHandType(cards: Card[]): HandType | null

识别牌型。

**参数**:
- `cards`: 手牌数组

**返回值**:
- `HandType`: 牌型信息
- `null`: 无法识别

**示例**:
```typescript
const handType = identifyHandType([card1, card2, card3, card4]);
if (handType) {
  console.log(`牌型：${handType.type}`);
  console.log(`牌值：${handType.value}`);
}
```

### compareHands(hand1: HandType, hand2: HandType): number

比较两个牌型的大小。

**参数**:
- `hand1`: 手牌 1
- `hand2`: 手牌 2

**返回值**:
- `1`: hand1 大
- `-1`: hand2 大
- `0`: 相同

**示例**:
```typescript
const result = compareHands(hand1, hand2);
if (result > 0) {
  console.log('hand1 大');
} else if (result < 0) {
  console.log('hand2 大');
} else {
  console.log('相同');
}
```

### getHandTypeName(type: CardType): string

获取牌型中文名称。

**示例**:
```typescript
const name = getHandTypeName(CardType.STRAIGHT);  // '顺子'
```

### isBombType(type: CardType): boolean

检查是否为炸弹类牌型。

**示例**:
```typescript
if (isBombType(handType.type)) {
  console.log('这是炸弹类牌型');
}
```

### getHandTypeLength(type: CardType): number | null

获取牌型要求的牌数。

**示例**:
```typescript
const length = getHandTypeLength(CardType.STRAIGHT);  // 5
```

## HandType 接口

```typescript
interface HandType {
  type: CardType;   // 牌型
  value: number;    // 牌型值（用于比较）
  cards: Card[];    // 组成牌型的牌
  length: number;   // 牌的数量
}
```

## 判断逻辑

### 特殊牌型优先判断

1. 核弹（8 张相同）
2. 四大天王（4 张王）
3. 同花顺（同花色 + 连续）
4. 炸弹（4 张相同）

### 组合牌型

5. 钢板（2 个连续三张）
6. 连对（3 对连续）
7. 顺子（5 张连续）
8. 三带二（3 张 + 2 张）

### 基础牌型

9. 三张（3 张相同）
10. 对子（2 张相同）
11. 单张（1 张）

## 注意事项

1. **顺子限制**: 不能包含王牌，A-2 不算连续
2. **连对要求**: 至少 3 对（6 张）
3. **钢板要求**: 必须 2 个连续三张
4. **三带二**: 三张的点数决定大小
5. **同花顺**: 长度也影响大小（长度越长越大）
6. **四大天王**: 固定值，仅小于核弹
7. **核弹**: 两副牌特有，8 张相同

## 测试用例

详见 `tests/card-system.test.ts` 中的牌型判断测试部分。
