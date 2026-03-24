/**
 * 出牌规则验证
 * 验证出牌是否符合规则，是否大过上家
 */

import { Card, countCardsByValue } from './card-core';
import { CardType, HandType, identifyHandType, compareHands, isBombType } from './hand-type';

/**
 * 验证出牌是否符合规则
 * @param cards 要出的牌
 * @returns 是否符合规则
 */
export function isValidPlay(cards: Card[]): boolean {
  if (!cards || cards.length === 0) {
    return false;
  }
  
  const handType = identifyHandType(cards);
  return handType !== null;
}

/**
 * 验证是否可以出牌（是否大过上家）
 * @param currentHand 当前要出的牌型
 * @param previousHand 上家的牌型（null 表示首轮）
 * @returns 是否可以出
 */
export function canPlay(currentHand: HandType, previousHand: HandType | null): boolean {
  // 首轮出牌，任意合法牌型都可以
  if (previousHand === null) {
    return true;
  }
  
  // 比较牌型大小
  const comparison = compareHands(currentHand, previousHand);
  return comparison > 0;
}

/**
 * 验证出牌是否合法并返回牌型
 * @param cards 要出的牌
 * @returns 牌型信息，不合法返回 null
 */
export function validatePlay(cards: Card[]): HandType | null {
  if (!cards || cards.length === 0) {
    return null;
  }
  
  return identifyHandType(cards);
}

/**
 * 检查是否能管上指定的牌
 * @param hand 手牌
 * @param previousHand 上家的牌型
 * @returns 可以管上的牌型列表
 */
export function getBeatablePlays(hand: Card[], previousHand: HandType): HandType[] {
  const beatablePlays: HandType[] = [];
  
  // 1. 首先检查是否能用同类型更大的牌管上
  const sameTypePlays = findSameTypePlays(hand, previousHand);
  beatablePlays.push(...sameTypePlays);
  
  // 2. 检查是否能用炸弹管上
  const bombPlays = findBombPlays(hand, previousHand);
  beatablePlays.push(...bombPlays);
  
  return beatablePlays;
}

/**
 * 查找同类型可出的牌
 */
function findSameTypePlays(hand: Card[], previousHand: HandType): HandType[] {
  const plays: HandType[] = [];
  const valueCount = countCardsByValue(hand);
  
  switch (previousHand.type) {
    case CardType.SINGLE:
      // 找比上家大的单张
      for (const [value, count] of valueCount.entries()) {
        if (value > previousHand.value && count >= 1) {
          const card = hand.find(c => c.value === value);
          if (card) {
            plays.push({
              type: CardType.SINGLE,
              value: value,
              cards: [card],
              length: 1
            });
          }
        }
      }
      break;
      
    case CardType.PAIR:
      // 找比上家大的对子
      for (const [value, count] of valueCount.entries()) {
        if (value > previousHand.value && count >= 2) {
          const cards = hand.filter(c => c.value === value).slice(0, 2);
          plays.push({
            type: CardType.PAIR,
            value: value,
            cards: cards,
            length: 2
          });
        }
      }
      break;
      
    case CardType.TRIPLE:
      // 找比上家大的三张
      for (const [value, count] of valueCount.entries()) {
        if (value > previousHand.value && count >= 3) {
          const cards = hand.filter(c => c.value === value).slice(0, 3);
          plays.push({
            type: CardType.TRIPLE,
            value: value,
            cards: cards,
            length: 3
          });
        }
      }
      break;
      
    case CardType.TRIPLE_WITH_PAIR:
      // 找比上家大的三带二
      for (const [tripleValue, tripleCount] of valueCount.entries()) {
        if (tripleValue > previousHand.value && tripleCount >= 3) {
          // 找一个对子
          for (const [pairValue, pairCount] of valueCount.entries()) {
            if (pairValue !== tripleValue && pairCount >= 2) {
              const tripleCards = hand.filter(c => c.value === tripleValue).slice(0, 3);
              const pairCards = hand.filter(c => c.value === pairValue).slice(0, 2);
              plays.push({
                type: CardType.TRIPLE_WITH_PAIR,
                value: tripleValue,
                cards: [...tripleCards, ...pairCards],
                length: 5
              });
            }
          }
        }
      }
      break;
      
    case CardType.STRAIGHT:
      // 找比上家大的顺子
      const straightPlays = findStraights(hand, previousHand.value);
      plays.push(...straightPlays);
      break;
      
    case CardType.CONSECUTIVE_PAIRS:
      // 找比上家大的连对
      const pairSequencePlays = findConsecutivePairs(hand, previousHand.value, previousHand.length / 2);
      plays.push(...pairSequencePlays);
      break;
      
    case CardType.STEEL_PLATE:
      // 找比上家大的钢板
      const steelPlays = findSteelPlates(hand, previousHand.value);
      plays.push(...steelPlays);
      break;
      
    case CardType.BOMB:
      // 找比上家大的炸弹
      for (const [value, count] of valueCount.entries()) {
        if (value > previousHand.value && count >= 4) {
          const cards = hand.filter(c => c.value === value).slice(0, 4);
          plays.push({
            type: CardType.BOMB,
            value: value,
            cards: cards,
            length: 4
          });
        }
      }
      break;
      
    case CardType.SAME_COLOR_STRAIGHT_FLUSH:
      // 找比上家大的同花顺
      const sameColorPlays = findSameColorStraights(hand, previousHand.value);
      plays.push(...sameColorPlays);
      break;
      
    case CardType.FOUR_KINGS:
      // 四大天王只能用核弹管
      break;
      
    case CardType.NUCLEAR_BOMB:
      // 核弹最大，无法管
      break;
  }
  
  return plays;
}

