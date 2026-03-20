"""
掼蛋游戏 - 牌型判断规则模块

本模块实现了掼蛋游戏中所有牌型的识别、验证和大小比较。
支持级牌（逢人配）的百搭功能。

牌型分类：
1. 普通牌型：单张、对子、三张、三带二、顺子、连对、钢板
2. 炸弹类：四张炸弹、五张炸弹、核弹（6 张+）、同花顺、四大天王

牌型大小：
四大天王 > 10 张核弹 > 9 张 > 8 张 > 7 张 > 6 张核弹 > 同花顺 > 5 张炸弹 > 4 张炸弹

作者：代码虾
创建日期：2026-03-20
"""

from enum import Enum
from typing import List, Optional, Tuple, Dict
from collections import Counter
from .cards import Card, CardRank, Suit


class CardType(Enum):
    """
    牌型枚举
    """
    INVALID = "invalid"           # 无效牌型
    SINGLE = "single"             # 单张
    PAIR = "pair"                 # 对子
    TRIPLE = "triple"             # 三张
    TRIPLE_WITH_PAIR = "triple_with_pair"  # 三带二
    STRAIGHT = "straight"         # 顺子
    CONSECUTIVE_PAIRS = "consecutive_pairs"  # 连对
    STEEL_PLATE = "steel_plate"   # 钢板（连续三张）
    BOMB_4 = "bomb_4"             # 四张炸弹
    BOMB_5 = "bomb_5"             # 五张炸弹
    NUCLEAR_6 = "nuclear_6"       # 六张核弹
    NUCLEAR_7 = "nuclear_7"       # 七张核弹
    NUCLEAR_8_PLUS = "nuclear_8_plus"  # 八张及以上核弹
    SAME_SUIT_STRAIGHT = "same_suit_straight"  # 同花顺
    FOUR_KINGS = "four_kings"     # 四大天王
    
    @property
    def is_bomb(self) -> bool:
        """判断是否为炸弹类牌型"""
        return self in [
            CardType.BOMB_4, CardType.BOMB_5,
            CardType.NUCLEAR_6, CardType.NUCLEAR_7, CardType.NUCLEAR_8_PLUS,
            CardType.SAME_SUIT_STRAIGHT, CardType.FOUR_KINGS
        ]
    
    @property
    def display_name(self) -> str:
        """返回牌型的中文显示名称"""
        name_map = {
            CardType.INVALID: "无效牌型",
            CardType.SINGLE: "单张",
            CardType.PAIR: "对子",
            CardType.TRIPLE: "三张",
            CardType.TRIPLE_WITH_PAIR: "三带二",
            CardType.STRAIGHT: "顺子",
            CardType.CONSECUTIVE_PAIRS: "连对",
            CardType.STEEL_PLATE: "钢板",
            CardType.BOMB_4: "炸弹",
            CardType.BOMB_5: "炸弹",
            CardType.NUCLEAR_6: "核弹",
            CardType.NUCLEAR_7: "核弹",
            CardType.NUCLEAR_8_PLUS: "核弹",
            CardType.SAME_SUIT_STRAIGHT: "同花顺",
            CardType.FOUR_KINGS: "四大天王"
        }
        return name_map.get(self, "未知")


class HandResult:
    """
    牌型判断结果类
    
    Attributes:
        card_type: 牌型
        is_valid: 是否有效
        main_rank: 主要牌面值（用于比较大小）
        extra_info: 额外信息（如炸弹张数、花色等）
        power: 牌型威力值（用于比较）
    """
    
    def __init__(self, card_type: CardType = CardType.INVALID, 
                 is_valid: bool = False,
                 main_rank: Optional[int] = None,
                 extra_info: Optional[Dict] = None,
                 power: int = 0):
        self.card_type = card_type
        self.is_valid = is_valid
        self.main_rank = main_rank
        self.extra_info = extra_info or {}
        self.power = power
    
    def __str__(self):
        if not self.is_valid:
            return "无效牌型"
        bomb_info = ""
        if self.card_type.is_bomb:
            bomb_info = f" (威力:{self.power})"
        return f"{self.card_type.display_name}{bomb_info}"
    
    def __repr__(self):
        return f"HandResult({self.card_type.value}, valid={self.is_valid}, power={self.power})"


