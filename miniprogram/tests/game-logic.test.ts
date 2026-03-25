/**
 * 游戏逻辑单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  createCard,
  createFullDeck,
  deal,
  Card
} from '../utils/card-core';
import {
  CardType,
  identifyHandType,
  compareHands
} from '../utils/hand-type';
import {
  GameState,
  Player,
  Game,
  createGame,
  startGame,
  finishDealing,
  playCards,
  passTurn,
  nextTurn,
  aiDecision,
  judgeGameResult,
  evaluateHandStrength
} from '../utils/game-logic';

/**
 * 创建测试玩家
 */
function createTestPlayer(id: string, name: string, isAI: boolean = true, aiType: any = 'balanced'): Player {
  return {
    id,
    name,
    hand: [],
    isAI,
    aiType,
    isPartner: id === 'player1' || id === 'player3',
    finished: false
  };
}

describe('游戏状态管理', () => {
  it('应该创建新游戏', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    const game = createGame(players, 2);
    
    expect(game.state).toBe(GameState.IDLE);
    expect(game.players).toHaveLength(4);
    expect(game.level).toBe(2);
    expect(game.currentTurn).toBe(0);
  });

  it('应该开始游戏', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    const game = createGame(players);
    const startedGame = startGame(game);
    
    expect(startedGame.state).toBe(GameState.DEALING);
  });

  it('应该完成发牌', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    // 发牌
    const deck = createFullDeck();
    const dealResult = deal(deck);
    
    players[0].hand = dealResult.player1;
    players[1].hand = dealResult.player2;
    players[2].hand = dealResult.player3;
    players[3].hand = dealResult.player4;
    
    const game = createGame(players);
    const startedGame = startGame(game);
    const dealingDone = finishDealing(startedGame, dealResult.bottom);
    
    expect(dealingDone.state).toBe(GameState.PLAYING);
    expect(dealingDone.bottomCards).toHaveLength(8);
  });
});

describe('玩家轮流出牌', () => {
  it('玩家应该可以出牌', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    // 给玩家 1 一些牌
    players[0].hand = [
      createCard('spades', 14, 'A'),
      createCard('hearts', 14, 'A'),
      createCard('diamonds', 3, '3'),
      createCard('clubs', 3, '3'),
      createCard('spades', 3, '3')
    ];
    
    const game = createGame(players);
    const startedGame = startGame(game);
    const playingGame = {
      ...startedGame,
      state: GameState.PLAYING as GameState,
      currentTurn: 0
    };
    
    // 出三张
    const cardsToPlay = playingGame.players[0].hand.slice(2, 5);
    const newGame = playCards(playingGame, 0, cardsToPlay);
    
    expect(newGame.players[0].hand).toHaveLength(2);
    expect(newGame.lastHand).not.toBeNull();
    expect(newGame.lastHand!.type).toBe(CardType.TRIPLE);
  });

  it('玩家应该可以 Pass', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    players[0].hand = [createCard('spades', 14, 'A')];
    players[1].hand = [createCard('spades', 13, 'K')];
    
    const game = createGame(players);
    
    // 玩家 0 先出牌
    const playingGame = {
      ...game,
      state: GameState.PLAYING as GameState,
      currentTurn: 0,
      lastHand: null,
      lastPlayerIndex: -1,
      passCount: 0
    };
    
    // 玩家 0 出牌
    const afterPlay = playCards(playingGame, 0, [players[0].hand[0]]);
    
    // 轮到玩家 1
    const withNextTurn = {
      ...afterPlay,
      currentTurn: 1
    };
    
    // 玩家 1 Pass
    const afterPass = passTurn(withNextTurn, 1);
    
    expect(afterPass.passCount).toBe(1);
  });

  it('应该轮到下一个玩家', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    const game = createGame(players);
    const playingGame = {
      ...game,
      state: GameState.PLAYING as GameState,
      currentTurn: 0,
      passCount: 0
    };
    
    const newGame = nextTurn(playingGame);
    
    expect(newGame.currentTurn).toBe(1);
  });

  it('连续 3 家 Pass 后应该重置出牌权', () => {
    const players = [
      createTestPlayer('player1', '玩家 1'),
      createTestPlayer('player2', '玩家 2'),
      createTestPlayer('player3', '玩家 3'),
      createTestPlayer('player4', '玩家 4')
    ];
    
    players[0].hand = [createCard('spades', 14, 'A')];
    
    const game = createGame(players);
    
    // 模拟：玩家 0 出牌，玩家 1、2、3 都 Pass
    const playingGame = {
      ...game,
      state: GameState.PLAYING as GameState,
      currentTurn: 3,  // 当前是玩家 3 的回合
      lastHand: identifyHandType([players[0].hand[0]]),
      lastPlayerIndex: 0,  // 最后出牌的是玩家 0
      passCount: 2  // 已经有 2 家 Pass（玩家 1 和 2）
    };
    
    // 玩家 3 Pass，达到 3 家
    const afterPass = passTurn(playingGame, 3);
    
    // 现在 passCount = 3，调用 nextTurn 应该重置
    const newGame = nextTurn(afterPass);
    
    expect(newGame.currentTurn).toBe(0);  // 回到最后出牌的玩家（玩家 0）
    expect(newGame.lastHand).toBeNull();
    expect(newGame.passCount).toBe(0);
  });
});

