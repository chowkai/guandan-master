/**
 * 游戏逻辑核心
 * 包含：游戏状态管理、轮流出牌、AI 决策、胜负判断
 */

import { Card, createCard, removeCardsFromHand, getCardsByValue, countCardsByValue } from './card-core';
import { CardType, HandType, identifyHandType, compareHands, isBombType, getHandTypeName } from './hand-type';
import { canPlay, getBeatablePlays } from './play-rules';

/**
 * 游戏状态枚举
 */
export enum GameState {
  IDLE = 'idle',              // 等待开始
  DEALING = 'dealing',        // 发牌中
  PLAYING = 'playing',        // 游戏中
  TRIBUTE = 'tribute',        // 进贡阶段
  RETURN_TRIBUTE = 'return',  // 还贡阶段
  GAME_OVER = 'game_over'     // 游戏结束
}

/**
 * 玩家接口
 */
export interface Player {
  id: string;                 // 玩家 ID
  name: string;               // 玩家名称
  hand: Card[];               // 手牌
  isAI: boolean;              // 是否是 AI
  aiType?: 'conservative' | 'aggressive' | 'balanced';  // AI 类型
  isPartner: boolean;         // 是否是队友（相对于当前玩家）
  finished: boolean;          // 是否已出完牌
  rank?: number;              // 名次（1-4）
}

/**
 * 游戏状态接口
 */
export interface Game {
  state: GameState;
  players: Player[];
  currentTurn: number;        // 当前出牌玩家索引（0-3）
  lastHand: HandType | null;  // 上家出的牌
  lastPlayerIndex: number;    // 最后出牌的玩家索引
  level: number;              // 当前级牌（2-14）
  wildCard: Card | null;      // 红心级牌（百搭）
  bottomCards: Card[];        // 底牌（8 张）
  tributeInfo: TributeInfo | null;  // 进贡信息
  passCount: number;          // 连续 pass 次数
  round: number;              // 当前轮次
}

/**
 * 进贡信息接口
 */
export interface TributeInfo {
  fromPlayer: number;         // 进贡玩家索引
  toPlayer: number;           // 接收进贡玩家索引
  tributeCard: Card | null;   // 进贡的牌
  returnCard: Card | null;    // 还贡的牌
  isAntiTribute: boolean;     // 是否抗贡
}

/**
 * AI 决策接口
 */
export interface AIDecision {
  action: 'play' | 'pass';
  cards?: Card[];
  confidence: number;         // 0-1
  reason: string;
}

/**
 * 游戏结果接口
 */
export interface GameResult {
  winner: Player;
  ranking: Player[];          // 名次排序（1-4）
  isDoubleWin: boolean;       // 是否双下
  attackWin: boolean;         // 攻方是否赢
  levelUp: number;            // 升级数（0-3）
}

/**
 * 创建新游戏
 */
export function createGame(players: Player[], level: number = 2): Game {
  return {
    state: GameState.IDLE,
    players,
    currentTurn: 0,
    lastHand: null,
    lastPlayerIndex: -1,
    level,
    wildCard: null,
    bottomCards: [],
    tributeInfo: null,
    passCount: 0,
    round: 1
  };
}

/**
 * 开始游戏（进入发牌阶段）
 */
export function startGame(game: Game): Game {
  if (game.state !== GameState.IDLE) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  return {
    ...game,
    state: GameState.DEALING
  };
}

/**
 * 发牌完成（进入游玩阶段）
 */
export function finishDealing(game: Game, bottomCards: Card[]): Game {
  if (game.state !== GameState.DEALING) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  // 设置百搭牌（红心级牌）
  const wildCard = findWildCard(game.players, game.level);
  
  return {
    ...game,
    state: GameState.PLAYING,
    bottomCards,
    wildCard,
    currentTurn: findFirstTurnPlayer(game.players, game.level)
  };
}

/**
 * 查找百搭牌（红心级牌）
 */
function findWildCard(players: Player[], level: number): Card | null {
  for (const player of players) {
    const heartsLevelCard = player.hand.find(
      c => c.suit === 'hearts' && c.value === level
    );
    if (heartsLevelCard) {
      return heartsLevelCard;
    }
  }
  return null;
}