/**
 * 查找顺子
 */
function findStraights(hand: Card[], minValue: number): HandType[] {
  const plays: HandType[] = [];
  const nonJokerCards = hand.filter(c => c.suit !== 'joker').sort((a, b) => b.value - a.value);
  
  // 找连续的 5 张牌
  for (let i = 0; i <= nonJokerCards.length - 5; i++) {
    const potentialStraight = nonJokerCards.slice(i, i + 5);
    const isConsecutive = potentialStraight.every((c, idx) => {
      if (idx === 0) return true;
      return potentialStraight[idx - 1].value - c.value === 1;
    });
    
    if (isConsecutive && potentialStraight[0].value > minValue) {
      plays.push({
        type: CardType.STRAIGHT,
        value: potentialStraight[0].value,
        cards: potentialStraight,
        length: 5
      });
    }
  }
  
  return plays;
}

/**
 * 查找同花顺
 */
function findSameColorStraights(hand: Card[], minValue: number): HandType[] {
  const plays: HandType[] = [];
  const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
  
  for (const suit of suits) {
    const suitCards = hand.filter(c => c.suit === suit).sort((a, b) => b.value - a.value);
    
    for (let i = 0; i <= suitCards.length - 5; i++) {
      const potentialStraight = suitCards.slice(i, i + 5);
      const isConsecutive = potentialStraight.every((c, idx) => {
        if (idx === 0) return true;
        return potentialStraight[idx - 1].value - c.value === 1;
      });
      
      if (isConsecutive && potentialStraight[0].value > minValue) {
        plays.push({
          type: CardType.SAME_COLOR_STRAIGHT_FLUSH,
          value: potentialStraight[0].value * 100 + 5,
          cards: potentialStraight,
          length: 5
        });
      }
    }
  }
  
  return plays;
}

/**
 * 查找连对
 */