describe('AI 决策引擎', () => {
  it('保守型 AI 应该出小牌', () => {
    const player: Player = {
      id: 'ai1',
      name: '保守 AI',
      hand: [
        createCard('spades', 3, '3'),
        createCard('hearts', 14, 'A'),
        createCard('diamonds', 10, '10')
      ],
      isAI: true,
      aiType: 'conservative',
      isPartner: false,
      finished: false
    };
    
    const game: Game = {
      state: GameState.PLAYING,
      players: [player],
      currentTurn: 0,
      lastHand: null,
      lastPlayerIndex: -1,
      level: 2,
      wildCard: null,
      bottomCards: [],
      tributeInfo: null,
      passCount: 0,
      round: 1
    };
    
    const decision = aiDecision(player, game);
    
    expect(decision.action).toBe('play');
    expect(decision.cards).toBeDefined();
    expect(decision.cards![0].value).toBeLessThanOrEqual(10);
  });

  it('激进型 AI 应该出大牌', () => {
    const player: Player = {
      id: 'ai2',
      name: '激进 AI',
      hand: [
        createCard('spades', 3, '3'),
        createCard('hearts', 14, 'A'),
        createCard('diamonds', 13, 'K')
      ],
      isAI: true,
      aiType: 'aggressive',
      isPartner: false,
      finished: false
    };
    
    const game: Game = {
      state: GameState.PLAYING,
      players: [player],
      currentTurn: 0,
      lastHand: null,
      lastPlayerIndex: -1,
      level: 2,
      wildCard: null,
      bottomCards: [],
      tributeInfo: null,
      passCount: 0,
      round: 1
    };
    
    const decision = aiDecision(player, game);
    
    expect(decision.action).toBe('play');
    expect(decision.cards).toBeDefined();
    expect(decision.cards![0].value).toBeGreaterThanOrEqual(13);
  });

  it('AI 要不起时应该 Pass', () => {
    const player: Player = {
      id: 'ai3',
      name: 'AI',
      hand: [
        createCard('spades', 3, '3'),
        createCard('hearts', 4, '4')
      ],
      isAI: true,
      aiType: 'balanced',
      isPartner: false,
      finished: false
    };
    
    const previousHand = identifyHandType([
      createCard('spades', 14, 'A'),
      createCard('hearts', 14, 'A'),
      createCard('diamonds', 14, 'A'),
      createCard('clubs', 14, 'A')
    ])!;
    
    const game: Game = {
      state: GameState.PLAYING,
      players: [player],
      currentTurn: 0,
      lastHand: previousHand,
      lastPlayerIndex: 3,
      level: 2,
      wildCard: null,
      bottomCards: [],
      tributeInfo: null,
      passCount: 0,
      round: 1
    };
    
    const decision = aiDecision(player, game);
    
    expect(decision.action).toBe('pass');
  });
});

