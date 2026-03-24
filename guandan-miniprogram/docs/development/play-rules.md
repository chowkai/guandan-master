# 出牌规则文档

## 概述

出牌规则模块负责验证出牌的合法性，以及判断是否可以管上上家的牌。

## 文件

`utils/play-rules.ts`

## 核心规则

### 1. 基本出牌规则

- **首轮出牌**: 任意合法牌型都可以
- **跟牌**: 必须出相同牌型且更大的牌，或出炸弹类牌型
- **pass**: 要不起或不想出时可以 pass

### 2. 牌型优先级

```
核弹 > 四大天王 > 同花顺 > 炸弹 > 钢板 > 连对 > 顺子 > 三带二 > 三张 > 对子 > 单张
```

### 3. 炸弹规则

- 炸弹可以管所有普通牌型（非炸弹类）
- 炸弹之间比较点数
- 同花顺 > 普通炸弹
- 四大天王 > 同花顺
- 核弹 > 四大天王

## API 函数

### isValidPlay(cards: Card[]): boolean

验证出牌是否符合规则。

**参数**:
- `cards`: 要出的牌

**返回值**:
- `true`: 合法
- `false`: 不合法

**示例**:
```typescript
if (isValidPlay(selectedCards)) {
  // 可以出牌
} else {
  // 牌型不合法
}
```

### canPlay(currentHand: HandType, previousHand: HandType | null): boolean

验证是否可以出牌（是否大过上家）。

**参数**:
- `currentHand`: 当前要出的牌型
- `previousHand`: 上家的牌型（null 表示首轮）

**返回值**:
- `true`: 可以出
- `false`: 不能出

**示例**:
```typescript
const currentType = identifyHandType(myCards);
const previousType = identifyHandType(opponentCards);

if (canPlay(currentType, previousType)) {
  // 可以管上
}
```

### validatePlay(cards: Card[]): HandType | null

验证出牌并返回牌型。

**参数**:
- `cards`: 要出的牌

**返回值**:
- `HandType`: 牌型信息
- `null`: 不合法

**示例**:
```typescript
const handType = validatePlay(cards);
if (handType) {
  console.log(`合法牌型：${handType.type}`);
}
```

### getBeatablePlays(hand: Card[], previousHand: HandType): HandType[]

获取所有可以管上指定牌型的出牌方案。

**参数**:
- `hand`: 手牌
- `previousHand`: 上家的牌型

**返回值**:
- `HandType[]`: 所有可以管上的牌型列表

**示例**:
```typescript
const beatablePlays = getBeatablePlays(myHand, opponentHand);
console.log(`有 ${beatablePlays.length} 种出牌方案`);
```

### isPass(cards: Card[]): boolean

检查是否是 pass（不出牌）。

**参数**:
- `cards`: 出的牌

**返回值**:
- `true`: 是 pass
- `false`: 不是 pass

**示例**:
```typescript
if (isPass(cards)) {
  console.log('玩家选择 pass');
}
```

### getMinimumPlay(hand: Card[]): HandType | null

获取最小的可出牌。

**参数**:
- `hand`: 手牌

**返回值**:
- `HandType`: 最小的合法牌型
- `null`: 无牌可出

**示例**:
```typescript
const minPlay = getMinimumPlay(hand);
if (minPlay) {
  console.log(`最小出牌：${minPlay.type}`);
}
```

## 出牌逻辑

### 首轮出牌

```typescript
// 首轮任意合法牌型
if (previousHand === null) {
  if (isValidPlay(cards)) {
    return true;
  }
}
```

### 跟牌逻辑

```typescript
// 1. 同类型比较
if (currentHand.type === previousHand.type) {
  return currentHand.value > previousHand.value;
}

// 2. 炸弹管普通牌
if (isBombType(currentHand.type) && !isBombType(previousHand.type)) {
  return true;
}

// 3. 炸弹之间比较
if (isBombType(currentHand.type) && isBombType(previousHand.type)) {
  return compareHands(currentHand, previousHand) > 0;
}

return false;
```

## 牌型比较规则

### 同类型牌型

- **单张/对子/三张**: 比较点数
- **三带二**: 比较三张的点数
- **顺子**: 比较最大牌的点数
- **连对**: 比较最大对的点数
- **钢板**: 比较较大的三张的点数
- **炸弹**: 比较点数
- **同花顺**: 比较最大牌点数 + 长度
- **核弹**: 比较点数

### 不同类型牌型

- 炸弹类 > 普通牌型
- 核弹 > 四大天王 > 同花顺 > 炸弹 > 其他

## 特殊规则

### 1. 王牌使用

- 王牌不能用于顺子、连对、钢板
- 王牌只能作为单张、对子、三张、炸弹
- 4 张王组成四大天王

### 2. 连续判断

- A-2 不算连续
- 2 不能用于顺子
- 顺子最小：A-2-3-4-5（如果规则允许）或 3-4-5-6-7
- 本系统采用：3-4-5-6-7 为最小顺子

### 3. 两副牌特殊规则

- 8 张相同为核弹（最大牌型）
- 4 张相同为炸弹
- 同点数最多 8 张

## 使用示例

### 完整出牌流程

```typescript
import { isValidPlay, canPlay, validatePlay } from './play-rules';
import { identifyHandType } from './hand-type';

// 玩家选牌
const selectedCards = [card1, card2, card3, card4, card5];

// 1. 验证牌型是否合法
if (!isValidPlay(selectedCards)) {
  console.log('牌型不合法');
  return;
}

// 2. 获取牌型
const currentHand = validatePlay(selectedCards);

// 3. 如果是首轮
if (previousHand === null) {
  playCards(selectedCards);
  return;
}

// 4. 验证是否可以出
if (canPlay(currentHand, previousHand)) {
  playCards(selectedCards);
} else {
  console.log('要不起');
}
```

### 智能出牌

```typescript
import { getBeatablePlays } from './play-rules';
import { suggestPlay } from './play-suggestion';

// 获取所有可出的牌
const beatablePlays = getBeatablePlays(hand, previousHand);

// 获取智能建议
const suggestions = suggestPlay(hand, previousHand);

// 选择最佳方案
if (suggestions.length > 0) {
  const bestPlay = suggestions[0];
  playCards(bestPlay.cards);
}
```

## 错误处理

### 常见错误

1. **牌数不对**: 如 3 张牌想出对子
2. **点数不匹配**: 如 2 张不同点数的牌想出对子
3. **不连续**: 如 3, 5, 6, 7, 8 想 out 顺子
4. **不同花色**: 如想出同花顺但花色不同

### 错误提示

```typescript
if (!isValidPlay(cards)) {
  if (cards.length === 0) {
    showError('请选择要出的牌');
  } else if (cards.length > 8) {
    showError('最多只能出 8 张牌');
  } else {
    showError('牌型不合法');
  }
}
```

## 测试用例

详见 `tests/card-system.test.ts` 中的出牌规则测试部分。

## 注意事项

1. **先验证合法性，再验证大小**
2. **首轮出牌不需要比较大小**
3. **pass 是合法的出牌选择**
4. **炸弹类牌型可以跨类型管牌**
5. **同类型必须严格匹配**（不能三张管对子）
