/**
 * 智能提示系统
 * 提供出牌建议，按牌型推荐，考虑队友配合
 */

import { Card, countCardsByValue } from './card-core';
import { CardType, HandType, isBombType, getHandTypeName } from './hand-type';
import { getBeatablePlays } from './play-rules';

/**
 * 出牌建议接口
 */
export interface PlaySuggestion {
  cards: Card[];
  type: CardType;
  confidence: number;  // 推荐程度 0-1
  reason: string;  // 推荐理由
}

/**
 * 建议优先级
 */
enum SuggestionPriority {
  MUST_PLAY = 1.0,
  HIGH = 0.8,
  MEDIUM = 0.6,
  LOW = 0.4,
  VERY_LOW = 0.2
}

/**
 * 智能提示
 * @param hand 手牌
 * @param previousHand 上家的牌型（null 表示首轮）
 * @param isPartnerTurn 是否是队友回合
 * @param partnerNeedsHelp 队友是否需要帮助
 * @returns 出牌建议列表（按推荐程度排序）
 */
export function suggestPlay(
  hand: Card[],
  previousHand: HandType | null = null,
  isPartnerTurn: boolean = false,
  partnerNeedsHelp: boolean = false
): PlaySuggestion[] {
  const suggestions: PlaySuggestion[] = [];
  
  if (previousHand === null) {
    suggestions.push(...getOpeningPlaySuggestions(hand));
  } else {
    suggestions.push(...getBeatingPlaySuggestions(hand, previousHand, isPartnerTurn, partnerNeedsHelp));
  }
  
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions;
}

/**
 * 获取首轮出牌建议
 */
function getOpeningPlaySuggestions(hand: Card[]): PlaySuggestion[] {
  const suggestions: PlaySuggestion[] = [];
  
  // 检查组合牌型
  const combos = findComboPlays(hand);
  for (const combo of combos) {
    suggestions.push({
      cards: combo.cards,
      type: combo.type,
      confidence: SuggestionPriority.HIGH,
      reason: `组合牌型${getHandTypeName(combo.type)}，优先出掉`
    });
  }
  
  // 检查单张
  const singles = findSingles(hand);
  if (singles.length > 0) {
    suggestions.push({
      cards: [singles[0]],
      type: CardType.SINGLE,
      confidence: SuggestionPriority.MEDIUM,
      reason: '出最小单张，保留大牌'
    });
  }
  
  // 检查对子
  const pairs = findPairs(hand);
  if (pairs.length > 0) {
    suggestions.push({
      cards: pairs[0],
      type: CardType.PAIR,
      confidence: SuggestionPriority.MEDIUM,
      reason: '出最小对子'
    });
  }
  
  // 检查三张
  const triples = findTriples(hand);
  for (const triple of triples) {
    suggestions.push({
      cards: triple,
      type: CardType.TRIPLE,
      confidence: SuggestionPriority.HIGH,
      reason: '三张牌型，优先出掉'
    });
  }
  
  return suggestions;
}

/**
 * 获取跟牌建议
 */
function getBeatingPlaySuggestions(
  hand: Card[],
  previousHand: HandType,
  isPartnerTurn: boolean,
  partnerNeedsHelp: boolean
): PlaySuggestion[] {
  const suggestions: PlaySuggestion[] = [];
  
  if (isPartnerTurn && partnerNeedsHelp) {
    suggestions.push({
      cards: [],
      type: previousHand.type,
      confidence: SuggestionPriority.HIGH,
      reason: '队友需要出牌权，建议 pass'
    });
  }
  
  const beatablePlays = getBeatablePlays(hand, previousHand);
  
  for (const play of beatablePlays) {
    const confidence = calculatePlayConfidence(play, previousHand, isPartnerTurn, partnerNeedsHelp);
    const reason = getPlayReason(play, previousHand, isPartnerTurn, confidence);
    
    suggestions.push({
      cards: play.cards,
      type: play.type,
      confidence,
      reason
    });
  }
  
  if (beatablePlays.length === 0 || (isPartnerTurn && partnerNeedsHelp)) {
    suggestions.push({
      cards: [],
      type: previousHand.type,
      confidence: SuggestionPriority.MEDIUM,
      reason: '要不起或让队友出牌'
    });
  }
  
  return suggestions;
}

/**
 * 计算出牌推荐程度
 */
function calculatePlayConfidence(
  play: HandType,
  previousHand: HandType,
  isPartnerTurn: boolean,
  partnerNeedsHelp: boolean
): number {
  if (isPartnerTurn && partnerNeedsHelp) {
    return SuggestionPriority.LOW;
  }
  
  if (isBombType(play.type)) {
    if (play.type === CardType.NUCLEAR_BOMB || play.type === CardType.FOUR_KINGS) {
      return SuggestionPriority.MEDIUM;
    }
    if (play.type === CardType.SAME_COLOR_STRAIGHT_FLUSH) {
      return SuggestionPriority.HIGH;
    }
    if (play.value >= 13) {
      return SuggestionPriority.MEDIUM;
    }
    return SuggestionPriority.HIGH;
  }
  
  if (play.type === CardType.STEEL_PLATE || play.type === CardType.CONSECUTIVE_PAIRS) {
    return SuggestionPriority.HIGH;
  }
  
  if (play.type === CardType.STRAIGHT) {
    return SuggestionPriority.HIGH;
  }
  
  if (play.type === CardType.TRIPLE_WITH_PAIR) {
    return SuggestionPriority.MEDIUM;
  }
  
  if (play.type === CardType.SINGLE || play.type === CardType.PAIR || play.type === CardType.TRIPLE) {
    const valueDiff = play.value - previousHand.value;
    if (valueDiff >= 3) {
      return SuggestionPriority.HIGH;
    }
    return SuggestionPriority.MEDIUM;
  }
  
  return SuggestionPriority.LOW;
}