describe('胜负判断', () => {
  it('应该判断游戏结果', () => {
    const players: Player[] = [
      {
        id: 'player1',
        name: '玩家 1',
        hand: [],
        isAI: false,
        isPartner: true,
        finished: true,
        rank: 1
      },
      {
        id: 'player2',
        name: '玩家 2',
        hand: [],
        isAI: true,
        isPartner: false,
        finished: true,
        rank: 2
      },
      {
        id: 'player3',
        name: '玩家 3',
        hand: [],
        isAI: true,
        isPartner: true,
        finished: true,
        rank: 3
      },
      {
        id: 'player4',
        name: '玩家 4',
        hand: [createCard('spades', 3, '3')],
        isAI: true,
        isPartner: false,
        finished: false
      }
    ];
    
    const game: Game = {
      state: GameState.GAME_OVER,
      players,
      currentTurn: 0,
      lastHand: null,
      lastPlayerIndex: -1,
      level: 2,
      wildCard: null,
      bottomCards: [],
      tributeInfo: null,
      passCount: 0,
      round: 1
    };
    
    const result = judgeGameResult(game);
    
    expect(result.winner).toBe(players[0]);
    expect(result.ranking[0].rank).toBe(1);
    expect(result.ranking[1].rank).toBe(2);
  });

  it('应该识别双下', () => {
    const players: Player[] = [
      {
        id: 'player1',
        name: '玩家 1',
        hand: [],
        isAI: false,
        isPartner: true,
        finished: true,
        rank: 1
      },
      {
        id: 'player3',
        name: '玩家 3',
        hand: [],
        isAI: true,
        isPartner: true,
        finished: true,
        rank: 2
      },
      {
        id: 'player2',
        name: '玩家 2',
        hand: [],
        isAI: true,
        isPartner: false,
        finished: true,
        rank: 3
      },
      {
        id: 'player4',
        name: '玩家 4',
        hand: [],
        isAI: true,
        isPartner: false,
        finished: true,
        rank: 4
      }
    ];
    
    const game: Game = {
      state: GameState.GAME_OVER,
      players,
      currentTurn: 0,
      lastHand: null,
      lastPlayerIndex: -1,
      level: 2,
      wildCard: null,
      bottomCards: [],
      tributeInfo: null,
      passCount: 0,
      round: 1
    };
    
    const result = judgeGameResult(game);
    
    expect(result.isDoubleWin).toBe(true);
    expect(result.levelUp).toBe(3);
  });
});

describe('手牌强度评估', () => {
  it('应该评估手牌强度', () => {
    const hand: Card[] = [];
    
    // 添加一个炸弹
    for (let i = 0; i < 4; i++) {
      const suit = i === 0 ? 'spades' : i === 1 ? 'hearts' : i === 2 ? 'diamonds' : 'clubs';
      hand.push(createCard(suit as any, 10, '10'));
    }
    
    // 添加一些大牌
    hand.push(createCard('spades', 14, 'A'));
    hand.push(createCard('hearts', 14, 'A'));
    hand.push(createCard('joker', 15, '小王'));
    
    const strength = evaluateHandStrength(hand);
    
    expect(strength).toBeGreaterThan(30);
    expect(strength).toBeLessThanOrEqual(100);
  });

  it('核弹手牌应该强度很高', () => {
    const hand: Card[] = [];
    
    // 添加一个核弹（6 张相同）
    for (let i = 0; i < 6; i++) {
      const suit = i === 0 ? 'spades' : i === 1 ? 'hearts' : i === 2 ? 'diamonds' : 'clubs';
      hand.push(createCard(suit as any, 10, '10'));
    }
    
    const strength = evaluateHandStrength(hand);
    
    expect(strength).toBeGreaterThan(50);
  });
});

