"""
掼蛋游戏 - AI 基础框架模块

本模块定义了 AI 玩家的基类，提供通用的接口和方法。
所有 AI 等级（简单、中等、困难）都继承自此基类。

核心功能：
- 统一的出牌接口
- 手牌分析工具
- 记牌器支持
- 级牌智能使用

作者：代码虾
创建日期：2026-03-20
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Tuple, Dict
from collections import Counter
import random

# 导入游戏模块
from game.cards import Card, CardRank, Suit
from game.rules import RulesEngine, CardType, HandResult


class CardMemory:
    """
    记牌器类
    
    记录已出的牌，帮助 AI 做出更智能的决策。
    
    Attributes:
        level: 当前级数
        played_cards: 已出的牌列表
        played_by_player: 按玩家记录的出牌
        rank_count: 各牌面值已出数量统计
    """
    
    def __init__(self, level: int = 2):
        """
        初始化记牌器
        
        Args:
            level: 当前级数
        """
        self.level = level
        self.played_cards: List[Card] = []
        self.played_by_player: Dict[int, List[Card]] = {}  # player_id -> cards
        self.rank_count: Dict[CardRank, int] = {}
        
        # 初始化计数器（2 副牌，每个牌面值最多 8 张，王最多 4 张）
        for rank in CardRank:
            if rank in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER]:
                self.rank_count[rank] = 0
            else:
                self.rank_count[rank] = 0
    
    def record_play(self, player_id: int, cards: List[Card]):
        """
        记录出牌
        
        Args:
            player_id: 出牌玩家 ID
            cards: 出的牌列表
        """
        # 记录到总列表
        self.played_cards.extend(cards)
        
        # 记录到玩家维度
        if player_id not in self.played_by_player:
            self.played_by_player[player_id] = []
        self.played_by_player[player_id].extend(cards)
        
        # 更新统计
        for card in cards:
            self.rank_count[card.rank] = self.rank_count.get(card.rank, 0) + 1
    
    def get_remaining_count(self, rank: CardRank) -> int:
        """
        获取某牌面值剩余数量
        
        Args:
            rank: 牌面值
            
        Returns:
            剩余数量
        """
        # 2 副牌中，普通牌每个牌面值有 8 张（4 花色 × 2 副）
        # 王每个有 2 张（2 副）
        if rank in [CardRank.BIG_JOKER, CardRank.SMALL_JOKER]:
            total = 2
        else:
            total = 8
        
        played = self.rank_count.get(rank, 0)
        return total - played
    
    def get_remaining_cards(self) -> Dict[CardRank, int]:
        """
        获取所有牌面值剩余数量
        
        Returns:
            字典 {牌面值：剩余数量}
        """
        remaining = {}
        for rank in CardRank:
            remaining[rank] = self.get_remaining_count(rank)
        return remaining
    
    def has_been_played(self, card: Card) -> bool:
        """
        判断某张牌是否已出
        
        Args:
            card: 要检查的牌
            
        Returns:
            是否已出
        """
        return card in self.played_cards
    
    def get_played_by_player(self, player_id: int) -> List[Card]:
        """
        获取某玩家已出的所有牌
        
        Args:
            player_id: 玩家 ID
            
        Returns:
            已出的牌列表
        """
        return self.played_by_player.get(player_id, []).copy()
    
    def get_key_cards_remaining(self) -> Dict[str, int]:
        """
        获取关键牌剩余数量（用于决策）
        
        关键牌包括：王、级牌、A、2
        
        Returns:
            字典 {牌名：剩余数量}
        """
        key_ranks = [
            CardRank.BIG_JOKER,
            CardRank.SMALL_JOKER,
            CardRank(self.level),  # 级牌
            CardRank.ACE,
            CardRank.TWO
        ]
        
        result = {}
        for rank in key_ranks:
            if rank.value == self.level:
                result[f"级牌 ({self.level})"] = self.get_remaining_count(rank)
            else:
                result[str(rank)] = self.get_remaining_count(rank)
        
        return result
    
    def reset(self):
        """重置记牌器"""
        self.played_cards.clear()
        self.played_by_player.clear()
        for rank in self.rank_count:
            self.rank_count[rank] = 0


class AIPlayer(ABC):
    """
    AI 玩家基类
    
    所有 AI 等级都继承自此类，实现不同的出牌策略。
    
    Attributes:
        player_id: 玩家 ID
        level: 当前级数
        rules_engine: 规则引擎
        memory: 记牌器
        difficulty: 难度等级
    """
    
    def __init__(self, player_id: int, level: int = 2, memory: Optional[CardMemory] = None):
        """
        初始化 AI 玩家
        
        Args:
            player_id: 玩家 ID
            level: 当前级数
            memory: 共享的记牌器实例
        """
        self.player_id = player_id
        self.level = level
        self.rules_engine = RulesEngine(level=level)
        self.memory = memory if memory else CardMemory(level=level)
        self.difficulty = "base"
    
    @abstractmethod
    def decide_play(self, hand: List[Card], 
                    last_played_cards: Optional[List[Card]],
                    last_played_player: Optional[int],
                    teammates_hand_count: int,
                    opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        决策出牌（抽象方法，由子类实现）
        
        Args:
            hand: 当前手牌
            last_played_cards: 上一手出的牌（None 表示可以自由出牌）
            last_played_player: 上一手出牌的玩家 ID
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数列表
            
        Returns:
            要出的牌列表，None 表示选择不出
        """
        pass
    
    def analyze_hand(self, cards: List[Card]) -> HandResult:
        """
        分析牌型
        
        Args:
            cards: 牌列表
            
        Returns:
            牌型分析结果
        """
        return self.rules_engine.analyze_hand(cards)
    
    def can_beat(self, attacking_cards: List[Card], 
                 defending_cards: List[Card]) -> bool:
        """
        判断是否能打过
        
        Args:
            attacking_cards: 攻击牌
            defending_cards: 防守牌
            
        Returns:
            是否能打败
        """
        return self.rules_engine.can_beat(attacking_cards, defending_cards)
    
    def get_valid_hands(self, cards: List[Card]) -> List[Tuple[List[Card], CardType]]:
        """
        获取手牌中所有可能的有效牌型组合
        
        Args:
            cards: 手牌列表
            
        Returns:
            列表 [(牌列表，牌型)]
        """
        valid_hands = []
        
        # 单张
        for card in cards:
            result = self.analyze_hand([card])
            if result.is_valid:
                valid_hands.append(([card], result.card_type))
        
        # 对子
        rank_groups = {}
        for card in cards:
            rank_key = (card.rank.value, card.is_level_card)
            if rank_key not in rank_groups:
                rank_groups[rank_key] = []
            rank_groups[rank_key].append(card)
        
        for rank_key, group in rank_groups.items():
            if len(group) >= 2:
                # 尝试组成对子
                for i in range(len(group)):
                    for j in range(i + 1, len(group)):
                        pair = [group[i], group[j]]
                        result = self.analyze_hand(pair)
                        if result.is_valid and result.card_type == CardType.PAIR:
                            valid_hands.append((pair, CardType.PAIR))
        
        # 三张
        for rank_key, group in rank_groups.items():
            if len(group) >= 3:
                triple = group[:3]
                result = self.analyze_hand(triple)
                if result.is_valid and result.card_type == CardType.TRIPLE:
                    valid_hands.append((triple, CardType.TRIPLE))
        
        # 炸弹（4 张及以上相同）
        for rank_key, group in rank_groups.items():
            if len(group) >= 4:
                for count in range(4, len(group) + 1):
                    bomb = group[:count]
                    result = self.analyze_hand(bomb)
                    if result.is_valid and result.card_type.is_bomb:
                        valid_hands.append((bomb, result.card_type))
        
        return valid_hands
    
    def get_beating_hands(self, hand: List[Card], 
                          target_cards: List[Card]) -> List[Tuple[List[Card], CardType]]:
        """
        获取手牌中能打过目标牌的所有牌型
        
        Args:
            hand: 手牌
            target_cards: 要打败的牌
            
        Returns:
            列表 [(牌列表，牌型)]
        """
        beating_hands = []
        valid_hands = self.get_valid_hands(hand)
        
        for cards, card_type in valid_hands:
            if self.can_beat(cards, target_cards):
                beating_hands.append((cards, card_type))
        
        return beating_hands
    
    def get_level_cards(self, hand: List[Card]) -> List[Card]:
        """
        获取手牌中的级牌
        
        Args:
            hand: 手牌
            
        Returns:
            级牌列表
        """
        return [c for c in hand if c.is_level_card]
    
    def get_normal_cards(self, hand: List[Card]) -> List[Card]:
        """
        获取手牌中的非级牌
        
        Args:
            hand: 手牌
            
        Returns:
            非级牌列表
        """
        return [c for c in hand if not c.is_level_card]
    
    def count_rank_in_hand(self, hand: List[Card], rank: CardRank) -> int:
        """
        统计手牌中某牌面值的数量
        
        Args:
            hand: 手牌
            rank: 牌面值
            
        Returns:
            数量
        """
        return sum(1 for c in hand if c.rank == rank)
    
    def get_rank_groups(self, hand: List[Card]) -> Dict[int, List[Card]]:
        """
        将手牌按牌面值分组
        
        Args:
            hand: 手牌
            
        Returns:
            字典 {牌面值：牌列表}
        """
        groups = {}
        for card in hand:
            rank_val = card.rank.value
            if rank_val not in groups:
                groups[rank_val] = []
            groups[rank_val].append(card)
        return groups
    
    def find_smallest_single(self, hand: List[Card]) -> Optional[Card]:
        """
        找到手牌中最小的单张
        
        Args:
            hand: 手牌
            
        Returns:
            最小的单张
        """
        if not hand:
            return None
        return min(hand, key=lambda c: c._compare_value())
    
    def find_largest_single(self, hand: List[Card]) -> Optional[Card]:
        """
        找到手牌中最大的单张
        
        Args:
            hand: 手牌
            
        Returns:
            最大的单张
        """
        if not hand:
            return None
        return max(hand, key=lambda c: c._compare_value())
    
    def record_play(self, player_id: int, cards: List[Card]):
        """
        记录出牌到记牌器
        
        Args:
            player_id: 出牌玩家 ID
            cards: 出的牌
        """
        if self.memory:
            self.memory.record_play(player_id, cards)
    
    def get_opponent_ids(self) -> List[int]:
        """
        获取对手的玩家 ID 列表
        
        Returns:
            对手 ID 列表
        """
        return [(self.player_id + 1) % 4, (self.player_id + 3) % 4]
    
    def get_teammate_id(self) -> int:
        """
        获取队友的玩家 ID
        
        Returns:
            队友 ID
        """
        return (self.player_id + 2) % 4
    
    def should_play_strong(self, situation: str, 
                           teammates_hand_count: int,
                           opponents_hand_counts: List[int]) -> bool:
        """
        判断是否应该出强牌
        
        Args:
            situation: 情况描述 ("opening"=先手，"following"=跟牌)
            teammates_hand_count: 队友手牌数
            opponents_hand_counts: 对手手牌数
            
        Returns:
            是否应该出强牌
        """
        # 基础策略：如果队友手牌很少，尽量让队友走
        if teammates_hand_count <= 5:
            return False  # 不要压队友
        
        # 如果对手手牌很少，要压制
        if min(opponents_hand_counts) <= 5:
            return True
        
        return False
    
    def __str__(self):
        """返回 AI 玩家的字符串表示"""
        return f"AI Player {self.player_id} ({self.difficulty})"
    
    def __repr__(self):
        """返回 AI 玩家的详细表示"""
        return f"AIPlayer(id={self.player_id}, difficulty={self.difficulty}, level={self.level})"