class RulesEngine:
    """
    规则引擎类
    
    提供牌型识别、验证、大小比较等功能。
    
    Attributes:
        level: 当前级数
    """
    
    # 牌型威力值（用于比较大小）
    # 根据掼蛋规则：核弹（6 张+）> 同花顺 > 5 张炸弹 > 4 张炸弹
    BOMB_POWER = {
        CardType.BOMB_4: 40,
        CardType.BOMB_5: 50,
        CardType.SAME_SUIT_STRAIGHT: 55,  # 同花顺威力介于 5 张炸弹和 6 张核弹之间
        CardType.NUCLEAR_6: 60,
        CardType.NUCLEAR_7: 70,
        CardType.NUCLEAR_8_PLUS: 80,
        CardType.FOUR_KINGS: 100,  # 四大天王最大
    }
    
    def __init__(self, level: int = 2):
        """
        初始化规则引擎
        
        Args:
            level: 当前级数
        """
        self.level = level
    
    def analyze_hand(self, cards: List[Card]) -> HandResult:
        """
        分析手牌的牌型
        
        Args:
            cards: 牌列表
            
        Returns:
            牌型判断结果
        """
        if not cards:
            return HandResult(CardType.INVALID, False)
        
        # 按牌面值排序
        sorted_cards = sorted(cards, key=lambda c: c._compare_value())
        
        # 检查特殊牌型（四大天王）
        result = self._check_four_kings(sorted_cards)
        if result.is_valid:
            return result
        
        # 检查普通牌型
        result = self._check_single(sorted_cards)
        if result.is_valid:
            return result
        
        result = self._check_pair(sorted_cards)
        if result.is_valid:
            return result
        
        result = self._check_triple(sorted_cards)
        if result.is_valid:
            return result
        
        result = self._check_triple_with_pair(sorted_cards)
        if result.is_valid:
            return result
        
        # 先检查同花顺（特殊的顺子），再检查普通顺子
        if len(sorted_cards) == 5:
            result = self._check_same_suit_straight(sorted_cards)
            if result.is_valid:
                return result
        
        result = self._check_straight(sorted_cards)
        if result.is_valid:
            return result
        
        result = self._check_consecutive_pairs(sorted_cards)
        if result.is_valid:
            return result
        
        result = self._check_steel_plate(sorted_cards)
        if result.is_valid:
            return result
        
        # 检查炸弹类牌型（除同花顺和四大天王）
        result = self._check_bomb(sorted_cards)
        if result.is_valid:
            return result
        
        return HandResult(CardType.INVALID, False)
    
    def _get_rank_counts(self, cards: List[Card]) -> Dict[int, int]:
        """
        统计各牌面值的数量（考虑级牌百搭）
        
        Args:
            cards: 牌列表
            
        Returns:
            字典 {牌面值：数量}
        """
        # 分离级牌和非级牌
        level_cards = [c for c in cards if c.is_level_card]
        normal_cards = [c for c in cards if not c.is_level_card]
        
        # 统计非级牌的牌面值
        rank_counts = Counter(c.rank.value for c in normal_cards)
        
        return {
            'rank_counts': rank_counts,
            'level_count': len(level_cards),
            'level_cards': level_cards,
            'normal_cards': normal_cards
        }
    
    def _check_single(self, cards: List[Card]) -> HandResult:
        """检查是否为单张"""
        if len(cards) != 1:
            return HandResult(CardType.INVALID, False)
        
        return HandResult(
            CardType.SINGLE,
            True,
            main_rank=cards[0].rank.value,
            power=cards[0]._compare_value()
        )
    
    def _check_pair(self, cards: List[Card]) -> HandResult:
        """检查是否为对子"""
        if len(cards) != 2:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 两张相同，或级牌配任何牌
        if len(rank_counts) == 1:
            # 两张相同牌面值
            main_rank = list(rank_counts.keys())[0]
            return HandResult(
                CardType.PAIR,
                True,
                main_rank=main_rank,
                power=main_rank * 10
            )
        elif len(rank_counts) == 0 and level_count == 2:
            # 两张都是级牌，可以当对子
            return HandResult(
                CardType.PAIR,
                True,
                main_rank=self.level,
                power=self.level * 10
            )
        elif len(rank_counts) == 1 and level_count == 1:
            # 一张级牌 + 一张普通牌，级牌可以配
            main_rank = list(rank_counts.keys())[0]
            return HandResult(
                CardType.PAIR,
                True,
                main_rank=main_rank,
                power=main_rank * 10
            )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_triple(self, cards: List[Card]) -> HandResult:
        """检查是否为三张"""
        if len(cards) != 3:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 三张相同，或用级牌凑成三张
        if len(rank_counts) == 1:
            main_rank = list(rank_counts.keys())[0]
            return HandResult(
                CardType.TRIPLE,
                True,
                main_rank=main_rank,
                power=main_rank * 10
            )
        elif len(rank_counts) == 2 and level_count >= 1:
            # 有一张级牌可以百搭
            for rank, count in rank_counts.items():
                if count == 2 and level_count == 1:
                    return HandResult(
                        CardType.TRIPLE,
                        True,
                        main_rank=rank,
                        power=rank * 10
                    )
        elif len(rank_counts) == 3 and level_count == 3:
            # 三张都是级牌
            return HandResult(
                CardType.TRIPLE,
                True,
                main_rank=self.level,
                power=self.level * 10
            )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_triple_with_pair(self, cards: List[Card]) -> HandResult:
        """检查是否为三带二"""
        if len(cards) != 5:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 标准三带二：3 张相同 + 2 张相同
        if len(rank_counts) == 2:
            counts = sorted(rank_counts.values(), reverse=True)
            if counts == [3, 2]:
                main_rank = max(rank_counts.keys(), key=lambda r: rank_counts[r])
                return HandResult(
                    CardType.TRIPLE_WITH_PAIR,
                    True,
                    main_rank=main_rank,
                    power=main_rank * 10
                )
        
        # 有级牌的情况：需要能组成 3+2
        # 简化处理：至少要有 3 张相同的（含级牌）和 2 张相同的（含级牌）
        if level_count > 0:
            # 尝试用级牌凑成三带二
            normal_ranks = list(rank_counts.keys())
            if len(normal_ranks) == 1:
                # 只有一种非级牌，用级牌凑
                rank = normal_ranks[0]
                count = rank_counts[rank]
                if count >= 2 and level_count >= 3 - count:
                    return HandResult(
                        CardType.TRIPLE_WITH_PAIR,
                        True,
                        main_rank=rank,
                        power=rank * 10
                    )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_straight(self, cards: List[Card]) -> HandResult:
        """检查是否为顺子（5 张连续单牌）"""
        if len(cards) != 5:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 获取所有牌面值（去重）
        ranks = sorted(rank_counts.keys())
        
        # 顺子不能有对子（除非用级牌）
        if any(count > 1 for count in rank_counts.values()):
            return HandResult(CardType.INVALID, False)
        
        # 检查是否连续
        if len(ranks) == 5:
            if ranks[-1] - ranks[0] == 4:
                # 完全连续
                return HandResult(
                    CardType.STRAIGHT,
                    True,
                    main_rank=ranks[-1],  # 最大牌
                    power=ranks[-1] * 10
                )
        elif len(ranks) < 5 and level_count > 0 and len(ranks) > 0:
            # 有级牌可以填补空缺
            # 简化：检查最小和最大牌的差值
            if ranks[-1] - ranks[0] <= 4:
                return HandResult(
                    CardType.STRAIGHT,
                    True,
                    main_rank=ranks[-1],
                    power=ranks[-1] * 10
                )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_consecutive_pairs(self, cards: List[Card]) -> HandResult:
        """检查是否为连对（3 对及以上连续对子）"""
        if len(cards) < 6 or len(cards) % 2 != 0:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 至少 3 对
        pair_count = len(cards) // 2
        if pair_count < 3:
            return HandResult(CardType.INVALID, False)
        
        # 检查是否都是对子（考虑级牌）
        # 简化处理：检查牌面值种类和数量
        ranks = sorted(rank_counts.keys())
        
        # 如果没有级牌，检查标准连对
        if level_count == 0:
            if all(count == 2 for count in rank_counts.values()):
                if ranks[-1] - ranks[0] == pair_count - 1:
                    return HandResult(
                        CardType.CONSECUTIVE_PAIRS,
                        True,
                        main_rank=ranks[-1],
                        power=ranks[-1] * 10,
                        extra_info={'pair_count': pair_count}
                    )
        
        # 有级牌的情况较复杂，简化处理
        # 检查基本连续性
        if len(ranks) <= pair_count and level_count > 0 and len(ranks) > 0:
            if ranks[-1] - ranks[0] <= pair_count - 1:
                return HandResult(
                    CardType.CONSECUTIVE_PAIRS,
                    True,
                    main_rank=ranks[-1],
                    power=ranks[-1] * 10,
                    extra_info={'pair_count': pair_count}
                )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_steel_plate(self, cards: List[Card]) -> HandResult:
        """检查是否为钢板（2 个连续三张）"""
        if len(cards) != 6:
            return HandResult(CardType.INVALID, False)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 标准钢板：两个连续的三张
        if len(rank_counts) == 2:
            counts = sorted(rank_counts.values())
            if counts == [3, 3]:
                ranks = sorted(rank_counts.keys())
                if ranks[1] - ranks[0] == 1:
                    return HandResult(
                        CardType.STEEL_PLATE,
                        True,
                        main_rank=ranks[1],
                        power=ranks[1] * 10
                    )
        
        # 有级牌的情况简化处理
        if level_count > 0 and len(rank_counts) <= 2:
            ranks = sorted(rank_counts.keys())
            if len(ranks) == 2 and ranks[1] - ranks[0] == 1:
                return HandResult(
                    CardType.STEEL_PLATE,
                    True,
                    main_rank=ranks[1],
                    power=ranks[1] * 10
                )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_bomb(self, cards: List[Card]) -> HandResult:
        """检查是否为炸弹类牌型（普通炸弹和核弹）"""
        num_cards = len(cards)
        
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        # 检查四大天王（4 张王）
        joker_count = sum(1 for c in cards if c.rank in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER])
        if joker_count == 4:
            return HandResult(
                CardType.FOUR_KINGS,
                True,
                main_rank=100,
                power=self.BOMB_POWER[CardType.FOUR_KINGS]
            )
        
        # 检查普通炸弹（4-5 张）和核弹（6 张+）
        if num_cards >= 4:
            # 检查是否所有牌都是同一牌面值（或用级牌凑成）
            if len(rank_counts) == 1:
                main_rank = list(rank_counts.keys())[0]
                card_type = self._get_bomb_type(num_cards)
                if card_type:
                    return HandResult(
                        card_type,
                        True,
                        main_rank=main_rank,
                        power=self.BOMB_POWER.get(card_type, num_cards * 10)
                    )
            elif len(rank_counts) > 1 and level_count > 0:
                # 有级牌可以凑成炸弹
                # 简化：如果非级牌都是同一牌面值，可以用级牌凑
                normal_ranks = list(rank_counts.keys())
                if len(normal_ranks) == 1:
                    main_rank = normal_ranks[0]
                    card_type = self._get_bomb_type(num_cards)
                    if card_type:
                        return HandResult(
                            card_type,
                            True,
                            main_rank=main_rank,
                            power=self.BOMB_POWER.get(card_type, num_cards * 10)
                        )
        
        return HandResult(CardType.INVALID, False)
    
    def _get_bomb_type(self, num_cards: int) -> Optional[CardType]:
        """根据牌数获取炸弹类型"""
        if num_cards == 4:
            return CardType.BOMB_4
        elif num_cards == 5:
            return CardType.BOMB_5
        elif num_cards == 6:
            return CardType.NUCLEAR_6
        elif num_cards == 7:
            return CardType.NUCLEAR_7
        elif num_cards >= 8:
            return CardType.NUCLEAR_8_PLUS
        return None
    
    def _check_same_suit_straight(self, cards: List[Card]) -> HandResult:
        """检查是否为同花顺"""
        if len(cards) != 5:
            return HandResult(CardType.INVALID, False)
        
        # 检查花色（排除王）
        # 所有牌必须是同一花色（级牌可以百搭花色）
        normal_suits = [c.suit for c in cards if not c.is_level_card and c.suit != Suit.JOKER]
        
        # 如果没有非级牌，默认是同花顺（级牌可以当任何花色）
        if not normal_suits:
            # 全是级牌，可以当同花顺
            pass
        elif len(set(normal_suits)) > 1:
            # 有不同花色的非级牌，不是同花顺
            return HandResult(CardType.INVALID, False)
        
        # 检查是否连续
        info = self._get_rank_counts(cards)
        rank_counts = info['rank_counts']
        level_count = info['level_count']
        
        ranks = sorted(rank_counts.keys())
        
        if len(ranks) == 5:
            if ranks[-1] - ranks[0] == 4:
                return HandResult(
                    CardType.SAME_SUIT_STRAIGHT,
                    True,
                    main_rank=ranks[-1],
                    power=self.BOMB_POWER[CardType.SAME_SUIT_STRAIGHT],
                    extra_info={'suit': normal_suits[0] if normal_suits else Suit.SPADES}
                )
        elif len(ranks) < 5 and level_count > 0 and len(ranks) > 0:
            if ranks[-1] - ranks[0] <= 4:
                return HandResult(
                    CardType.SAME_SUIT_STRAIGHT,
                    True,
                    main_rank=ranks[-1],
                    power=self.BOMB_POWER[CardType.SAME_SUIT_STRAIGHT],
                    extra_info={'suit': normal_suits[0] if normal_suits else Suit.SPADES}
                )
        
        return HandResult(CardType.INVALID, False)
    
    def _check_four_kings(self, cards: List[Card]) -> HandResult:
        """检查是否为四大天王"""
        if len(cards) != 4:
            return HandResult(CardType.INVALID, False)
        
        joker_count = sum(1 for c in cards if c.rank in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER])
        if joker_count == 4:
            return HandResult(
                CardType.FOUR_KINGS,
                True,
                main_rank=100,
                power=self.BOMB_POWER[CardType.FOUR_KINGS]
            )
        
        return HandResult(CardType.INVALID, False)
    
    def can_beat(self, attacking_cards: List[Card], defending_cards: List[Card]) -> bool:
        """
        判断攻击牌是否能打败防守牌
        
        Args:
            attacking_cards: 攻击方出的牌
            defending_cards: 防守方出的牌
            
        Returns:
            是否能打败
        """
        attack_result = self.analyze_hand(attacking_cards)
        defend_result = self.analyze_hand(defending_cards)
        
        if not attack_result.is_valid or not defend_result.is_valid:
            return False
        
        # 炸弹可以打非炸弹
        if attack_result.card_type.is_bomb and not defend_result.card_type.is_bomb:
            return True
        
        # 非炸弹不能打炸弹
        if not attack_result.card_type.is_bomb and defend_result.card_type.is_bomb:
            return False
        
        # 同类型牌型比较
        if attack_result.card_type == defend_result.card_type:
            # 牌数必须相同（除了炸弹）
            if not attack_result.card_type.is_bomb:
                if len(attacking_cards) != len(defending_cards):
                    return False
            
            # 比较牌面大小
            return attack_result.power > defend_result.power
        
        # 不同炸弹类型比较威力
        if attack_result.card_type.is_bomb and defend_result.card_type.is_bomb:
            return attack_result.power > defend_result.power
        
        return False
    
    def get_valid_hands(self, cards: List[Card]) -> List[Tuple[List[Card], CardType]]:
        """
        获取手牌中所有可能的有效牌型组合
        
        Args:
            cards: 手牌列表
            
        Returns:
            列表 [(牌列表，牌型)]
        """
        # 这是一个复杂的组合问题，这里提供简化版本
        # 实际实现需要枚举所有可能的组合
        valid_hands = []
        
        # 单张
        for card in cards:
            result = self.analyze_hand([card])
            if result.is_valid:
                valid_hands.append(([card], result.card_type))
        
        # 对子
        rank_groups = {}
        for card in cards:
            rank = card.rank.value
            if rank not in rank_groups:
                rank_groups[rank] = []
            rank_groups[rank].append(card)
        
        for rank, group in rank_groups.items():
            if len(group) >= 2:
                result = self.analyze_hand(group[:2])
                if result.is_valid:
                    valid_hands.append((group[:2], result.card_type))
        
        return valid_hands


