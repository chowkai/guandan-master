"""
掼蛋游戏 - 简单 AI（随机出牌）

本模块实现了简单难度的 AI，采用随机出牌策略。

特点：
- 随机选择有效牌型出牌
- 能过则过（不主动压牌）
- 适合新手练习

作者：代码虾
创建日期：2026-03-20
"""

import random
from typing import List, Optional, Tuple

from game.cards import Card, CardRank
from game.rules import CardType, HandResult
from ai.ai_base import AIPlayer, CardMemory


class EasyAI(AIPlayer):
    """
    简单 AI - 随机出牌策略
    
    行为特点：
    1. 如果可以自由出牌，随机出一张牌或最小的牌
    2. 如果需要跟牌，随机选择一个能打过的牌型
    3. 如果打不过，选择不出
    4. 不会主动使用炸弹
    5. 不会智能使用级牌
    """
    
    def __init__(self, player_id: int, level: int = 2, memory: Optional[CardMemory] = None):
        """
        初始化简单 AI
        
        Args:
            player_id: 玩家 ID
            level: 当前级数
            memory: 记牌器实例
        """
        super().__init__(player_id, level, memory)
        self.difficulty = "easy"
    
    def decide_play(self, hand: List[Card], 
                    last_played_cards: Optional[List[Card]],
                    last_played_player: Optional[int],
                    teammates_hand_count: int,
                    opponents_hand_counts: List[int]) -> Optional[List[Card]]:
        """
        决策出牌
        
        简单 AI 策略：
        - 自由出牌：随机出一张牌
        - 跟牌：随机选择一个能打过的牌型，或不出
        
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
        
        # 如果是自由出牌（上一手是自己出的，或一轮开始）
        if last_played_cards is None or last_played_player == self.player_id:
            return self._free_play(hand)
        
        # 如果需要跟牌
        else:
            return self._follow_play(hand, last_played_cards, last_played_player)
    
    def _free_play(self, hand: List[Card]) -> List[Card]:
        """
        自由出牌策略
        
        策略：随机出一张牌，优先出最小的单张
        
        Args:
            hand: 手牌
            
        Returns:
            要出的牌
        """
        # 80% 概率出最小的单张（简化策略）
        if random.random() < 0.8:
            smallest = self.find_smallest_single(hand)
            if smallest:
                return [smallest]
        
        # 20% 概率随机出牌
        # 尝试找一些简单的牌型
        valid_hands = self.get_valid_hands(hand)
        
        if valid_hands:
            # 过滤掉炸弹（简单 AI 不太会主动用炸弹）
            non_bomb_hands = [
                (cards, card_type) 
                for cards, card_type in valid_hands 
                if not card_type.is_bomb
            ]
            
            if non_bomb_hands:
                # 选择牌数最少的牌型（优先出单张、对子）
                non_bomb_hands.sort(key=lambda x: len(x[0]))
                chosen = random.choice(non_bomb_hands[:5])  # 从前 5 个最小的中选
                return chosen[0]
        
        # 如果找不到，就随机出一张
        return [random.choice(hand)]
    
    def _follow_play(self, hand: List[Card], 
                     last_played_cards: List[Card],
                     last_played_player: int) -> Optional[List[Card]]:
        """
        跟牌策略
        
        策略：
        - 50% 概率尝试跟牌
        - 如果能打过，随机选择一个能打过的牌型
        - 如果打不过，选择不出
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            last_played_player: 上一手出牌玩家 ID
            
        Returns:
            要出的牌，None 表示不出
        """
        # 50% 概率选择不出（简单 AI 比较随意）
        if random.random() < 0.5:
            return None
        
        # 获取能打过的牌型
        beating_hands = self.get_beating_hands(hand, last_played_cards)
        
        if not beating_hands:
            # 打不过，不出
            return None
        
        # 过滤掉炸弹（简单 AI 不太会用炸弹压牌）
        non_bomb_hands = [
            (cards, card_type)
            for cards, card_type in beating_hands
            if not card_type.is_bomb
        ]
        
        if non_bomb_hands:
            # 随机选择一个
            chosen = random.choice(non_bomb_hands)
            return chosen[0]
        else:
            # 只有炸弹，简单 AI 一般不会用
            return None
    
    def should_use_bomb(self, hand: List[Card], 
                        last_played_cards: List[Card],
                        situation: str) -> bool:
        """
        判断是否使用炸弹
        
        简单 AI：几乎不使用炸弹
        
        Args:
            hand: 手牌
            last_played_cards: 上一手牌
            situation: 情况 ("opening", "following")
            
        Returns:
            是否使用炸弹
        """
        # 简单 AI 只有 5% 概率用炸弹
        return random.random() < 0.05
    
    def __str__(self):
        """返回 AI 的字符串表示"""
        return f"简单 AI (玩家{self.player_id})"
    
    def __repr__(self):
        """返回 AI 的详细表示"""
        return f"EasyAI(id={self.player_id}, level={self.level})"


# 测试代码
if __name__ == "__main__":
    print("=== 简单 AI 测试 ===\n")
    
    from game.cards import create_standard_deck
    from game.rules import RulesEngine
    
    # 创建测试手牌
    deck = create_standard_deck(level=2)
    random.shuffle(deck)
    test_hand = deck[:27]
    
    # 创建 AI
    ai = EasyAI(player_id=0, level=2)
    
    print(f"AI: {ai}")
    print(f"手牌数：{len(test_hand)}\n")
    
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
    
    # 测试跟牌
    print("\n2. 测试跟牌:")
    last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
    for i in range(3):
        choice = ai.decide_play(
            hand=test_hand,
            last_played_cards=last_cards,
            last_played_player=1,
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        if choice:
            result = ai.analyze_hand(choice)
            print(f"   第{i+1}次：{choice} ({result.card_type.display_name})")
        else:
            print(f"   第{i+1}次：不出")
    
    # 测试炸弹使用
    print("\n3. 测试炸弹使用概率:")
    bomb_count = 0
    for _ in range(100):
        if ai.should_use_bomb(test_hand, last_cards, "following"):
            bomb_count += 1
    print(f"   100 次中有 {bomb_count} 次使用炸弹 ({bomb_count}%)")
    
    print("\n=== 测试完成 ===")
