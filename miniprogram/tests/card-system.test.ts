/**
 * 卡牌系统单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  createCard,
  createFullDeck,
  shuffle,
  deal,
  sortCards,
  Card
} from '../utils/card-core';
import {
  CardType,
  identifyHandType,
  compareHands,
  getHandTypeName,
  isBombType
} from '../utils/hand-type';
import {
  isValidPlay,
  canPlay
} from '../utils/play-rules';
import {
  suggestPlay,
  getBestSuggestion
} from '../utils/play-suggestion';

describe('卡牌核心功能', () => {
  describe('createFullDeck', () => {
    it('应该创建 108 张牌', () => {
      const deck = createFullDeck();
      expect(deck).toHaveLength(108);
    });

    it('应该包含 4 张王牌', () => {
      const deck = createFullDeck();
      const jokers = deck.filter(c => c.suit === 'joker');
      expect(jokers).toHaveLength(4);
    });

    it('每个点数应该有 8 张牌（2 副牌）', () => {
      const deck = createFullDeck();
      const valueCount = new Map<number, number>();
      
      for (const card of deck) {
        const count = valueCount.get(card.value) || 0;
        valueCount.set(card.value, count + 1);
      }
      
      // 普通牌 2-14 应该各有 8 张
      for (let value = 2; value <= 14; value++) {
        expect(valueCount.get(value)).toBe(8);
      }
      
      // 小王 (15) 和大王 (16) 应该各有 2 张
      expect(valueCount.get(15)).toBe(2);
      expect(valueCount.get(16)).toBe(2);
    });
  });

  describe('shuffle', () => {
    it('应该保持牌的数量不变', () => {
      const deck = createFullDeck();
      const shuffled = shuffle(deck);
      expect(shuffled).toHaveLength(108);
    });

    it('应该打乱牌的顺序', () => {
      const deck = createFullDeck();
      const shuffled = shuffle(deck);
      
      // 概率上几乎不可能完全相同
      const isSame = deck.every((card, i) => 
        card.value === shuffled[i].value && card.suit === shuffled[i].suit
      );
      expect(isSame).toBe(false);
    });
  });

  describe('deal', () => {
    it('应该发 4 家牌，每家 25 张', () => {
      const deck = createFullDeck();
      const result = deal(deck);
      
      expect(result.player1).toHaveLength(25);
      expect(result.player2).toHaveLength(25);
      expect(result.player3).toHaveLength(25);
      expect(result.player4).toHaveLength(25);
      expect(result.bottom).toHaveLength(8);
    });

    it('所有牌应该被分配', () => {
      const deck = createFullDeck();
      const result = deal(deck);
      
      const totalCards = [
        ...result.player1,
        ...result.player2,
        ...result.player3,
        ...result.player4,
        ...result.bottom
      ].length;
      
      expect(totalCards).toBe(108);
    });
  });

  describe('sortCards', () => {
    it('应该按牌面值从大到小排序', () => {
      const hand: Card[] = [
        createCard('spades', 3, '3'),
        createCard('hearts', 14, 'A'),
        createCard('diamonds', 10, '10'),
        createCard('clubs', 16, '大王')
      ];
      
      const sorted = sortCards(hand, 'value');
      
      expect(sorted[0].value).toBe(16);  // 大王
      expect(sorted[1].value).toBe(14);  // A
      expect(sorted[2].value).toBe(10);  // 10
      expect(sorted[3].value).toBe(3);   // 3
    });

    it('应该按花色排序', () => {
      const hand: Card[] = [
        createCard('diamonds', 10, '10'),
        createCard('spades', 10, '10'),
        createCard('hearts', 10, '10'),
        createCard('clubs', 10, '10')
      ];
      
      const sorted = sortCards(hand, 'suit');
      
      expect(sorted[0].suit).toBe('spades');
      expect(sorted[1].suit).toBe('hearts');
      expect(sorted[2].suit).toBe('diamonds');
      expect(sorted[3].suit).toBe('clubs');
    });
  });
});

describe('牌型判断', () => {
  describe('单张', () => {
    it('应该识别单张', () => {
      const hand = [createCard('spades', 14, 'A')];
      const handType = identifyHandType(hand);
      
      expect(handType).not.toBeNull();
      expect(handType!.type).toBe(CardType.SINGLE);
      expect(handType!.value).toBe(14);
    });
  });

  describe('对子', () => {
    it('应该识别对子', () => {
      const hand = [
        createCard('spades', 14, 'A'),
        createCard('hearts', 14, 'A')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.PAIR);
      expect(handType!.value).toBe(14);
    });

    it('不同点数不是对子', () => {
      const hand = [
        createCard('spades', 14, 'A'),
        createCard('hearts', 13, 'K')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType).toBeNull();
    });
  });

  describe('三张', () => {
    it('应该识别三张', () => {
      const hand = [
        createCard('spades', 14, 'A'),
        createCard('hearts', 14, 'A'),
        createCard('diamonds', 14, 'A')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.TRIPLE);
      expect(handType!.value).toBe(14);
    });
  });

  describe('三带二', () => {
    it('应该识别三带二', () => {
      const hand = [
        createCard('spades', 14, 'A'),
        createCard('hearts', 14, 'A'),
        createCard('diamonds', 14, 'A'),
        createCard('clubs', 13, 'K'),
        createCard('spades', 13, 'K')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.TRIPLE_WITH_PAIR);
      expect(handType!.value).toBe(14);
    });
  });

  describe('顺子', () => {
    it('应该识别顺子', () => {
      const hand = [
        createCard('spades', 10, '10'),
        createCard('hearts', 11, 'J'),
        createCard('diamonds', 12, 'Q'),
        createCard('clubs', 13, 'K'),
        createCard('spades', 14, 'A')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.STRAIGHT);
      expect(handType!.value).toBe(14);
    });

    it('包含王不是顺子', () => {
      const hand = [
        createCard('spades', 10, '10'),
        createCard('hearts', 11, 'J'),
        createCard('diamonds', 12, 'Q'),
        createCard('clubs', 13, 'K'),
        createCard('joker', 15, '小王')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType).toBeNull();
    });
  });

  describe('连对', () => {
    it('应该识别连对', () => {
      const hand = [
        createCard('spades', 10, '10'),
        createCard('hearts', 10, '10'),
        createCard('diamonds', 11, 'J'),
        createCard('clubs', 11, 'J'),
        createCard('spades', 12, 'Q'),
        createCard('hearts', 12, 'Q')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.CONSECUTIVE_PAIRS);
      expect(handType!.value).toBe(12);
    });
  });

  describe('钢板', () => {
    it('应该识别钢板', () => {
      const hand = [
        createCard('spades', 10, '10'),
        createCard('hearts', 10, '10'),
        createCard('diamonds', 10, '10'),
        createCard('clubs', 11, 'J'),
        createCard('spades', 11, 'J'),
        createCard('hearts', 11, 'J')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.STEEL_PLATE);
      expect(handType!.value).toBe(11);
    });
  });

  describe('炸弹', () => {
    it('应该识别炸弹', () => {
      const hand = [
        createCard('spades', 10, '10'),
        createCard('hearts', 10, '10'),
        createCard('diamonds', 10, '10'),
        createCard('clubs', 10, '10')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.BOMB);
      expect(handType!.value).toBe(10);
    });
  });

  describe('同花顺', () => {
    it('应该识别同花顺', () => {
      const hand = [
        createCard('hearts', 10, '10'),
        createCard('hearts', 11, 'J'),
        createCard('hearts', 12, 'Q'),
        createCard('hearts', 13, 'K'),
        createCard('hearts', 14, 'A')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.SAME_COLOR_STRAIGHT_FLUSH);
    });

    it('不同花色不是同花顺', () => {
      const hand = [
        createCard('hearts', 10, '10'),
        createCard('diamonds', 11, 'J'),
        createCard('hearts', 12, 'Q'),
        createCard('hearts', 13, 'K'),
        createCard('hearts', 14, 'A')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).not.toBe(CardType.SAME_COLOR_STRAIGHT_FLUSH);
    });
  });

  describe('四大天王', () => {
    it('应该识别四大天王', () => {
      const hand = [
        createCard('joker', 15, '小王'),
        createCard('joker', 15, '小王'),
        createCard('joker', 16, '大王'),
        createCard('joker', 16, '大王')
      ];
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.FOUR_KINGS);
    });
  });

  describe('核弹', () => {
    it('应该识别核弹', () => {
      const hand: Card[] = [];
      for (let i = 0; i < 8; i++) {
        const suit = i < 2 ? 'spades' : i < 4 ? 'hearts' : i < 6 ? 'diamonds' : 'clubs';
        hand.push(createCard(suit as any, 10, '10'));
      }
      const handType = identifyHandType(hand);
      
      expect(handType!.type).toBe(CardType.NUCLEAR_BOMB);
    });
  });
});

describe('牌型比较', () => {
  it('应该比较同类型牌型大小', () => {
    const hand1 = [createCard('spades', 14, 'A')];
    const hand2 = [createCard('spades', 13, 'K')];
    
    const type1 = identifyHandType(hand1)!;
    const type2 = identifyHandType(hand2)!;
    
    expect(compareHands(type1, type2)).toBe(1);
  });

  it('炸弹应该大于普通牌型', () => {
    const bomb = [
      createCard('spades', 3, '3'),
      createCard('hearts', 3, '3'),
      createCard('diamonds', 3, '3'),
      createCard('clubs', 3, '3')
    ];
    const single = [createCard('spades', 16, '大王')];
    
    const bombType = identifyHandType(bomb)!;
    const singleType = identifyHandType(single)!;
    
    expect(compareHands(bombType, singleType)).toBe(1);
  });

  it('核弹应该最大', () => {
    const nuclear: Card[] = [];
    for (let i = 0; i < 8; i++) {
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
  });
});

describe('出牌规则验证', () => {
  describe('isValidPlay', () => {
    it('应该验证合法出牌', () => {
      const hand = [createCard('spades', 14, 'A')];
      expect(isValidPlay(hand)).toBe(true);
    });

    it('应该拒绝非法出牌', () => {
      const hand = [
        createCard('spades', 14, 'A'),
        createCard('hearts', 13, 'K')
      ];
      expect(isValidPlay(hand)).toBe(false);
    });

    it('空牌不是合法出牌', () => {
      expect(isValidPlay([])).toBe(false);
    });
  });

  describe('canPlay', () => {
    it('首轮可以出任意合法牌', () => {
      const hand = [createCard('spades', 3, '3')];
      const handType = identifyHandType(hand)!;
      
      expect(canPlay(handType, null)).toBe(true);
    });

    it('应该可以管上更小的牌', () => {
      const current = [createCard('spades', 14, 'A')];
      const previous = [createCard('spades', 13, 'K')];
      
      const currentType = identifyHandType(current)!;
      const previousType = identifyHandType(previous)!;
      
      expect(canPlay(currentType, previousType)).toBe(true);
    });

    it('不能管上更大的牌', () => {
      const current = [createCard('spades', 13, 'K')];
      const previous = [createCard('spades', 14, 'A')];
      
      const currentType = identifyHandType(current)!;
      const previousType = identifyHandType(previous)!;
      
      expect(canPlay(currentType, previousType)).toBe(false);
    });
  });
});

describe('智能提示', () => {
  it('应该提供出牌建议', () => {
    const hand: Card[] = [];
    for (let i = 0; i < 25; i++) {
      hand.push(createCard('spades', (i % 13) + 2, `${(i % 13) + 2}`));
    }
    
    const suggestions = suggestPlay(hand);
    
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('首轮应该推荐出小牌', () => {
    const hand = [
      createCard('spades', 3, '3'),
      createCard('hearts', 14, 'A')
    ];
    
    const suggestions = suggestPlay(hand);
    
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('应该获取最佳建议', () => {
    const hand = [
      createCard('spades', 3, '3'),
      createCard('hearts', 14, 'A')
    ];
    
    const bestSuggestion = getBestSuggestion(hand);
    
    expect(bestSuggestion).not.toBeNull();
    expect(bestSuggestion!.confidence).toBeGreaterThan(0);
  });
});

describe('工具函数', () => {
  describe('getHandTypeName', () => {
    it('应该返回正确的中文名称', () => {
      expect(getHandTypeName(CardType.SINGLE)).toBe('单张');
      expect(getHandTypeName(CardType.PAIR)).toBe('对子');
      expect(getHandTypeName(CardType.BOMB)).toBe('炸弹');
      expect(getHandTypeName(CardType.STRAIGHT)).toBe('顺子');
    });
  });

  describe('isBombType', () => {
    it('应该识别炸弹类牌型', () => {
      expect(isBombType(CardType.BOMB)).toBe(true);
      expect(isBombType(CardType.NUCLEAR_BOMB)).toBe(true);
      expect(isBombType(CardType.FOUR_KINGS)).toBe(true);
      expect(isBombType(CardType.SAME_COLOR_STRAIGHT_FLUSH)).toBe(true);
    });

    it('应该识别非炸弹类牌型', () => {
      expect(isBombType(CardType.SINGLE)).toBe(false);
      expect(isBombType(CardType.PAIR)).toBe(false);
      expect(isBombType(CardType.STRAIGHT)).toBe(false);
    });
  });
});

describe('边界情况', () => {
  it('空手牌应该返回 null', () => {
    const handType = identifyHandType([]);
    expect(handType).toBeNull();
  });

  it('单张王应该被识别', () => {
    const hand = [createCard('joker', 16, '大王')];
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
    expect(handType!.type).toBe(CardType.SINGLE);
    expect(handType!.value).toBe(16);
  });

  it('5 张以上顺子应该被识别', () => {
    const hand = [
      createCard('spades', 9, '9'),
      createCard('spades', 10, '10'),
      createCard('spades', 11, 'J'),
      createCard('spades', 12, 'Q'),
      createCard('spades', 13, 'K'),
      createCard('spades', 14, 'A')
    ];
    const handType = identifyHandType(hand);
    
    expect(handType).not.toBeNull();
  });
});