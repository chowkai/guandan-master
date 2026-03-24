/**
 * 卡牌工具函数
 */
/**
 * 卡牌花色枚举
 */
export var Suit;
(function (Suit) {
    Suit["HEART"] = "heart";
    Suit["DIAMOND"] = "diamond";
    Suit["SPADE"] = "spade";
    Suit["CLUB"] = "club";
    Suit["JOKER"] = "joker";
})(Suit || (Suit = {}));
/**
 * 牌面值枚举
 */
export var CardValue;
(function (CardValue) {
    CardValue["ACE"] = "A";
    CardValue["TWO"] = "2";
    CardValue["THREE"] = "3";
    CardValue["FOUR"] = "4";
    CardValue["FIVE"] = "5";
    CardValue["SIX"] = "6";
    CardValue["SEVEN"] = "7";
    CardValue["EIGHT"] = "8";
    CardValue["NINE"] = "9";
    CardValue["TEN"] = "10";
    CardValue["JACK"] = "J";
    CardValue["QUEEN"] = "Q";
    CardValue["KING"] = "K";
    CardValue["BLACK_JOKER"] = "BJ";
    CardValue["RED_JOKER"] = "RJ";
})(CardValue || (CardValue = {}));
/**
 * 牌面大小顺序
 */
export const CARD_ORDER = {
    '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
    'BJ': 16, 'RJ': 17
};
/**
 * 花色符号映射
 */
export const SUIT_SYMBOLS = {
    heart: '♥',
    diamond: '♦',
    spade: '♠',
    club: '♣'
};
/**
 * 花色颜色映射
 */
export const SUIT_COLORS = {
    heart: 'var(--heart-red)',
    diamond: 'var(--diamond-red)',
    spade: 'var(--spade-black)',
    club: 'var(--club-black)'
};
/**
 * 创建一副完整的扑克牌 (54 张)
 */
export function createDeck() {
    const suits = [Suit.HEART, Suit.DIAMOND, Suit.SPADE, Suit.CLUB];
    const values = [
        CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FOUR,
        CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT,
        CardValue.NINE, CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING
    ];
    const deck = [];
    // 添加普通牌
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    // 添加王牌
    deck.push({ suit: Suit.JOKER, value: CardValue.BLACK_JOKER });
    deck.push({ suit: Suit.JOKER, value: CardValue.RED_JOKER });
    return deck;
}
/**
 * 洗牌 (Fisher-Yates 算法)
 */
export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
/**
 * 发牌
 * @param deck 牌堆
 * @param playerCount 玩家数量
 * @returns 每个玩家的手牌
 */
export function dealCards(deck, playerCount = 4) {
    const hands = [];
    for (let i = 0; i < playerCount; i++) {
        hands.push([]);
    }
    // 每人发 25 张牌，剩余 54 - 25*4 = 54 - 100... 实际掼蛋用两副牌
    // 简化处理：每人 27 张
    for (let i = 0; i < deck.length; i++) {
        const playerIndex = i % playerCount;
        hands[playerIndex].push(deck[i]);
    }
    return hands;
}
/**
 * 排序手牌
 */
export function sortHand(hand) {
    return [...hand].sort((a, b) => {
        const orderA = CARD_ORDER[a.value] || 0;
        const orderB = CARD_ORDER[b.value] || 0;
        if (orderB !== orderA) {
            return orderB - orderA; // 从大到小
        }
        // 同点数按花色排序
        return a.suit.localeCompare(b.suit);
    });
}
/**
 * 检测牌型
 */
export function detectPlayType(cards) {
    if (cards.length === 0)
        return 'invalid';
    if (cards.length === 1)
        return 'single';
    const values = cards.map(c => c.value);
    const uniqueValues = new Set(values);
    // 对子
    if (cards.length === 2 && uniqueValues.size === 1) {
        return 'pair';
    }
    // 三张
    if (cards.length === 3 && uniqueValues.size === 1) {
        return 'triple';
    }
    // 炸弹 (4 张相同)
    if (cards.length === 4 && uniqueValues.size === 1) {
        return 'bomb';
    }
    // 顺子 (至少 5 张连续)
    if (cards.length >= 5 && uniqueValues.size === cards.length) {
        const sortedValues = values.sort((a, b) => (CARD_ORDER[a] || 0) - (CARD_ORDER[b] || 0));
        let isConsecutive = true;
        for (let i = 1; i < sortedValues.length; i++) {
            if ((CARD_ORDER[sortedValues[i]] || 0) - (CARD_ORDER[sortedValues[i - 1]] || 0) !== 1) {
                isConsecutive = false;
                break;
            }
        }
        if (isConsecutive)
            return 'straight';
    }
    return 'custom';
}
/**
 * 获取卡牌唯一 ID
 */
export function getCardId(card) {
    return `${card.suit}_${card.value}`;
}
/**
 * 比较两张牌的大小
 */
export function compareCards(a, b) {
    const orderA = CARD_ORDER[a.value] || 0;
    const orderB = CARD_ORDER[b.value] || 0;
    if (orderB !== orderA) {
        return orderB - orderA;
    }
    // 同点数，比较花色
    const suitOrder = {
        heart: 3,
        diamond: 2,
        spade: 1,
        club: 0
    };
    return (suitOrder[b.suit] || 0) - (suitOrder[a.suit] || 0);
}