describe('新牌型识别', () => {
  it('应该识别核弹（6 张相同）', () => {
    const hand: Card[] = [];
    for (let i = 0; i < 6; i++) {
      const suit = i % 4 === 0 ? 'spades' : i % 4 === 1 ? 'hearts' : i % 4 === 2 ? 'diamonds' : 'clubs';
      hand.push(createCard(suit as any, 10, '10'));
    }
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.NUCLEAR_BOMB);
    expect(handType!.length).toBe(6);
  });

  it('应该识别核弹（8 张相同）', () => {
    const hand: Card[] = [];
    for (let i = 0; i < 8; i++) {
      const suit = i % 4 === 0 ? 'spades' : i % 4 === 1 ? 'hearts' : i % 4 === 2 ? 'diamonds' : 'clubs';
      hand.push(createCard(suit as any, 10, '10'));
    }
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.NUCLEAR_BOMB);
    expect(handType!.length).toBe(8);
  });

  it('应该识别飞机（2 个连续三张不带牌）', () => {
    // 6 张牌，2 个连续三张 = 钢板
    const hand = [
      createCard('spades', 10, '10'),
      createCard('hearts', 10, '10'),
      createCard('diamonds', 10, '10'),
      createCard('clubs', 11, 'J'),
      createCard('spades', 11, 'J'),
      createCard('hearts', 11, 'J')
    ];
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.STEEL_PLATE);  // 6 张是钢板
    expect(handType!.value).toBe(11);
  });

  it('应该识别飞机（3 个连续三张）', () => {
    // 9 张牌，3 个连续三张 = 飞机
    const hand: Card[] = [];
    for (let i = 0; i < 3; i++) {
      const value = 10 + i;
      const suits = ['spades', 'hearts', 'diamonds'];
      for (let j = 0; j < 3; j++) {
        hand.push(createCard(suits[j] as any, value, `${value}`));
      }
    }
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.AIRPLANE);  // 9 张是飞机
    expect(handType!.value).toBe(12);
  });

  it('应该识别飞机带对子', () => {
    const hand = [
      createCard('spades', 10, '10'),
      createCard('hearts', 10, '10'),
      createCard('diamonds', 10, '10'),
      createCard('clubs', 11, 'J'),
      createCard('spades', 11, 'J'),
      createCard('hearts', 11, 'J'),
      createCard('diamonds', 5, '5'),
      createCard('clubs', 5, '5')
    ];
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.AIRPLANE);
  });

  it('应该识别三带一', () => {
    const hand = [
      createCard('spades', 10, '10'),
      createCard('hearts', 10, '10'),
      createCard('diamonds', 10, '10'),
      createCard('clubs', 5, '5')
    ];
    
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.TRIPLE_WITH_SINGLE);
    expect(handType!.value).toBe(10);
  });

  it('炸弹应该是 4-5 张相同', () => {
    // 4 张炸弹
    const bomb4 = [
      createCard('spades', 10, '10'),
      createCard('hearts', 10, '10'),
      createCard('diamonds', 10, '10'),
      createCard('clubs', 10, '10')
    ];
    
    const handType4 = identifyHandType(bomb4);
    expect(handType4!.type).toBe(CardType.BOMB);
    expect(handType4!.length).toBe(4);
    
    // 5 张炸弹
    const bomb5: Card[] = [];
    for (let i = 0; i < 5; i++) {
      const suit = i % 4 === 0 ? 'spades' : i % 4 === 1 ? 'hearts' : i % 4 === 2 ? 'diamonds' : 'clubs';
      bomb5.push(createCard(suit as any, 10, '10'));
    }
    
    const handType5 = identifyHandType(bomb5);
    expect(handType5!.type).toBe(CardType.BOMB);
    expect(handType5!.length).toBe(5);
  });

  it('牌型优先级应该正确', () => {
    // 核弹 > 四大天王
    const nuclear: Card[] = [];
    for (let i = 0; i < 6; i++) {
      nuclear.push(createCard('spades', 3, '3'));
    }
    const fourKings = [
      createCard('joker', 15, '小王'),
      createCard('joker', 15, '小王'),
      createCard('joker', 16, '大王'),
      createCard('joker', 16, '大王')
    ];
    
    const nuclearType = identifyHandType(nuclear)!;
    const fourKingsType = identifyHandType(fourKings)!;
    
    expect(compareHands(nuclearType, fourKingsType)).toBe(1);
    
    // 同花顺 > 炸弹
    const straightFlush = [
      createCard('hearts', 10, '10'),
      createCard('hearts', 11, 'J'),
      createCard('hearts', 12, 'Q'),
      createCard('hearts', 13, 'K'),
      createCard('hearts', 14, 'A')
    ];
    const bomb = [
      createCard('spades', 3, '3'),
      createCard('hearts', 3, '3'),
      createCard('diamonds', 3, '3'),
      createCard('clubs', 3, '3')
    ];
    
    const straightFlushType = identifyHandType(straightFlush)!;
    const bombType = identifyHandType(bomb)!;
    
    expect(compareHands(straightFlushType, bombType)).toBe(1);
  });
});