/**
 * 查找首家出牌玩家（持有级牌最小的玩家）
 */
function findFirstTurnPlayer(players: Player[], level: number): number {
  let firstPlayer = 0;
  let minValue = 100;
  
  for (let i = 0; i < players.length; i++) {
    const levelCards = getCardsByValue(players[i].hand, level);
    if (levelCards.length > 0) {
      // 有级牌，优先级高
      if (minValue === 100) {
        firstPlayer = i;
        minValue = level;
      }
    }
  }
  
  // 如果没有级牌，找最小牌的玩家
  if (minValue === 100) {
    for (let i = 0; i < players.length; i++) {
      const minCard = players[i].hand.reduce((min, c) => 
        c.value < min.value ? c : min, players[i].hand[0]
      );
      if (minCard.value < minValue) {
        minValue = minCard.value;
        firstPlayer = i;
      }
    }
  }
  
  return firstPlayer;
}

/**
 * 玩家出牌
 */
export function playCards(game: Game, playerIndex: number, cards: Card[]): Game {
  if (game.state !== GameState.PLAYING) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  if (playerIndex !== game.currentTurn) {
    throw new Error(`不是当前玩家的回合`);
  }
  
  // 验证出牌
  const handType = identifyHandType(cards);
  if (!handType) {
    throw new Error(`非法牌型`);
  }
  
  // 验证是否可以出这手牌
  if (game.lastHand && game.lastPlayerIndex !== playerIndex) {
    if (!canPlay(handType, game.lastHand)) {
      throw new Error(`牌型不够大`);
    }
  }
  
  // 从手牌中移除出的牌
  const player = game.players[playerIndex];
  const newHand = removeCardsFromHand(player.hand, cards);
  
  // 更新玩家手牌
  const newPlayers = [...game.players];
  newPlayers[playerIndex] = { ...player, hand: newHand };
  
  // 检查是否出完牌
  if (newHand.length === 0) {
    const finishedRank = getFinishedRank(newPlayers);
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      finished: true,
      rank: finishedRank
    };
    
    // 检查游戏是否结束
    if (isGameOver(newPlayers)) {
      return {
        ...game,
        players: newPlayers,
        state: GameState.GAME_OVER,
        lastHand: handType,
        lastPlayerIndex: playerIndex,
        passCount: 0
      };
    }
  }
  
  // 更新游戏状态
  return {
    ...game,
    players: newPlayers,
    lastHand: handType,
    lastPlayerIndex: playerIndex,
    passCount: 0
  };
}

/**
 * 玩家 Pass（不要）
 */
export function passTurn(game: Game, playerIndex: number): Game {
  if (game.state !== GameState.PLAYING) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  if (playerIndex !== game.currentTurn) {
    throw new Error(`不是当前玩家的回合`);
  }
  
  // 如果是首家出牌，不能 Pass
  if (game.lastPlayerIndex === -1 || game.lastPlayerIndex === playerIndex) {
    throw new Error(`首家出牌不能 Pass`);
  }
  
  return {
    ...game,
    passCount: game.passCount + 1
  };
}

/**
 * 下一个玩家回合
 */
export function nextTurn(game: Game): Game {
  if (game.state !== GameState.PLAYING) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  // 如果连续 3 家 Pass，最后出牌的玩家获得出牌权
  if (game.passCount >= 3) {
    return {
      ...game,
      currentTurn: game.lastPlayerIndex,
      lastHand: null,
      lastPlayerIndex: -1,
      passCount: 0,
      round: game.round + 1
    };
  }
  
  // 顺时针到下一个未出完牌的玩家
  let nextPlayer = (game.currentTurn + 1) % 4;
  while (game.players[nextPlayer].finished) {
    nextPlayer = (nextPlayer + 1) % 4;
  }
  
  return {
    ...game,
    currentTurn: nextPlayer
  };
}

/**
 * 获取当前出完牌玩家的名次
 */
function getFinishedRank(players: Player[]): number {
  const finishedCount = players.filter(p => p.finished).length;
  return finishedCount + 1;
}

/**
 * 检查游戏是否结束
 */
function isGameOver(players: Player[]): boolean {
  const finishedCount = players.filter(p => p.finished).length;
  return finishedCount >= 3;  // 3 家出完牌，游戏结束
}

