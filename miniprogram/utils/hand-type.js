/**
 * 牌型判断
 * 识别和比较掼蛋的 11 种牌型
 */
import { countCardsByValue } from './card-utils';
/**
 * 牌型枚举
 */
export var CardType;
(function (CardType) {
    CardType["SINGLE"] = "single";
    CardType["PAIR"] = "pair";
    CardType["TRIPLE"] = "triple";
    CardType["TRIPLE_WITH_PAIR"] = "triple_with_pair";
    CardType["STRAIGHT"] = "straight";
    CardType["CONSECUTIVE_PAIRS"] = "consecutive_pairs";
    CardType["STEEL_PLATE"] = "steel_plate";
    CardType["BOMB"] = "bomb";
    CardType["SAME_COLOR_STRAIGHT_FLUSH"] = "same_color_straight_flush";
    CardType["FOUR_KINGS"] = "four_kings";
    CardType["NUCLEAR_BOMB"] = "nuclear_bomb"; // 核弹（8 张相同）
})(CardType || (CardType = {}));
/**
 * 牌型优先级（用于比较大小）
 * 核弹 > 四大天王 > 同花顺 > 炸弹 > 其他
 */
const TYPE_PRIORITY = {
    [CardType.NUCLEAR_BOMB]: 11,
    [CardType.FOUR_KINGS]: 10,
    [CardType.SAME_COLOR_STRAIGHT_FLUSH]: 9,
    [CardType.BOMB]: 8,
    [CardType.STEEL_PLATE]: 7,
    [CardType.CONSECUTIVE_PAIRS]: 6,
    [CardType.STRAIGHT]: 5,
    [CardType.TRIPLE_WITH_PAIR]: 4,
    [CardType.TRIPLE]: 3,
    [CardType.PAIR]: 2,
    [CardType.SINGLE]: 1
};
/**
 * 识别牌型
 * @param cards 手牌（已排序）
 * @returns 牌型信息，无法识别返回 null
 */
export function identifyHandType(cards) {
    if (cards.length === 0) {
        return null;
    }
    // 按牌面值排序
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    // 检查特殊牌型
    // 1. 核弹（8 张相同）
    if (sortedCards.length === 8) {
        const valueCount = countCardsByValue(sortedCards);
        if (valueCount.size === 1) {
            const value = Array.from(valueCount.keys())[0];
            return {
                type: CardType.NUCLEAR_BOMB,
                value: value,
                cards: sortedCards,
                length: 8
            };
        }
    }
    // 2. 四大天王（4 张王）
    if (sortedCards.length === 4 && sortedCards.every(c => c.suit === 'joker')) {
        return {
            type: CardType.FOUR_KINGS,
            value: 100, // 固定值，大于所有普通牌型
            cards: sortedCards,
            length: 4
        };
    }
    // 3. 同花顺
    const sameColorStraight = checkSameColorStraight(sortedCards);
    if (sameColorStraight) {
        return sameColorStraight;
    }
    // 4. 炸弹（4 张相同）
    if (sortedCards.length === 4) {
        const valueCount = countCardsByValue(sortedCards);
        if (valueCount.size === 1) {
            const value = Array.from(valueCount.keys())[0];
            return {
                type: CardType.BOMB,
                value: value,
                cards: sortedCards,
                length: 4
            };
        }
    }
    // 5. 钢板（2 个连续三张）
    if (sortedCards.length === 6) {
        const steelPlate = checkSteelPlate(sortedCards);
        if (steelPlate) {
            return steelPlate;
        }
    }
    // 6. 连对（3 对连续）
    if (sortedCards.length >= 6 && sortedCards.length % 2 === 0) {
        const consecutivePairs = checkConsecutivePairs(sortedCards);
        if (consecutivePairs) {
            return consecutivePairs;
        }
    }
    // 7. 顺子（5 张连续）
    if (sortedCards.length >= 5) {
        const straight = checkStraight(sortedCards);
        if (straight) {
            return straight;
        }
    }
    // 8. 三带二
    if (sortedCards.length === 5) {
        const tripleWithPair = checkTripleWithPair(sortedCards);
        if (tripleWithPair) {
            return tripleWithPair;
        }
    }
    // 9. 三张
    if (sortedCards.length === 3) {
        const valueCount = countCardsByValue(sortedCards);
        if (valueCount.size === 1) {
            const value = Array.from(valueCount.keys())[0];
            return {
                type: CardType.TRIPLE,
                value: value,
                cards: sortedCards,
                length: 3
            };
        }
    }
    // 10. 对子
    if (sortedCards.length === 2) {
        if (sortedCards[0].value === sortedCards[1].value) {
            return {
                type: CardType.PAIR,
                value: sortedCards[0].value,
                cards: sortedCards,
                length: 2
            };
        }
    }
    // 11. 单张
    if (sortedCards.length === 1) {
        return {
            type: CardType.SINGLE,
            value: sortedCards[0].value,
            cards: sortedCards,
            length: 1
        };
    }
    return null;
}
/**
 * 检查同花顺
 */
function checkSameColorStraight(cards) {
    if (cards.length < 5 || cards.length > 10) {
        return null;
    }
    // 检查是否同花色（排除王）
    const suit = cards[0].suit;
    if (suit === 'joker') {
        return null;
    }
    if (!cards.every(c => c.suit === suit)) {
        return null;
    }
    // 检查是否连续
    for (let i = 1; i < cards.length; i++) {
        if (cards[i - 1].value - cards[i].value !== 1) {
            return null;
        }
    }
    return {
        type: CardType.SAME_COLOR_STRAIGHT_FLUSH,
        value: cards[0].value * 100 + cards.length, // 最大值 + 长度
        cards: cards,
        length: cards.length
    };
}
/**
 * 检查钢板（2 个连续三张）
 */
