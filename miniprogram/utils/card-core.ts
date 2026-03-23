/**
 * 卡牌核心逻辑
 * 包含：数据结构、发牌算法、排序功能
 */

import { Suit, CardValue, CARD_ORDER } from './card-utils';

/**
 * 卡牌接口
 */
export interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker';  // 花色
  value: number;  // 牌面值（2-15，J=11,Q=12,K=13,A=14,小王=15,大王=16）
  displayValue: string;  // 显示值（2-10,J,Q,K,A,小王，大王）
  isRed: boolean;  // 是否红色花色
  isSelected: boolean;  // 是否选中
  isPlayable: boolean;  // 是否可出
}

/**
 * 牌堆接口
 */
export interface Deck {
  cards: Card[];  // 牌堆
  remaining: number;  // 剩余牌数
}

/**
 * 发牌结果接口
 */
export interface DealResult {
  player1: Card[];
  player2: Card[];
  player3: Card[];
  player4: Card[];
  bottom: Card[];  // 底牌
}

/**
 * 创建一张卡牌
 */
export function createCard(
  suit: Card['suit'],
  value: number,
  displayValue: string
): Card {
  const isRed = suit === 'hearts' || suit === 'diamonds' || (suit === 'joker' && value === 16);
  
  return {
    suit,
    value,
    displayValue,
    isRed,
    isSelected: false,
    isPlayable: true
  };
}

/**
 * 创建一副完整的扑克牌（108 张，2 副牌含 4 张王）
 * 掼蛋使用两副牌，共 108 张：
 * - 普通牌：13 个点数 × 4 花色 × 2 副 = 104 张
 * - 王牌：4 张（2 张小王 + 2 张大王）
 */
export function createFullDeck(): Card[] {
  const deck: Card[] = [];
  
  // 普通牌：2-10, J(11), Q(12), K(13), A(14)
  const suits: Card['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const displayValues = [
    { value: 2, display: '2' },
    { value: 3, display: '3' },
    { value: 4, display: '4' },
    { value: 5, display: '5' },
    { value: 6, display: '6' },
    { value: 7, display: '7' },
    { value: 8, display: '8' },
    { value: 9, display: '9' },
    { value: 10, display: '10' },
    { value: 11, display: 'J' },
    { value: 12, display: 'Q' },
    { value: 13, display: 'K' },
    { value: 14, display: 'A' }
  ];
  
  // 添加两副普通牌
  for (let deckNum = 0; deckNum < 2; deckNum++) {
    for (const suit of suits) {
      for (const { value, display } of displayValues) {
        deck.push(createCard(suit, value, display));
      }
    }
  }
  
  // 添加 4 张王牌（2 张小王 + 2 张大王）
  deck.push(createCard('joker', 15, '小王'));
  deck.push(createCard('joker', 15, '小王'));
  deck.push(createCard('joker', 16, '大王'));
  deck.push(createCard('joker', 16, '大王'));
  
  return deck;
}

/**
 * 洗牌算法（Fisher-Yates 洗牌）
 * 随机打乱牌堆顺序
 */
export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * 发牌
 * 4 家发牌，每家 25 张，余 8 张底牌
 * 108 = 25 × 4 + 8
 */
export function deal(deck: Card[]): DealResult {
  if (deck.length !== 108) {
    throw new Error(`牌堆必须有 108 张牌，当前有 ${deck.length} 张`);
  }
  
  const shuffledDeck = shuffle(deck);
  
  const player1: Card[] = [];
  const player2: Card[] = [];
  const player3: Card[] = [];
  const player4: Card[] = [];
  const bottom: Card[] = [];
  
  // 发牌：每家 25 张
  for (let i = 0; i < 100; i++) {
    const card = shuffledDeck[i];
    switch (i % 4) {
      case 0:
        player1.push(card);
        break;
      case 1:
        player2.push(card);
        break;
      case 2:
        player3.push(card);
        break;
      case 3:
        player4.push(card);
        break;
    }
  }
  
  // 剩余 8 张作为底牌
  for (let i = 100; i < 108; i++) {
    bottom.push(shuffledDeck[i]);
  }
  
  return { player1, player2, player3, player4, bottom };
}

/**
 * 排序手牌
 * @param cards 手牌
 * @param sortBy 排序方式：'suit' 按花色，'value' 按牌面值
 */
export function sortCards(cards: Card[], sortBy: 'suit' | 'value' = 'value'): Card[] {
  return [...cards].sort((a, b) => {
    if (sortBy === 'value') {
      // 按牌面值从大到小排序
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      // 同点数按花色排序
      return getSuitPriority(b.suit) - getSuitPriority(a.suit);
    } else {
      // 按花色排序
      const suitDiff = getSuitPriority(b.suit) - getSuitPriority(a.suit);
      if (suitDiff !== 0) {
        return suitDiff;
      }
      // 同花色按牌面值排序
      return b.value - a.value;
    }
  });
}

/**
 * 花色优先级（用于排序）
 */
function getSuitPriority(suit: Card['suit']): number {
  const priorities: Record<Card['suit'], number> = {
    spades: 4,
    hearts: 3,
    diamonds: 2,
    clubs: 1,
    joker: 0
  };
  return priorities[suit];
}

/**
 * 从手牌中移除指定的牌
 */
export function removeCardsFromHand(hand: Card[], cardsToRemove: Card[]): Card[] {
  const cardsToRemoveSet = new Set(
    cardsToRemove.map(c => `${c.suit}_${c.value}_${c.displayValue}`)
  );
  
  return hand.filter(c => !cardsToRemoveSet.has(`${c.suit}_${c.value}_${c.displayValue}`));
}

/**
 * 检查手牌是否包含指定的牌
 */
export function hasCards(hand: Card[], cards: Card[]): boolean {
  const handSet = new Set(
    hand.map(c => `${c.suit}_${c.value}_${c.displayValue}`)
  );
  
  return cards.every(c => handSet.has(`${c.suit}_${c.value}_${c.displayValue}`));
}

/**
 * 获取手牌中某种花色的所有牌
 */
export function getCardsBySuit(hand: Card[], suit: Card['suit']): Card[] {
  return hand.filter(c => c.suit === suit);
}

/**
 * 获取手牌中某个点数的所有牌
 */
export function getCardsByValue(hand: Card[], value: number): Card[] {
  return hand.filter(c => c.value === value);
}

/**
 * 统计手牌中各点数的数量
 */
export function countCardsByValue(hand: Card[]): Map<number, number> {
  const countMap = new Map<number, number>();
  
  for (const card of hand) {
    const count = countMap.get(card.value) || 0;
    countMap.set(card.value, count + 1);
  }
  
  return countMap;
}

/**
 * 统计手牌中各花色的数量
 */
export function countCardsBySuit(hand: Card[]): Map<Card['suit'], number> {
  const countMap = new Map<Card['suit'], number>();
  
  for (const card of hand) {
    const count = countMap.get(card.suit) || 0;
    countMap.set(card.suit, count + 1);
  }
  
  return countMap;
}

/**
 * 创建牌堆对象
 */
export function createDeckObject(cards: Card[]): Deck {
  return {
    cards,
    remaining: cards.length
  };
}