# 工具函数

def create_ai_player(player_id: int, difficulty: str, level: int = 2, 
                     memory: Optional[CardMemory] = None) -> AIPlayer:
    """
    工厂函数：创建指定难度的 AI 玩家
    
    Args:
        player_id: 玩家 ID
        difficulty: 难度 ("easy", "medium", "hard")
        level: 当前级数
        memory: 记牌器实例
        
    Returns:
        AI 玩家实例
    """
    # 延迟导入，避免循环依赖
    if difficulty == "easy":
        from ai.easy_ai import EasyAI
        return EasyAI(player_id, level, memory)
    elif difficulty == "medium":
        from ai.medium_ai import MediumAI
        return MediumAI(player_id, level, memory)
    elif difficulty == "hard":
        from ai.hard_ai import HardAI
        return HardAI(player_id, level, memory)
    else:
        raise ValueError(f"未知难度：{difficulty}")


# 测试代码
if __name__ == "__main__":
    print("=== AI 基础框架测试 ===\n")
    
    # 测试记牌器
    print("1. 测试记牌器:")
    memory = CardMemory(level=2)
    
    # 模拟出牌
    test_cards = [
        Card(CardRank.ACE, Suit.SPADES, level=2),
        Card(CardRank.KING, Suit.HEARTS, level=2),
        Card(CardRank.TWO, Suit.CLUBS, level=2),  # 级牌
    ]
    memory.record_play(0, test_cards)
    
    print(f"   已出牌数：{len(memory.played_cards)}")
    print(f"   A 剩余：{memory.get_remaining_count(CardRank.ACE)} 张")
    print(f"   级牌剩余：{memory.get_remaining_count(CardRank(self.level))} 张")
    print(f"   关键牌剩余：{memory.get_key_cards_remaining()}")
    
    # 测试 AI 基类（抽象类不能直接实例化，这里仅测试工具函数）
    print("\n2. 测试工具函数:")
    from game.cards import create_standard_deck
    deck = create_standard_deck(level=2)
    test_hand = deck[:27]
    
    # 创建一个临时测试类
    class TestAI(AIPlayer):
        def __init__(self, player_id, level=2, memory=None):
            super().__init__(player_id, level, memory)
            self.difficulty = "test"
        
        def decide_play(self, hand, last_played_cards, last_played_player,
                       teammates_hand_count, opponents_hand_counts):
            return None
    
    test_ai = TestAI(player_id=0, level=2)
    
    # 测试手牌分析
    print(f"   手牌数：{len(test_hand)}")
    print(f"   级牌数：{len(test_ai.get_level_cards(test_hand))}")
    print(f"   按牌面值分组数：{len(test_ai.get_rank_groups(test_hand))}")
    
    # 测试最小/最大牌查找
    smallest = test_ai.find_smallest_single(test_hand)
    largest = test_ai.find_largest_single(test_hand)
    print(f"   最小牌：{smallest}")
    print(f"   最大牌：{largest}")
    
    # 测试队伍关系
    print(f"\n3. 测试队伍关系:")
    print(f"   AI 玩家 0 的队友：玩家{test_ai.get_teammate_id()}")
    print(f"   AI 玩家 0 的对手：玩家{test_ai.get_opponent_ids()}")
    
    print("\n=== 测试完成 ===")
