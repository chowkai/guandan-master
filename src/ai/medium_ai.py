"""
掼蛋游戏 - 中等 AI（规则判断）

本模块实现了中等难度的 AI，基于规则进行出牌决策。

特点：
- 能识别牌型大小
- 会合理使用级牌
- 懂得基本的压制和放牌
- 会根据情况使用炸弹

作者：代码虾
创建日期：2026-03-20
"""

import random
from typing import List, Optional, Tuple, Dict
from collections import Counter

from game.cards import Card, CardRank, Suit
from game.rules import CardType, HandResult
from ai.ai_base import AIPlayer, CardMemory


class MediumAI(AIPlayer):
    """
    中等 AI - 规则判断策略
    
    行为特点：
    1. 优先出小牌，保留大牌
    2. 会判断是否能打过，不会盲目跟牌
    3. 智能使用级牌（逢人配）
    4. 根据手牌情况决定是否用炸弹
    5. 考虑队友和对手的手牌数
    """
    
    def __init__(self, player_id: int, level: int = 2, memory: Optional[CardMemory] = None):
        """
        初始化中等 AI
        
        Args:
            player_id: 玩家 ID
            level: 当前级数
            memory: 记牌器实例
        """
        super().__init__(player_id, level, memory)
        self.difficulty = "medium"
        
        # 配置参数
        self.bomb_threshold = 6  # 手牌数<=6 时更可能用炸弹
        self.save_big_cards = True  # 是否保留大牌
    
    def decide_play(self, hand: List[Card], 
                    last_played_cards: Optional[List[Card]],
                    last_played_player: Optional[int],
                    teammates_hand_count: int,
                    opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        决策出牌
        
        中等 AI 策略：
        - 分析局势，选择合适的牌型
        - 优先出小牌，保留控制牌
        - 智能使用级牌配牌
        
        Args:
            hand: 当前手牌
            last_played_cards: 上一手出的牌
            last_played_player: 上一手出牌的玩家 ID
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数列表
            
        Returns:
            要出的牌列表，None 表示不出
        """
        if not hand:
            return None
        
        # 如果是自由出牌
        if last_played_cards is None or last_played_player == self.player_id:
            return self._free_play(hand, teammates_hand_count, opponents_hand_counts)
        
        # 如果需要跟牌
        else:
            return self._follow_play(
                hand, last_played_cards, last_played_player,
                teammates_hand_count, opponents_hand_counts
            )
    
    def _free_play(self, hand: List[Card],
                   teammates_hand_count: int,
                   opponents_hand_counts: List[int]) -> List[Card]:
        """
        自由出牌策略
        
        策略：
        1. 如果队友手牌很少，出小牌让队友走
        2. 如果对手手牌很少，出大牌压制
        3. 否则出最小的单张或对子
        
        Args:
            hand: 手牌
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数
            
        Returns:
            要出的牌
        """
        # 如果队友快出完了，出小牌让队友走
        if teammates_hand_count <= 3:
            return self._play_smallest(hand)
        
        # 如果有对手快出完了，要压制
        if min(opponents_hand_counts) <= 3:
            return self._play_strong(hand)
        
        # 正常情况：出最小的牌
        return self._play_smallest(hand)
    
    def _play_smallest(self, hand: List[Card]) -> List[Card]:
        """
        出最小的牌
        
        策略：
        1. 优先出最小的单张
        2. 如果没有单张，出最小的对子
        3. 保留级牌和王牌
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 分离级牌和普通牌
        level_cards = self.get_level_cards(hand)
        normal_cards = self.get_normal_cards(hand)
        
        if not normal_cards:
            # 只有级牌，出最小的级牌
            if level_cards:
                smallest_level = min(level_cards, key=lambda c: c._compare_value())
                return [smallest_level]
            return [hand[0]]
        
        # 找最小的单张
        smallest = self.find_smallest_single(normal_cards)
        if smallest:
            return [smallest]
        
        # 找最小的对子
        rank_groups = self.get_rank_groups(normal_cards)
        pairs = []
        for rank, cards in rank_groups.items():
            if len(cards) >= 2:
                pairs.append((rank, cards[:2]))
        
        if pairs:
            # 选择最小的对子
            pairs.sort(key=lambda x: x[0])
            return pairs[0][1]
        
        # 如果都没有，出最小的普通牌
        return [smallest]
    
    def _play_strong(self, hand: List[Card]) -> List[Card]:
        """
        出较强的牌（用于压制）
        
        策略：
        1. 出中等大小的牌（不是最大的）
        2. 保留王牌和炸弹
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 找中等大小的单张
        sorted_hand = sorted(hand, key=lambda c: c._compare_value())
        
        # 排除级牌和王牌
        normal_cards = [c for c in sorted_hand if not c.is_level_card 
                       and c.rank not in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER]]
        
        if len(normal_cards) >= 3:
            # 出中间大小的牌
            mid_index = len(normal_cards) // 2
            return [normal_cards[mid_index]]
        elif normal_cards:
            return [normal_cards[-1]]  # 出最大的普通牌
        else:
            # 只有级牌和王牌，出最小的级牌
            level_cards = self.get_level_cards(hand)
            if level_cards:
                return [min(level_cards, key=lambda c: c._compare_value())]
            return [sorted_hand[0]]
    
    def _follow_play(self, hand: List[Card],
                     last_played_cards: List[Card],
                     last_played_player: int,
                     teammates_hand_count: int,
                     opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        跟牌策略
        
        策略：
        1. 如果是队友出的牌，一般不压（除非能一手出完）
        2. 如果是对手出的牌，根据情况决定是否压
        3. 优先用小牌压，保留大牌
        4. 考虑是否使用炸弹
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            last_played_player: 上一手出牌玩家 ID
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数
            
        Returns:
            要出的牌，None 表示不出
        """
        # 判断上一手是队友还是对手
        teammate_id = self.get_teammate_id()
        is_teammate = (last_played_player == teammate_id)
        
        # 如果是队友出的牌
        if is_teammate:
            # 队友手牌很少，不要压
            if teammates_hand_count <= 3:
                return None
            
            # 如果能一手出完，可以压
            beating_hands = self.get_beating_hands(hand, last_played_cards)
            for cards, card_type in beating_hands:
                if len(cards) == len(hand):
                    return cards
            
            # 否则不出
            return None
        
        # 如果是对手出的牌
        else:
            # 获取能打过的牌型
            beating_hands = self.get_beating_hands(hand, last_played_cards)
            
            if not beating_hands:
                # 打不过，不出
                return None
            
            # 过滤炸弹和非炸弹
            bomb_hands = [(c, t) for c, t in beating_hands if t.is_bomb]
            non_bomb_hands = [(c, t) for c, t in beating_hands if not t.is_bomb]
            
            # 优先使用非炸弹
            if non_bomb_hands:
                # 选择最小的能打过的牌
                non_bomb_hands.sort(key=lambda x: self._hand_power(x[0]))
                return non_bomb_hands[0][0]
            
            # 考虑是否用炸弹
            if bomb_hands and self._should_use_bomb(hand, last_played_cards, opponents_hand_counts):
                # 选择最小的炸弹
                bomb_hands.sort(key=lambda x: self._hand_power(x[0]))
                return bomb_hands[0][0]
            
            return None
    
    def _hand_power(self, cards: List[Card]) -> int:
        """
        计算一手牌的威力值（越小越弱）
        
        Args:
            cards: 牌列表
            
        Returns:
            威力值
        """
        if not cards:
            return 0
        
        result = self.analyze_hand(cards)
        if result.is_valid:
            return result.power
        return 0
    
    def _should_use_bomb(self, hand: List[Card],
                         last_played_cards: List[Card],
                         opponents_hand_counts: List[int]) -> bool:
        """
        判断是否应该使用炸弹
        
        策略：
        1. 手牌很少时（<=6 张），更可能用炸弹
        2. 对手快出完时，更可能用炸弹
        3. 炸弹较大时，更可能用
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            opponents_hand_counts: 对手手牌数
            
        Returns:
            是否使用炸弹
        """
        # 手牌很少，可以用炸弹争头游
        if len(hand) <= self.bomb_threshold:
            return True
        
        # 对手快出完了，要用炸弹压制
        if min(opponents_hand_counts) <= 4:
            return True
        
        # 分析炸弹大小
        last_result = self.analyze_hand(last_played_cards)
        if last_result.is_valid and last_result.card_type.is_bomb:
            # 对手出的是炸弹，考虑是否用更大的炸弹
            # 中等 AI 有 50% 概率跟炸弹
            return random.random() < 0.5
        
        # 对手出的不是炸弹，中等 AI 一般不会主动用炸弹
        return random.random() < 0.2
    
    def _smart_use_level_card(self, hand: List[Card], 
                               target_type: CardType) -> Optional[List[Card]]:
        """
        智能使用级牌配牌
        
        策略：
        1. 用级牌填补牌型空缺
        2. 优先用级牌组成大牌的牌型
        3. 保留级牌用于关键时候
        
        Args:
            hand: 手牌
            target_type: 目标牌型
            
        Returns:
            配好的牌
        """
        level_cards = self.get_level_cards(hand)
        normal_cards = self.get_normal_cards(hand)
        
        if not level_cards:
            return None
        
        # 统计普通牌的牌面值
        rank_groups = self.get_rank_groups(normal_cards)
        
        # 尝试用级牌配成目标牌型
        if target_type == CardType.PAIR:
            # 找只有一张的牌，用级牌配成对子
            for rank, cards in rank_groups.items():
                if len(cards) == 1 and level_cards:
                    return cards + [level_cards[0]]
        
        elif target_type == CardType.TRIPLE:
            # 找有两张的牌，用级牌配成三张
            for rank, cards in rank_groups.items():
                if len(cards) == 2 and len(level_cards) >= 1:
                    return cards + [level_cards[0]]
                elif len(cards) == 1 and len(level_cards) >= 2:
                    return cards + level_cards[:2]
        
        elif target_type == CardType.BOMB_4:
            # 找有三张的牌，用级牌配成炸弹
            for rank, cards in rank_groups.items():
                if len(cards) == 3 and len(level_cards) >= 1:
                    return cards + [level_cards[0]]
        
        return None
    
    def __str__(self):
        """返回 AI 的字符串表示"""
        return f"中等 AI (玩家{self.player_id})"
    
    def __repr__(self):
        """返回 AI 的详细表示"""
        return f"MediumAI(id={self.player_id}, level={self.level})"


# 测试代码
if __name__ == "__main__":
    print("=== 中等 AI 测试 ===\n")
    
    from game.cards import create_standard_deck
    
    # 创建测试手牌
    deck = create_standard_deck(level=2)
    random.shuffle(deck)
    test_hand = deck[:27]
    
    # 创建 AI
    ai = MediumAI(player_id=0, level=2)
    
    print(f"AI: {ai}")
    print(f"手牌数：{len(test_hand)}")
    print(f"级牌数：{len(ai.get_level_cards(test_hand))}\n")
    
    # 测试自由出牌
    print("1. 测试自由出牌:")
    for i in range(3):
        choice = ai.decide_play(
            hand=test_hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        result = ai.analyze_hand(choice)
        print(f"   第{i+1}次：{choice} ({result.card_type.display_name})")
    
    # 测试跟牌（对手出牌）
    print("\n2. 测试跟牌（对手）:")
    last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
    for i in range(3):
        choice = ai.decide_play(
            hand=test_hand,
            last_played_cards=last_cards,
            last_played_player=1,  # 对手
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        if choice:
            result = ai.analyze_hand(choice)
            print(f"   第{i+1}次：{choice} ({result.card_type.display_name})")
        else:
            print(f"   第{i+1}次：不出")
    
    # 测试跟牌（队友出牌）
    print("\n3. 测试跟牌（队友）:")
    for i in range(3):
        choice = ai.decide_play(
            hand=test_hand,
            last_played_cards=last_cards,
            last_played_player=2,  # 队友
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        if choice:
            result = ai.analyze_hand(choice)
            print(f"   第{i+1}次：{choice} ({result.card_type.display_name})")
        else:
            print(f"   第{i+1}次：不出 (让队友走)")
    
    # 测试压制情况
    print("\n4. 测试压制（对手快出完）:")
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=None,
        last_played_player=None,
        teammates_hand_count=20,
        opponents_hand_counts=[3, 20]  # 一个对手只剩 3 张
    )
    result = ai.analyze_hand(choice)
    print(f"   出牌：{choice} ({result.card_type.display_name})")
    
    print("\n=== 测试完成 ===")