function checkSteelPlate(cards) {
    const valueCount = countCardsByValue(cards);
    if (valueCount.size !== 2) {
        return null;
    }
    const values = Array.from(valueCount.keys()).sort((a, b) => b - a);
    // 检查是否都是 3 张且连续
    if (valueCount.get(values[0]) === 3 &&
        valueCount.get(values[1]) === 3 &&
        values[0] - values[1] === 1) {
        return {
            type: CardType.STEEL_PLATE,
            value: values[0], // 较大的那个值
            cards: cards,
            length: 6
        };
    }
    return null;
}
/**
 * 检查连对（3 对连续）
 */
function checkConsecutivePairs(cards) {
    const pairCount = cards.length / 2;
    if (pairCount < 3) {
        return null;
    }
    const valueCount = countCardsByValue(cards);
    // 检查是否都是对子
    for (const count of valueCount.values()) {
        if (count !== 2) {
            return null;
        }
    }
    const values = Array.from(valueCount.keys()).sort((a, b) => b - a);
    // 检查是否连续
    for (let i = 1; i < values.length; i++) {
        if (values[i - 1] - values[i] !== 1) {
            return null;
        }
    }
    return {
        type: CardType.CONSECUTIVE_PAIRS,
        value: values[0], // 最大的值
        cards: cards,
        length: cards.length
    };
}
/**
 * 检查顺子（5 张连续）
 */
function checkStraight(cards) {
    // 只取前 5 张检查
    const fiveCards = cards.slice(0, 5);
    // 检查是否有王
    if (fiveCards.some(c => c.suit === 'joker')) {
        return null;
    }
    // 检查是否连续
    for (let i = 1; i < fiveCards.length; i++) {
        if (fiveCards[i - 1].value - fiveCards[i].value !== 1) {
            return null;
        }
    }
    return {
        type: CardType.STRAIGHT,
        value: fiveCards[0].value, // 最大的值
        cards: fiveCards,
        length: 5
    };
}
/**
 * 检查三带二
 */
function checkTripleWithPair(cards) {
    const valueCount = countCardsByValue(cards);
    if (valueCount.size !== 2) {
        return null;
    }
    const values = Array.from(valueCount.keys());
    const tripleValue = values.find(v => valueCount.get(v) === 3);
    const pairValue = values.find(v => valueCount.get(v) === 2);
    if (tripleValue !== undefined && pairValue !== undefined) {
        return {
            type: CardType.TRIPLE_WITH_PAIR,
            value: tripleValue, // 三张的值决定大小
            cards: cards,
            length: 5
        };
    }
    return null;
}
/**
 * 比较两个牌型的大小
 * @param hand1 手牌 1
 * @param hand2 手牌 2
 * @returns 1: hand1 大，-1: hand2 大，0: 相同
 */
export function compareHands(hand1, hand2) {
    // 首先比较牌型优先级
    const priority1 = TYPE_PRIORITY[hand1.type];
    const priority2 = TYPE_PRIORITY[hand2.type];
    if (priority1 !== priority2) {
        return priority1 > priority2 ? 1 : -1;
    }
    // 牌型相同，比较牌面值
    if (hand1.value !== hand2.value) {
        return hand1.value > hand2.value ? 1 : -1;
    }
    // 牌面值相同，比较长度（长的更大）
    if (hand1.length !== hand2.length) {
        return hand1.length > hand2.length ? 1 : -1;
    }
    return 0;
}
/**
 * 获取牌型名称（中文）
 */
export function getHandTypeName(type) {
    const names = {
        [CardType.SINGLE]: '单张',
        [CardType.PAIR]: '对子',
        [CardType.TRIPLE]: '三张',
        [CardType.TRIPLE_WITH_PAIR]: '三带二',
        [CardType.STRAIGHT]: '顺子',
        [CardType.CONSECUTIVE_PAIRS]: '连对',
        [CardType.STEEL_PLATE]: '钢板',
        [CardType.BOMB]: '炸弹',
        [CardType.SAME_COLOR_STRAIGHT_FLUSH]: '同花顺',
        [CardType.FOUR_KINGS]: '四大天王',
        [CardType.NUCLEAR_BOMB]: '核弹'
    };
    return names[type];
}
/**
 * 检查是否为炸弹类牌型（包括核弹、四大天王、同花顺、普通炸弹）
 */
export function isBombType(type) {
    return [
        CardType.NUCLEAR_BOMB,
        CardType.FOUR_KINGS,
        CardType.SAME_COLOR_STRAIGHT_FLUSH,
        CardType.BOMB
    ].includes(type);
}
/**
 * 获取牌型的牌数要求
 */
export function getHandTypeLength(type) {
    const lengths = {
        [CardType.SINGLE]: 1,
        [CardType.PAIR]: 2,
        [CardType.TRIPLE]: 3,
        [CardType.TRIPLE_WITH_PAIR]: 5,
        [CardType.STRAIGHT]: 5, // 最少 5 张
        [CardType.CONSECUTIVE_PAIRS]: 6, // 最少 6 张（3 对）
        [CardType.STEEL_PLATE]: 6,
        [CardType.BOMB]: 4,
        [CardType.SAME_COLOR_STRAIGHT_FLUSH]: 5, // 最少 5 张
        [CardType.FOUR_KINGS]: 4,
        [CardType.NUCLEAR_BOMB]: 8
    };
    return lengths[type];
}