/**
 * AI 决策引擎
 */
export function aiDecision(player: Player, game: Game): AIDecision {
  if (!player.isAI) {
    throw new Error(`不是 AI 玩家`);
  }
  
  const aiType = player.aiType || 'balanced';
  
  // 如果是首家出牌
  if (!game.lastHand || game.lastPlayerIndex === game.players.indexOf(player)) {
    return getOpeningPlayDecision(player, game, aiType);
  }
  
  // 需要跟牌
  return getBeatingPlayDecision(player, game, aiType);
}

/**
 * 首家出牌决策
 */
function getOpeningPlayDecision(
  player: Player,
  game: Game,
  aiType: 'conservative' | 'aggressive' | 'balanced'
): AIDecision {
  const hand = player.hand;
  
  if (hand.length === 0) {
    return {
      action: 'pass',
      confidence: 1.0,
      reason: '手牌已出完'
    };
  }
  
  switch (aiType) {
    case 'conservative':
      return conservativeOpeningPlay(hand, game);
    case 'aggressive':
      return aggressiveOpeningPlay(hand, game);
    case 'balanced':
    default:
      return balancedOpeningPlay(hand, game);
  }
}

/**
 * 保守型首家出牌（优先出小牌）
 */
function conservativeOpeningPlay(hand: Card[], game: Game): AIDecision {
  // 找最小的单张
  const sortedHand = [...hand].sort((a, b) => a.value - b.value);
  
  // 检查是否有小单张
  const smallSingle = sortedHand.find(c => c.value <= 10);
  if (smallSingle) {
    return {
      action: 'play',
      cards: [smallSingle],
      confidence: 0.8,
      reason: '保守策略：出小单张试探'
    };
  }
  
  // 否则出最小的牌
  return {
    action: 'play',
    cards: [sortedHand[0]],
    confidence: 0.7,
    reason: '保守策略：出最小牌'
  };
}

/**
 * 激进型首家出牌（优先出大牌/组合牌）
 */
function aggressiveOpeningPlay(hand: Card[], game: Game): AIDecision {
  // 优先出组合牌型
  const valueCount = countCardsByValue(hand);
  
  // 检查是否有三张
  for (const [value, count] of valueCount.entries()) {
    if (count >= 3 && value >= 10) {
      const cards = hand.filter(c => c.value === value).slice(0, 3);
      return {
        action: 'play',
        cards,
        confidence: 0.9,
        reason: '激进策略：出大三张'
      };
    }
  }
  
  // 检查是否有对子
  for (const [value, count] of valueCount.entries()) {
    if (count >= 2 && value >= 12) {
      const cards = hand.filter(c => c.value === value).slice(0, 2);
      return {
        action: 'play',
        cards,
        confidence: 0.8,
        reason: '激进策略：出大对子'
      };
    }
  }
  
  // 否则出最大的单张
  const sortedHand = [...hand].sort((a, b) => b.value - a.value);
  return {
    action: 'play',
    cards: [sortedHand[0]],
    confidence: 0.7,
    reason: '激进策略：出大牌抢出牌权'
  };
}

/**
 * 平衡型首家出牌（灵活多变）
 */
function balancedOpeningPlay(hand: Card[], game: Game): AIDecision {
  const valueCount = countCardsByValue(hand);
  
  // 优先出组合牌型（三张、顺子等）
  for (const [value, count] of valueCount.entries()) {
    if (count >= 3) {
      const cards = hand.filter(c => c.value === value).slice(0, 3);
      return {
        action: 'play',
        cards,
        confidence: 0.85,
        reason: '平衡策略：出三张牌型'
      };
    }
  }
  
  // 出中小牌
  const sortedHand = [...hand].sort((a, b) => a.value - b.value);
  const midCard = sortedHand[Math.floor(sortedHand.length / 2)];
  
  return {
    action: 'play',
    cards: [midCard],
    confidence: 0.75,
    reason: '平衡策略：出中等牌'
  };
}

/**
 * 跟牌决策
 */