function findConsecutivePairs(hand: Card[], minValue: number, pairCount: number): HandType[] {
  const plays: HandType[] = [];
  const valueCount = countCardsByValue(hand);
  
  // 找出所有有对子的值
  const pairValues = Array.from(valueCount.entries())
    .filter(([_, count]) => count >= 2)
    .map(([value, _]) => value)
    .sort((a, b) => b - a);
  
  // 找连续的牌对
  for (let i = 0; i <= pairValues.length - pairCount; i++) {
    const sequence = pairValues.slice(i, i + pairCount);
    const isConsecutive = sequence.every((v, idx) => {
      if (idx === 0) return true;
      return sequence[idx - 1] - v === 1;
    });
    
    if (isConsecutive && sequence[0] > minValue) {
      const cards: Card[] = [];
      for (const value of sequence) {
        cards.push(...hand.filter(c => c.value === value).slice(0, 2));
      }
      plays.push({
        type: CardType.CONSECUTIVE_PAIRS,
        value: sequence[0],
        cards: cards,
        length: pairCount * 2
      });
    }
  }
  
  return plays;
}

/**
 * 查找钢板
 */
function findSteelPlates(hand: Card[], minValue: number): HandType[] {
  const plays: HandType[] = [];
  const valueCount = countCardsByValue(hand);
  
  // 找出所有有三张的值
  const tripleValues = Array.from(valueCount.entries())
    .filter(([_, count]) => count >= 3)
    .map(([value, _]) => value)
    .sort((a, b) => b - a);
  
  // 找连续的两个三张
  for (let i = 0; i <= tripleValues.length - 2; i++) {
    if (tripleValues[i] - tripleValues[i + 1] === 1 && tripleValues[i] > minValue) {
      const cards: Card[] = [];
      for (const value of tripleValues.slice(i, i + 2)) {
        cards.push(...hand.filter(c => c.value === value).slice(0, 3));
      }
      plays.push({
        type: CardType.STEEL_PLATE,
        value: tripleValues[i],
        cards: cards,
        length: 6
      });
    }
  }
  
  return plays;
}

/**
 * 查找炸弹
 */
function findBombPlays(hand: Card[], previousHand: HandType): HandType[] {
  const plays: HandType[] = [];
  const valueCount = countCardsByValue(hand);
  
  // 如果上家是普通牌型，可以用任何炸弹管
  const needsBomb = !isBombType(previousHand.type);
  
  // 找核弹（8 张相同）
  for (const [value, count] of valueCount.entries()) {
    if (count >= 8) {
      const cards = hand.filter(c => c.value === value).slice(0, 8);
      plays.push({
        type: CardType.NUCLEAR_BOMB,
        value: value,
        cards: cards,
        length: 8
      });
    }
  }
  
  // 找四大天王
  const jokerCount = hand.filter(c => c.suit === 'joker').length;
  if (jokerCount >= 4) {
    const jokers = hand.filter(c => c.suit === 'joker').slice(0, 4);
    plays.push({
      type: CardType.FOUR_KINGS,
      value: 100,
      cards: jokers,
      length: 4
    });
  }
  
  // 找同花顺
  const sameColorStraights = findSameColorStraights(hand, -1);
  plays.push(...sameColorStraights);
  
  // 找普通炸弹
  if (needsBomb || previousHand.type === CardType.BOMB) {
    const minBombValue = previousHand.type === CardType.BOMB ? previousHand.value : -1;
    for (const [value, count] of valueCount.entries()) {
      if (count >= 4 && value > minBombValue) {
        const cards = hand.filter(c => c.value === value).slice(0, 4);
        plays.push({
          type: CardType.BOMB,
          value: value,
          cards: cards,
          length: 4
        });
      }
    }
  }
  
  return plays;
}

/**
 * 检查是否是合法的 pass
 */
export function isPass(cards: Card[]): boolean {
  return cards.length === 0;
}

/**
 * 获取最小的可出牌
 * @param hand 手牌
 * @returns 最小的合法牌型
 */
export function getMinimumPlay(hand: Card[]): HandType | null {
  if (hand.length === 0) {
    return null;
  }
  
  // 优先出单张
  const sortedHand = [...hand].sort((a, b) => a.value - b.value);
  return {
    type: CardType.SINGLE,
    value: sortedHand[0].value,
    cards: [sortedHand[0]],
    length: 1
  };
}