/**
 * 获取出牌理由
 */
function getPlayReason(
  play: HandType,
  _previousHand: HandType,
  isPartnerTurn: boolean,
  confidence: number
): string {
  const typeName = getHandTypeName(play.type);
  
  if (confidence >= SuggestionPriority.HIGH) {
    if (isBombType(play.type)) {
      return `用${typeName}压制，牌型强势`;
    }
    return `出${typeName}，牌型整齐`;
  }
  
  if (confidence >= SuggestionPriority.MEDIUM) {
    if (isPartnerTurn) {
      return `帮队友接牌，出${typeName}`;
    }
    return `用${typeName}管上`;
  }
  
  return `可出${typeName}，但建议保留`;
}

/**
 * 查找组合牌型
 */
function findComboPlays(hand: Card[]): HandType[] {
  const combos: HandType[] = [];
  
  // 顺子
  const nonJokerCards = hand.filter(c => c.suit !== 'joker').sort((a, b) => b.value - a.value);
  for (let i = 0; i <= nonJokerCards.length - 5; i++) {
    const potential = nonJokerCards.slice(i, i + 5);
    const isConsecutive = potential.every((c, idx) => {
      if (idx === 0) return true;
      return potential[idx - 1].value - c.value === 1;
    });
    if (isConsecutive) {
      combos.push({
        type: CardType.STRAIGHT,
        value: potential[0].value,
        cards: potential,
        length: 5
      });
    }
  }
  
  // 连对
  const valueCount = countCardsByValue(hand);
  const pairValues = Array.from(valueCount.entries())
    .filter(([_, count]) => count >= 2)
    .map(([value, _]) => value)
    .sort((a, b) => b - a);
  
  for (let i = 0; i <= pairValues.length - 3; i++) {
    const sequence = pairValues.slice(i, i + 3);
    const isConsecutive = sequence.every((v, idx) => {
      if (idx === 0) return true;
      return sequence[idx - 1] - v === 1;
    });
    if (isConsecutive) {
      const cards: Card[] = [];
      for (const value of sequence) {
        cards.push(...hand.filter(c => c.value === value).slice(0, 2));
      }
      combos.push({
        type: CardType.CONSECUTIVE_PAIRS,
        value: sequence[0],
        cards: cards,
        length: 6
      });
    }
  }
  
  // 钢板
  const tripleValues = Array.from(valueCount.entries())
    .filter(([_, count]) => count >= 3)
    .map(([value, _]) => value)
    .sort((a, b) => b - a);
  
  for (let i = 0; i <= tripleValues.length - 2; i++) {
    if (tripleValues[i] - tripleValues[i + 1] === 1) {
      const cards: Card[] = [];
      for (const value of tripleValues.slice(i, i + 2)) {
        cards.push(...hand.filter(c => c.value === value).slice(0, 3));
      }
      combos.push({
        type: CardType.STEEL_PLATE,
        value: tripleValues[i],
        cards: cards,
        length: 6
      });
    }
  }
  
  return combos;
}

/**
 * 查找单张
 */
function findSingles(hand: Card[]): Card[] {
  const valueCount = countCardsByValue(hand);
  const singles: Card[] = [];
  
  for (const [value, count] of valueCount.entries()) {
    if (count === 1) {
      const card = hand.find(c => c.value === value);
      if (card) singles.push(card);
    }
  }
  
  return singles.sort((a, b) => a.value - b.value);
}

/**
 * 查找对子
 */
function findPairs(hand: Card[]): Card[][] {
  const pairs: Card[][] = [];
  const valueCount = countCardsByValue(hand);
  
  for (const [value, count] of valueCount.entries()) {
    if (count >= 2) {
      const pair = hand.filter(c => c.value === value).slice(0, 2);
      pairs.push(pair);
    }
  }
  
  return pairs.sort((a, b) => a[0].value - b[0].value);
}

/**
 * 查找三张
 */
function findTriples(hand: Card[]): Card[][] {
  const triples: Card[][] = [];
  const valueCount = countCardsByValue(hand);
  
  for (const [value, count] of valueCount.entries()) {
    if (count >= 3) {
      const triple = hand.filter(c => c.value === value).slice(0, 3);
      triples.push(triple);
    }
  }
  
  return triples.sort((a, b) => a[0].value - b[0].value);
}

/**
 * 获取最佳出牌建议
 */
export function getBestSuggestion(
  hand: Card[],
  previousHand: HandType | null = null
): PlaySuggestion | null {
  const suggestions = suggestPlay(hand, previousHand);
  return suggestions.length > 0 ? suggestions[0] : null;
}

/**
 * 评估手牌强度
 */
export function evaluateHandStrength(hand: Card[]): number {
  let score = 0;
  const valueCount = countCardsByValue(hand);
  
  for (const count of valueCount.values()) {
    if (count >= 8) score += 40;
    else if (count >= 4) score += 20;
  }
  
  const jokerCount = hand.filter(c => c.suit === 'joker').length;
  score += jokerCount * 10;
  
  for (const [value, count] of valueCount.entries()) {
    if (value >= 13) {
      score += count * 3;
    }
  }
  
  const combos = findComboPlays(hand);
  score += combos.length * 5;
  
  score += Math.max(0, (25 - hand.length) * 2);
  
  return Math.min(100, score);
}