function getBeatingPlayDecision(
  player: Player,
  game: Game,
  aiType: 'conservative' | 'aggressive' | 'balanced'
): AIDecision {
  if (!game.lastHand) {
    return {
      action: 'pass',
      confidence: 1.0,
      reason: '没有上家牌型'
    };
  }
  
  const beatablePlays = getBeatablePlays(player.hand, game.lastHand);
  
  if (beatablePlays.length === 0) {
    return {
      action: 'pass',
      confidence: 1.0,
      reason: '要不起'
    };
  }
  
  // 根据 AI 类型选择出牌
  switch (aiType) {
    case 'conservative':
      return conservativeBeatingPlay(beatablePlays, game.lastHand, player);
    case 'aggressive':
      return aggressiveBeatingPlay(beatablePlays, game.lastHand, player);
    case 'balanced':
    default:
      return balancedBeatingPlay(beatablePlays, game.lastHand, player);
  }
}

/**
 * 保守型跟牌（能过则过，保留大牌）
 */
function conservativeBeatingPlay(
  beatablePlays: HandType[],
  lastHand: HandType,
  player: Player
): AIDecision {
  // 找最小的能管上的牌
  const sortedPlays = beatablePlays.sort((a, b) => {
    if (a.value !== b.value) return a.value - b.value;
    return a.length - b.length;
  });
  
  const play = sortedPlays[0];
  
  // 如果是炸弹，保守策略通常不用
  if (isBombType(play.type) && play.type !== CardType.BOMB) {
    return {
      action: 'pass',
      confidence: 0.9,
      reason: '保守策略：保留炸弹'
    };
  }
  
  return {
    action: 'play',
    cards: play.cards,
    confidence: 0.8,
    reason: '保守策略：用最小牌管上'
  };
}

/**
 * 激进型跟牌（主动压制）
 */
function aggressiveBeatingPlay(
  beatablePlays: HandType[],
  lastHand: HandType,
  player: Player
): AIDecision {
  // 找最大的能管上的牌
  const sortedPlays = beatablePlays.sort((a, b) => {
    if (a.value !== b.value) return b.value - a.value;
    return b.length - a.length;
  });
  
  const play = sortedPlays[0];
  
  return {
    action: 'play',
    cards: play.cards,
    confidence: 0.85,
    reason: '激进策略：用大牌压制'
  };
}

/**
 * 平衡型跟牌（灵活应对）
 */
function balancedBeatingPlay(
  beatablePlays: HandType[],
  lastHand: HandType,
  player: Player
): AIDecision {
  // 如果是队友出牌，考虑是否让队友走
  const isPartner = player.isPartner;
  
  if (isPartner && !isBombType(lastHand.type)) {
    // 队友出牌，如果不是炸弹，考虑让队友走
    return {
      action: 'pass',
      confidence: 0.7,
      reason: '平衡策略：让队友出牌'
    };
  }
  
  // 找中等大小的牌
  const sortedPlays = beatablePlays.sort((a, b) => a.value - b.value);
  const midIndex = Math.floor(sortedPlays.length / 2);
  const play = sortedPlays[midIndex] || sortedPlays[0];
  
  // 如果牌太大，考虑 Pass
  if (play.value - lastHand.value > 3) {
    return {
      action: 'pass',
      confidence: 0.6,
      reason: '平衡策略：保留大牌'
    };
  }
  
  return {
    action: 'play',
    cards: play.cards,
    confidence: 0.75,
    reason: '平衡策略：适度管上'
  };
}

/**
 * 判断游戏结果
 */
export function judgeGameResult(game: Game): GameResult {
  const sortedPlayers = [...game.players].sort((a, b) => {
    // 先按名次排序
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return 0;
  });
  
  const winner = sortedPlayers[0];
  const isDoubleWin = sortedPlayers[0].rank === 1 && sortedPlayers[1].rank === 2 && 
                      sortedPlayers[0].isPartner === sortedPlayers[1].isPartner;
  
  // 判断攻方是否赢（头游是攻方）
  const attackWin = !winner.isPartner;
  
  // 计算升级数
  let levelUp = 0;
  if (isDoubleWin) {
    levelUp = 3;  // 双下升 3 级
  } else if (attackWin) {
    // 头游 + 二游 → 攻方升级
    if (sortedPlayers[1].isPartner === winner.isPartner) {
      levelUp = 2;  // 头游 + 二游
    } else {
      levelUp = 1;  // 头游 + 末游（平局不升级，但这里简化处理）
    }
  }
  
  // 如果是守方头游（双下情况）
  if (!attackWin && sortedPlayers[0].isPartner && sortedPlayers[1].isPartner) {
    levelUp = 3;  // 守方双下攻方，守方升 3 级
  }
  
  return {
    winner,
    ranking: sortedPlayers,
    isDoubleWin,
    attackWin,
    levelUp
  };
}

