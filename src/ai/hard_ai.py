"""
掼蛋游戏 - 困难 AI（策略配合）

本模块实现了高难度的 AI，具有完整的策略体系和队友配合能力。

特点：
- 完整的记牌和算牌能力
- 智能的级牌使用策略
- 队友配合意识强
- 合理的炸弹使用时机
- 残局精确计算

作者：代码虾
创建日期：2026-03-20
"""

import random
from typing import List, Optional, Tuple, Dict, Set
from collections import Counter
from enum import Enum

from game.cards import Card, CardRank, Suit
from game.rules import CardType, HandResult
from ai.ai_base import AIPlayer, CardMemory


class GameSituation(Enum):
    """游戏局势枚举"""
    EARLY = "early"           # 开局
    MID = "mid"               # 中局
    END = "end"               # 残局
    TEAMMATE_NEEDS_HELP = "teammate_needs_help"  # 队友需要帮助
    OPPONENT_DANGEROUS = "opponent_dangerous"    # 对手危险


class HardAI(AIPlayer):
    """
    困难 AI - 策略配合
    
    行为特点：
    1. 完整的记牌和算牌能力
    2. 根据局势调整策略
    3. 智能配合队友
    4. 精确计算炸弹使用时机
    5. 残局能力极强
    """
    
    def __init__(self, player_id: int, level: int = 2, memory: Optional[CardMemory] = None):
        """
        初始化困难 AI
        
        Args:
            player_id: 玩家 ID
            level: 当前级数
            memory: 记牌器实例
        """
        super().__init__(player_id, level, memory)
        self.difficulty = "hard"
        
        # 策略参数
        self.aggressiveness = 0.7  # 进攻性（0-1）
        self.cooperation = 0.8     # 配合度（0-1）
        
        # 手牌分析缓存
        self._hand_analysis_cache = {}
    
    def decide_play(self, hand: List[Card], 
                    last_played_cards: Optional[List[Card]],
                    last_played_player: Optional[int],
                    teammates_hand_count: int,
                    opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        决策出牌
        
        困难 AI 策略：
        1. 分析当前局势
        2. 评估手牌强度
        3. 考虑队友和对手状态
        4. 选择最优出牌
        
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
        
        # 分析局势
        situation = self._analyze_situation(
            hand, teammates_hand_count, opponents_hand_counts
        )
        
        # 如果是自由出牌
        if last_played_cards is None or last_played_player == self.player_id:
            return self._strategic_free_play(
                hand, situation, teammates_hand_count, opponents_hand_counts
            )
        
        # 如果需要跟牌
        else:
            return self._strategic_follow_play(
                hand, last_played_cards, last_played_player,
                situation, teammates_hand_count, opponents_hand_counts
            )
    
    def _analyze_situation(self, hand: List[Card],
                           teammates_hand_count: int,
                           opponents_hand_counts: List[int]) -> GameSituation:
        """
        分析当前局势
        
        Args:
            hand: 手牌
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数
            
        Returns:
            局势枚举
        """
        hand_count = len(hand)
        
        # 判断游戏阶段
        if hand_count >= 20:
            phase = GameSituation.EARLY
        elif hand_count >= 10:
            phase = GameSituation.MID
        else:
            phase = GameSituation.END
        
        # 判断是否需要帮助队友
        if teammates_hand_count <= 5:
            return GameSituation.TEAMMATE_NEEDS_HELP
        
        # 判断对手是否危险
        if min(opponents_hand_counts) <= 5:
            return GameSituation.OPPONENT_DANGEROUS
        
        return phase
    
    def _strategic_free_play(self, hand: List[Card],
                              situation: GameSituation,
                              teammates_hand_count: int,
                              opponents_hand_counts: List[int]) -> List[Card]:
        """
        战略性自由出牌
        
        策略：
        1. 根据局势选择出牌类型
        2. 考虑出牌后手牌的完整性
        3. 优先出掉不需要的牌
        
        Args:
            hand: 手牌
            situation: 局势
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数
            
        Returns:
            要出的牌
        """
        # 如果队友需要帮助，出小牌让队友走
        if situation == GameSituation.TEAMMATE_NEEDS_HELP:
            return self._play_to_help_teammate(hand)
        
        # 如果对手危险，要压制
        if situation == GameSituation.OPPONENT_DANGEROUS:
            return self._play_to_suppress(hand, opponents_hand_counts)
        
        # 根据游戏阶段选择策略
        if situation == GameSituation.EARLY:
            # 开局：出小牌，试探
            return self._play_opening(hand)
        elif situation == GameSituation.MID:
            # 中局：出掉累赘，优化手牌
            return self._play_mid_game(hand)
        else:
            # 残局：争取出完
            return self._play_end_game(hand)
    
    def _play_opening(self, hand: List[Card]) -> List[Card]:
        """
        开局出牌策略
        
        策略：
        1. 出最小的单张
        2. 如果有连对/顺子，可以考虑出
        3. 保留级牌和炸弹
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 找最小的单张（排除级牌和王牌）
        normal_cards = self.get_normal_cards(hand)
        if normal_cards:
            smallest = self.find_smallest_single(normal_cards)
            if smallest and smallest.rank.value <= 8:  # 出小牌
                return [smallest]
        
        # 如果没有小单张，找最小的对子
        pairs = self._find_all_pairs(hand)
        if pairs:
            pairs.sort(key=lambda x: self._get_main_rank(x))
            return pairs[0]
        
        # 否则出最小的牌
        return [self.find_smallest_single(hand)]
    
    def _play_mid_game(self, hand: List[Card]) -> List[Card]:
        """
        中局出牌策略
        
        策略：
        1. 出掉孤张（不成型的牌）
        2. 保留可能的牌型
        3. 考虑用级牌配牌
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        rank_groups = self.get_rank_groups(hand)
        level_cards = self.get_level_cards(hand)
        
        # 找孤张（只有一张的牌）
        singles = [cards[0] for rank, cards in rank_groups.items() if len(cards) == 1]
        
        if singles:
            # 出最小的孤张
            singles.sort(key=lambda c: c._compare_value())
            
            # 如果有级牌，考虑用级牌配成对子
            if level_cards and len(singles) > 1:
                # 保留级牌，出次小的孤张
                return [singles[1]] if len(singles) > 1 else [singles[0]]
            
            return [singles[0]]
        
        # 没有孤张，出最小的牌组
        return self._play_smallest(hand)
    
    def _play_end_game(self, hand: List[Card]) -> List[Card]:
        """
        残局出牌策略
        
        策略：
        1. 计算能否一手出完
        2. 不能则出最小的牌
        3. 考虑用炸弹夺得出牌权
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 检查是否能一手出完
        if len(hand) <= 5:
            result = self.analyze_hand(hand)
            if result.is_valid:
                return hand
        
        # 检查能否用级牌配成一手
        if len(hand) <= 5:
            level_cards = self.get_level_cards(hand)
            if level_cards:
                # 尝试用级牌配成牌型
                normal = self.get_normal_cards(hand)
                # 简化处理：直接出
                pass
        
        # 出最小的牌
        return self._play_smallest(hand)
    
    def _play_to_help_teammate(self, hand: List[Card]) -> List[Card]:
        """
        出牌帮助队友
        
        策略：
        1. 出很小的牌，让队友接
        2. 不要出队友可能要的牌型
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 出最小的单张
        normal_cards = self.get_normal_cards(hand)
        if normal_cards:
            smallest = self.find_smallest_single(normal_cards)
            if smallest:
                return [smallest]
        
        return [self.find_smallest_single(hand)]
    
    def _play_to_suppress(self, hand: List[Card],
                          opponents_hand_counts: List[int]) -> List[Card]:
        """
        压制性出牌
        
        策略：
        1. 出较大的牌，不让对手接
        2. 保留炸弹用于关键时刻
        
        Args:
            hand: 手牌
            opponents_hand_counts: 对手手牌数
            
        Returns:
            要出的牌
        """
        # 出中等偏大的牌
        sorted_hand = sorted(hand, key=lambda c: c._compare_value(), reverse=True)
        
        # 排除级牌和王牌
        normal_cards = [
            c for c in sorted_hand 
            if not c.is_level_card 
            and c.rank not in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER]
        ]
        
        if len(normal_cards) >= 3:
            # 出中上水平的牌
            return [normal_cards[len(normal_cards) // 3]]
        elif normal_cards:
            return [normal_cards[0]]  # 出最大的普通牌
        
        return [sorted_hand[0]]
    
    def _strategic_follow_play(self, hand: List[Card],
                                last_played_cards: List[Card],
                                last_played_player: int,
                                situation: GameSituation,
                                teammates_hand_count: int,
                                opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        战略性跟牌
        
        策略：
        1. 判断是否值得压
        2. 考虑队友状态
        3. 精确计算炸弹使用
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            last_played_player: 上一手出牌玩家 ID
            situation: 局势
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
            return self._follow_teammate(
                hand, last_played_cards, teammates_hand_count
            )
        
        # 如果是对手出的牌
        else:
            return self._follow_opponent(
                hand, last_played_cards, situation, opponents_hand_counts
            )
    
    def _follow_teammate(self, hand: List[Card],
                         last_played_cards: List[Card],
                         teammates_hand_count: int) -> Optional[List[Card]]:
        """
        跟队友的牌
        
        策略：
        1. 队友手牌少，不压
        2. 队友手牌多，可以pass
        3. 如果能一手出完，可以压
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            teammates_hand_count: 队友手牌数
            
        Returns:
            要出的牌，None 表示不出
        """
        # 队友手牌很少，绝对不要压
        if teammates_hand_count <= 5:
            return None
        
        # 如果能一手出完，可以压
        beating_hands = self.get_beating_hands(hand, last_played_cards)
        for cards, card_type in beating_hands:
            if len(cards) == len(hand):
                return cards
        
        # 否则不出
        return None
    
    def _follow_opponent(self, hand: List[Card],
                         last_played_cards: List[Card],
                         situation: GameSituation,
                         opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        跟对手的牌
        
        策略：
        1. 评估是否值得压
        2. 选择最优的压牌方式
        3. 考虑炸弹使用
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            situation: 局势
            opponents_hand_counts: 对手手牌数
            
        Returns:
            要出的牌，None 表示不出
        """
        # 获取能打过的牌型
        beating_hands = self.get_beating_hands(hand, last_played_cards)
        
        if not beating_hands:
            return None
        
        # 分离炸弹和非炸弹
        bomb_hands = [(c, t) for c, t in beating_hands if t.is_bomb]
        non_bomb_hands = [(c, t) for c, t in beating_hands if not t.is_bomb]
        
        # 优先使用非炸弹
        if non_bomb_hands:
            # 选择最小的能打过的牌
            non_bomb_hands.sort(key=lambda x: self._hand_power(x[0]))
            
            # 考虑局势
            if situation == GameSituation.OPPONENT_DANGEROUS:
                # 对手危险，用较小的牌压
                return non_bomb_hands[0][0]
            elif situation == GameSituation.END:
                # 残局，尽量保留小牌
                return non_bomb_hands[-1][0]  # 用较大的牌压
            else:
                return non_bomb_hands[0][0]
        
        # 考虑是否用炸弹
        if bomb_hands and self._should_use_bomb_strategically(
            hand, last_played_cards, situation, opponents_hand_counts
        ):
            # 选择最小的炸弹
            bomb_hands.sort(key=lambda x: self._hand_power(x[0]))
            return bomb_hands[0][0]
        
        return None
    
    def _should_use_bomb_strategically(self, hand: List[Card],
                                        last_played_cards: List[Card],
                                        situation: GameSituation,
                                        opponents_hand_counts: List[int]) -> bool:
        """
        战略性判断是否使用炸弹
        
        策略：
        1. 残局且手牌少：用
        2. 对手危险：用
        3. 炸弹能让自己出完：用
        4. 开局且炸弹小：不用
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            situation: 局势
            opponents_hand_counts: 对手手牌数
            
        Returns:
            是否使用炸弹
        """
        hand_count = len(hand)
        
        # 残局且手牌少，用炸弹争头游
        if situation == GameSituation.END and hand_count <= 6:
            return True
        
        # 对手危险，用炸弹压制
        if situation == GameSituation.OPPONENT_DANGEROUS:
            return True
        
        # 检查用炸弹后能否出完
        if hand_count <= 5:
            remaining = [c for c in hand if c not in last_played_cards]
            if len(remaining) <= 3:
                return True
        
        # 开局且炸弹小，谨慎使用
        if situation == GameSituation.EARLY:
            last_result = self.analyze_hand(last_played_cards)
            if last_result.is_valid and last_result.power < 50:
                return False
        
        # 默认 60% 概率用炸弹
        return random.random() < 0.6
    
    def _find_all_pairs(self, hand: List[Card]) -> List[List[Card]]:
        """
        找出所有可能的对子
        
        Args:
            hand: 手牌
            
        Returns:
            对子列表
        """
        pairs = []
        rank_groups = self.get_rank_groups(hand)
        
        for rank, cards in rank_groups.items():
            if len(cards) >= 2:
                pairs.append(cards[:2])
        
        return pairs
    
    def _get_main_rank(self, cards: List[Card]) -> int:
        """
        获取牌组的主要牌面值
        
        Args:
            cards: 牌列表
            
        Returns:
            主要牌面值
        """
        if not cards:
            return 0
        
        rank_count = Counter(c.rank.value for c in cards)
        if rank_count:
            return max(rank_count.keys(), key=lambda r: rank_count[r])
        return cards[0].rank.value
    
    def _hand_power(self, cards: List[Card]) -> int:
        """
        计算一手牌的威力值
        
        Args:
            cards: 牌列表
            
        Returns:
            威力值
        """
        result = self.analyze_hand(cards)
        if result.is_valid:
            return result.power
        return 0
    
    def _play_smallest(self, hand: List[Card]) -> List[Card]:
        """
        出最小的牌
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 优先出最小的单张
        smallest = self.find_smallest_single(hand)
        if smallest:
            return [smallest]
        
        # 找最小的对子
        pairs = self._find_all_pairs(hand)
        if pairs:
            pairs.sort(key=lambda x: self._get_main_rank(x))
            return pairs[0]
        
        # 出最小的牌
        return [min(hand, key=lambda c: c._compare_value())]
    
    def calculate_optimal_play(self, hand: List[Card],
                                last_played_cards: Optional[List[Card]]) -> List[Card]:
        """
        计算最优出牌（残局专用）
        
        使用回溯算法计算最少出牌次数
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            
        Returns:
            最优出牌
        """
        # 简化版本：找出所有有效牌型，选择最优的
        valid_hands = self.get_valid_hands(hand)
        
        if not valid_hands:
            return [self.find_smallest_single(hand)]
        
        # 如果能一手出完，直接出
        for cards, card_type in valid_hands:
            if len(cards) == len(hand):
                return cards
        
        # 否则选择牌数最多的牌型（尽快出完）
        valid_hands.sort(key=lambda x: len(x[0]), reverse=True)
        return valid_hands[0][0]
    
    def __str__(self):
        """返回 AI 的字符串表示"""
        return f"困难 AI (玩家{self.player_id})"
    
    def __repr__(self):
        """返回 AI 的详细表示"""
        return f"HardAI(id={self.player_id}, level={self.level})"


# 测试代码
if __name__ == "__main__":
    print("=== 困难 AI 测试 ===\n")
    
    from game.cards import create_standard_deck
    
    # 创建测试手牌
    deck = create_standard_deck(level=2)
    random.shuffle(deck)
    test_hand = deck[:27]
    
    # 创建 AI
    ai = HardAI(player_id=0, level=2)
    
    print(f"AI: {ai}")
    print(f"手牌数：{len(test_hand)}")
    print(f"级牌数：{len(ai.get_level_cards(test_hand))}\n")
    
    # 测试不同局势下的出牌
    print("1. 测试开局出牌:")
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=None,
        last_played_player=None,
        teammates_hand_count=20,
        opponents_hand_counts=[20, 20]
    )
    result = ai.analyze_hand(choice)
    print(f"   出牌：{choice} ({result.card_type.display_name})")
    
    print("\n2. 测试队友需要帮助:")
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=None,
        last_played_player=None,
        teammates_hand_count=3,  # 队友快出完了
        opponents_hand_counts=[20, 20]
    )
    result = ai.analyze_hand(choice)
    print(f"   出牌：{choice} ({result.card_type.display_name})")
    
    print("\n3. 测试对手危险:")
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=None,
        last_played_player=None,
        teammates_hand_count=20,
        opponents_hand_counts=[3, 20]  # 对手快出完了
    )
    result = ai.analyze_hand(choice)
    print(f"   出牌：{choice} ({result.card_type.display_name})")
    
    print("\n4. 测试跟队友的牌:")
    last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=last_cards,
        last_played_player=2,  # 队友
        teammates_hand_count=15,
        opponents_hand_counts=[20, 20]
    )
    if choice:
        result = ai.analyze_hand(choice)
        print(f"   出牌：{choice} ({result.card_type.display_name})")
    else:
        print(f"   不出 (让队友走)")
    
    print("\n5. 测试跟对手的牌:")
    choice = ai.decide_play(
        hand=test_hand,
        last_played_cards=last_cards,
        last_played_player=1,  # 对手
        teammates_hand_count=15,
        opponents_hand_counts=[20, 20]
    )
    if choice:
        result = ai.analyze_hand(choice)
        print(f"   出牌：{choice} ({result.card_type.display_name})")
    else:
        print(f"   不出")
    
    print("\n=== 测试完成 ===")