# 工具函数

def compare_hands(hand1: List[Card], hand2: List[Card], level: int = 2) -> int:
    """
    比较两手牌的大小
    
    Args:
        hand1: 第一手牌
        hand2: 第二手牌
        level: 当前级数
        
    Returns:
        1 表示 hand1 大，-1 表示 hand2 大，0 表示无法比较或相同
    """
    engine = RulesEngine(level=level)
    
    if engine.can_beat(hand1, hand2):
        return 1
    elif engine.can_beat(hand2, hand1):
        return -1
    else:
        return 0


# 测试代码
if __name__ == "__main__":
    from .cards import Card, CardRank, Suit, create_standard_deck
    
    print("=== 掼蛋牌型规则测试 ===\n")
    
    engine = RulesEngine(level=2)
    
    # 测试单张
    print("1. 测试单张:")
    single = [Card(CardRank.ACE, Suit.SPADES, level=2)]
    result = engine.analyze_hand(single)
    print(f"   {single} -> {result}")
    
    # 测试对子
    print("\n2. 测试对子:")
    pair = [Card(CardRank.ACE, Suit.SPADES, level=2), 
            Card(CardRank.ACE, Suit.HEARTS, level=2)]
    result = engine.analyze_hand(pair)
    print(f"   对 A -> {result}")
    
    # 测试三张
    print("\n3. 测试三张:")
    triple = [Card(CardRank.KING, Suit.SPADES, level=2),
              Card(CardRank.KING, Suit.HEARTS, level=2),
              Card(CardRank.KING, Suit.CLUBS, level=2)]
    result = engine.analyze_hand(triple)
    print(f"   三个 K -> {result}")
    
    # 测试三带二
    print("\n4. 测试三带二:")
    triple_pair = [Card(CardRank.KING, Suit.SPADES, level=2),
                   Card(CardRank.KING, Suit.HEARTS, level=2),
                   Card(CardRank.KING, Suit.CLUBS, level=2),
                   Card(CardRank.FOUR, Suit.SPADES, level=2),
                   Card(CardRank.FOUR, Suit.HEARTS, level=2)]
    result = engine.analyze_hand(triple_pair)
    print(f"   KKK+44 -> {result}")
    
    # 测试顺子
    print("\n5. 测试顺子:")
    straight = [Card(CardRank.THREE, Suit.SPADES, level=2),
                Card(CardRank.FOUR, Suit.HEARTS, level=2),
                Card(CardRank.FIVE, Suit.CLUBS, level=2),
                Card(CardRank.SIX, Suit.DIAMONDS, level=2),
                Card(CardRank.SEVEN, Suit.SPADES, level=2)]
    result = engine.analyze_hand(straight)
    print(f"   34567 -> {result}")
    
    # 测试炸弹
    print("\n6. 测试炸弹:")
    bomb4 = [Card(CardRank.THREE, Suit.SPADES, level=2),
             Card(CardRank.THREE, Suit.HEARTS, level=2),
             Card(CardRank.THREE, Suit.CLUBS, level=2),
             Card(CardRank.THREE, Suit.DIAMONDS, level=2)]
    result = engine.analyze_hand(bomb4)
    print(f"   四个 3 -> {result}")
    
    # 测试核弹
    print("\n7. 测试核弹:")
    deck = create_standard_deck(level=2)
    nuclear_6 = [c for c in deck if c.rank == CardRank.THREE][:6]
    result = engine.analyze_hand(nuclear_6)
    print(f"   六个 3 -> {result}")
    
    # 测试同花顺
    print("\n8. 测试同花顺:")
    same_suit = [Card(CardRank.THREE, Suit.SPADES, level=2),
                 Card(CardRank.FOUR, Suit.SPADES, level=2),
                 Card(CardRank.FIVE, Suit.SPADES, level=2),
                 Card(CardRank.SIX, Suit.SPADES, level=2),
                 Card(CardRank.SEVEN, Suit.SPADES, level=2)]
    result = engine.analyze_hand(same_suit)
    print(f"   黑桃 34567 -> {result}")
    
    # 测试四大天王
    print("\n9. 测试四大天王:")
    four_kings = [Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
                  Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
                  Card(CardRank.SMALL_JOKER, Suit.JOKER, level=2),
                  Card(CardRank.SMALL_JOKER, Suit.JOKER, level=2)]
    result = engine.analyze_hand(four_kings)
    print(f"   四大天王 -> {result}")
    
    # 测试牌型比较
    print("\n10. 测试牌型比较:")
    bomb_4 = [Card(CardRank.THREE, s, level=2) for s in Suit if s != Suit.JOKER]
    straight_high = [Card(CardRank.TEN, Suit.SPADES, level=2),
                     Card(CardRank.JACK, Suit.SPADES, level=2),
                     Card(CardRank.QUEEN, Suit.SPADES, level=2),
                     Card(CardRank.KING, Suit.SPADES, level=2),
                     Card(CardRank.ACE, Suit.SPADES, level=2)]
    
    print(f"   四个 3 能打过 34567: {engine.can_beat(bomb_4, straight_high)}")
    print(f"   同花顺能打过四个 3: {engine.can_beat(straight_high, bomb_4)}")
    print(f"   六个 3 能打过同花顺：{engine.can_beat(nuclear_6, straight_high)}")
    
    print("\n=== 测试完成 ===")