/**
 * 进贡（输家给赢家进贡）
 */
export function doTribute(game: Game, fromPlayerIndex: number, toPlayerIndex: number, card: Card): Game {
  if (game.state !== GameState.TRIBUTE) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  const fromPlayer = game.players[fromPlayerIndex];
  const toPlayer = game.players[toPlayerIndex];
  
  // 验证是否有这张牌
  const hasCard = fromPlayer.hand.some(c => 
    c.suit === card.suit && c.value === card.value
  );
  
  if (!hasCard) {
    throw new Error(`玩家没有这张牌`);
  }
  
  // 移除进贡的牌
  const newFromHand = removeCardsFromHand(fromPlayer.hand, [card]);
  const newToHand = [...toPlayer.hand, card];
  
  // 更新玩家手牌
  const newPlayers = [...game.players];
  newPlayers[fromPlayerIndex] = { ...fromPlayer, hand: newFromHand };
  newPlayers[toPlayerIndex] = { ...toPlayer, hand: newToHand };
  
  // 更新进贡信息
  const tributeInfo: TributeInfo = game.tributeInfo || {
    fromPlayer: fromPlayerIndex,
    toPlayer: toPlayerIndex,
    tributeCard: null,
    returnCard: null,
    isAntiTribute: false
  };
  tributeInfo.tributeCard = card;
  
  return {
    ...game,
    players: newPlayers,
    tributeInfo
  };
}

/**
 * 还贡（赢家还给输家一张牌）
 */
export function doReturnTribute(game: Game, fromPlayerIndex: number, toPlayerIndex: number, card: Card): Game {
  if (game.state !== GameState.RETURN_TRIBUTE) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  const fromPlayer = game.players[fromPlayerIndex];
  const toPlayer = game.players[toPlayerIndex];
  
  // 验证是否有这张牌
  const hasCard = fromPlayer.hand.some(c => 
    c.suit === card.suit && c.value === card.value
  );
  
  if (!hasCard) {
    throw new Error(`玩家没有这张牌`);
  }
  
  // 移除还贡的牌
  const newFromHand = removeCardsFromHand(fromPlayer.hand, [card]);
  const newToHand = [...toPlayer.hand, card];
  
  // 更新玩家手牌
  const newPlayers = [...game.players];
  newPlayers[fromPlayerIndex] = { ...fromPlayer, hand: newFromHand };
  newPlayers[toPlayerIndex] = { ...toPlayer, hand: newToHand };
  
  // 更新进贡信息
  const tributeInfo = game.tributeInfo!;
  tributeInfo.returnCard = card;
  
  // 检查是否完成进贡还贡
  const allDone = game.players.every((p, i) => {
    if (i === tributeInfo.fromPlayer || i === tributeInfo.toPlayer) return true;
    return true;  // 其他玩家不需要参与
  });
  
  return {
    ...game,
    players: newPlayers,
    tributeInfo,
    state: allDone ? GameState.PLAYING : GameState.RETURN_TRIBUTE
  };
}

/**
 * 抗贡（双下时可以抗贡）
 */
export function doAntiTribute(game: Game, playerIndex: number): Game {
  if (game.state !== GameState.TRIBUTE) {
    throw new Error(`游戏状态错误，当前状态：${game.state}`);
  }
  
  const tributeInfo = game.tributeInfo!;
  
  // 只有末游可以抗贡
  if (playerIndex !== tributeInfo.fromPlayer) {
    throw new Error(`只有进贡方可以抗贡`);
  }
  
  // 检查是否双下（需要判断）
  // 简化处理：允许抗贡
  tributeInfo.isAntiTribute = true;
  
  return {
    ...game,
    tributeInfo,
    state: GameState.PLAYING  // 抗贡后直接进入游戏
  };
}

/**
 * 进入进贡阶段
 */
export function enterTributePhase(game: Game, loserIndex: number, winnerIndex: number): Game {
  return {
    ...game,
    state: GameState.TRIBUTE,
    tributeInfo: {
      fromPlayer: loserIndex,
      toPlayer: winnerIndex,
      tributeCard: null,
      returnCard: null,
      isAntiTribute: false
    }
  };
}

/**
 * 获取可出牌提示
 */
export function getPlayableHints(player: Player, game: Game): HandType[] {
  if (!game.lastHand || game.lastPlayerIndex === game.players.indexOf(player)) {
    // 首轮出牌，返回所有可能的牌型
    return getAllPossiblePlays(player.hand);
  }
  
  // 返回能管上的牌型
  return getBeatablePlays(player.hand, game.lastHand);
}

/**
 * 获取所有可能的牌型
 */
function getAllPossiblePlays(hand: Card[]): HandType[] {
  const plays: HandType[] = [];
  const valueCount = countCardsByValue(hand);
  
  // 单张
  for (const card of hand) {
    plays.push({
      type: CardType.SINGLE,
      value: card.value,
      cards: [card],
      length: 1
    });
  }
  
  // 对子
  for (const [value, count] of valueCount.entries()) {
    if (count >= 2) {
      const cards = hand.filter(c => c.value === value).slice(0, 2);
      plays.push({
        type: CardType.PAIR,
        value,
        cards,
        length: 2
      });
    }
  }
  
  // 三张
  for (const [value, count] of valueCount.entries()) {
    if (count >= 3) {
      const cards = hand.filter(c => c.value === value).slice(0, 3);
      plays.push({
        type: CardType.TRIPLE,
        value,
        cards,
        length: 3
      });
    }
  }
  
  // 炸弹
  for (const [value, count] of valueCount.entries()) {
    if (count >= 4) {
      const cards = hand.filter(c => c.value === value).slice(0, 4);
      plays.push({
        type: CardType.BOMB,
        value,
        cards,
        length: 4
      });
    }
  }
  
  // 核弹（6 张及以上相同）
  for (const [value, count] of valueCount.entries()) {
    if (count >= 6) {
      const cards = hand.filter(c => c.value === value).slice(0, count);
      plays.push({
        type: CardType.NUCLEAR_BOMB,
        value,
        cards,
        length: cards.length
      });
    }
  }
  
  return plays;
}

/**
 * 评估手牌强度（0-100）
 */
export function evaluateHandStrength(hand: Card[]): number {
  let score = 0;
  const valueCount = countCardsByValue(hand);
  
  // 炸弹/核弹加分
  for (const [value, count] of valueCount.entries()) {
    if (count >= 8) score += 50;  // 核弹
    else if (count >= 6) score += 40;  // 大核弹
    else if (count >= 4) score += 20;  // 炸弹
  }
  
  // 王加分
  const jokerCount = hand.filter(c => c.suit === 'joker').length;
  score += jokerCount * 15;
  
  // 大牌加分
  for (const [value, count] of valueCount.entries()) {
    if (value >= 13) {  // K, A, 王
      score += count * 5;
    }
  }
  
  // 组合牌型加分
  const combos = getAllPossiblePlays(hand);
  score += combos.filter(p => isBombType(p.type)).length * 10;
  
  // 手牌数量少加分
  score += Math.max(0, (25 - hand.length) * 2);
  
  return Math.min(100, score);
}

/**
 * 检查是否需要考虑百搭牌
 */
export function canUseWildCard(card: Card, game: Game): boolean {
  if (!game.wildCard) return false;
  if (card.suit === 'joker') return false;  // 王不能作为百搭
  
  // 红心级牌可以作为百搭
  return card.suit === 'hearts' && card.value === game.level;
}

/**
 * 使用百搭牌替代
 */
export function useWildCardAs(
  wildCard: Card,
  asValue: number,
  asSuit?: Card['suit']
): Card {
  return {
    ...wildCard,
    value: asValue,
    suit: asSuit || wildCard.suit,
    displayValue: `${asValue}`  // 显示为替代的牌
  };
}