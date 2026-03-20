"""
掼蛋游戏 - 牌堆类模块

本模块定义了牌堆类，支持洗牌、发牌、剩余牌数查询等功能。
掼蛋使用 2 副牌，共 108 张牌，4 名玩家每人 27 张。

作者：代码虾
创建日期：2026-03-20
"""

import random
from typing import List, Optional
from .cards import Card, CardCollection, create_standard_deck


class Deck:
    """
    牌堆类
    
    管理游戏中的所有牌，支持洗牌、发牌、重置等操作。
    
    Attributes:
        cards: 牌堆中的牌列表
        original_count: 初始牌数（用于验证）
        level: 当前级数
    """
    
    STANDARD_CARD_COUNT = 108  # 2 副牌共 108 张
    PLAYERS_COUNT = 4          # 4 名玩家
    CARDS_PER_PLAYER = 27      # 每人 27 张
    
    def __init__(self, level: int = 2):
        """
        初始化牌堆
        
        Args:
            level: 当前级数（用于标记级牌）
        """
        self.level = level
        self.cards: List[Card] = []
        self.original_count = 0
        self.reset()
    
    def reset(self):
        """
        重置牌堆
        
        重新创建完整的 108 张牌
        """
        self.cards = create_standard_deck(self.level)
        self.original_count = len(self.cards)
    
    def shuffle(self, times: int = 3):
        """
        洗牌
        
        Args:
            times: 洗牌次数（默认 3 次，确保充分随机）
        """
        for _ in range(times):
            random.shuffle(self.cards)
    
    def deal(self, num_cards: int = 1) -> List[Card]:
        """
        发牌
        
        从牌堆顶部发出指定数量的牌
        
        Args:
            num_cards: 发牌数量（默认 1 张）
            
        Returns:
            发出的牌列表
            
        Raises:
            ValueError: 当牌堆中剩余牌不足时
        """
        if num_cards > len(self.cards):
            raise ValueError(
                f"牌堆中剩余牌数不足：需要 {num_cards} 张，剩余 {len(self.cards)} 张"
            )
        
        dealt_cards = []
        for _ in range(num_cards):
            dealt_cards.append(self.cards.pop())
        
        return dealt_cards
    
    def deal_to_players(self) -> List[CardCollection]:
        """
        给所有玩家发牌
        
        掼蛋规则：4 名玩家，每人 27 张牌
        
        Returns:
            包含 4 个玩家手牌的列表
        """
        if len(self.cards) < self.PLAYERS_COUNT * self.CARDS_PER_PLAYER:
            raise ValueError(
                f"牌堆中牌数不足：需要 {self.PLAYERS_COUNT * self.CARDS_PER_PLAYER} 张，"
                f"剩余 {len(self.cards)} 张"
            )
        
        # 为每个玩家创建手牌集合
        players_hands = []
        for _ in range(self.PLAYERS_COUNT):
            hand = CardCollection(level=self.level)
            cards = self.deal(self.CARDS_PER_PLAYER)
            for card in cards:
                hand.add(card)
            players_hands.append(hand)
        
        return players_hands
    
    def deal_one(self) -> Card:
        """
        发出一张牌
        
        Returns:
            发出的一张牌
        """
        return self.deal(1)[0]
    
    def remaining_cards(self) -> int:
        """
        获取牌堆中剩余牌数
        
        Returns:
            剩余牌数
        """
        return len(self.cards)
    
    def is_empty(self) -> bool:
        """
        判断牌堆是否为空
        
        Returns:
            是否为空
        """
        return len(self.cards) == 0
    
    def get_top_card(self) -> Optional[Card]:
        """
        查看牌堆顶部的牌（不发牌）
        
        Returns:
            顶部的牌，如果牌堆为空则返回 None
        """
        if self.is_empty():
            return None
        return self.cards[-1]
    
    def get_cards(self) -> List[Card]:
        """
        获取牌堆中所有牌的副本（不改变牌堆）
        
        Returns:
            牌列表的副本
        """
        return self.cards.copy()
    
    def add_card(self, card: Card):
        """
        将一张牌放回牌堆（通常用于测试或特殊情况）
        
        Args:
            card: 要添加的牌
        """
        self.cards.append(card)
    
    def add_cards(self, cards: List[Card]):
        """
        将多张牌放回牌堆
        
        Args:
            cards: 要添加的牌列表
        """
        self.cards.extend(cards)
    
    def __len__(self) -> int:
        """返回牌堆中的牌数"""
        return len(self.cards)
    
    def __str__(self):
        """返回牌堆的字符串表示"""
        return f"Deck({len(self.cards)}/{self.original_count} cards, level={self.level})"
    
    def __repr__(self):
        """返回牌堆的详细表示"""
        return f"Deck(level={self.level}, remaining={len(self.cards)})"


class DiscardPile:
    """
    弃牌堆类
    
    用于存放已出的牌，支持查询、统计等功能。
    可用于实现记牌器功能。
    
    Attributes:
        cards: 已出的牌列表
        level: 当前级数
    """
    
    def __init__(self, level: int = 2):
        """
        初始化弃牌堆
        
        Args:
            level: 当前级数
        """
        self.cards: List[Card] = []
        self.level = level
    
    def add(self, cards: List[Card]):
        """
        添加出的牌到弃牌堆
        
        Args:
            cards: 出的牌列表
        """
        self.cards.extend(cards)
    
    def clear(self):
        """清空弃牌堆（通常用于新的一轮）"""
        self.cards.clear()
    
    def get_all_cards(self) -> List[Card]:
        """
        获取所有已出的牌
        
        Returns:
            已出的牌列表
        """
        return self.cards.copy()
    
    def count_by_rank(self) -> dict:
        """
        统计各牌面值已出的数量
        
        Returns:
            字典 {牌面值：已出数量}
        """
        count = {}
        for card in self.cards:
            rank = card.rank
            if rank not in count:
                count[rank] = 0
            count[rank] += 1
        return count
    
    def count_by_suit(self) -> dict:
        """
        统计各花色已出的数量
        
        Returns:
            字典 {花色：已出数量}
        """
        count = {}
        for card in self.cards:
            suit = card.suit
            if suit not in count:
                count[suit] = 0
            count[suit] += 1
        return count
    
    def has_been_played(self, card: Card) -> bool:
        """
        判断某张牌是否已经出过
        
        Args:
            card: 要检查的牌
            
        Returns:
            是否已出
        """
        return card in self.cards
    
    def count_remaining(self, full_deck: Deck) -> dict:
        """
        计算各牌面值剩余数量
        
        Args:
            full_deck: 完整牌堆（用于获取总数）
            
        Returns:
            字典 {牌面值：剩余数量}
        """
        # 统计已出数量
        played_count = self.count_by_rank()
        
        # 计算剩余数量
        remaining = {}
        for card in full_deck.get_cards():
            rank = card.rank
            if rank not in remaining:
                # 计算该牌面值的总数
                total = sum(1 for c in full_deck.get_cards() if c.rank == rank)
                remaining[rank] = total
            
            if rank in played_count:
                remaining[rank] -= played_count[rank]
        
        return remaining
    
    def __len__(self) -> int:
        """返回已出的牌数"""
        return len(self.cards)
    
    def __str__(self):
        """返回弃牌堆的字符串表示"""
        return f"DiscardPile({len(self.cards)} cards)"
    
    def __repr__(self):
        """返回弃牌堆的详细表示"""
        return f"DiscardPile(level={self.level}, count={len(self.cards)})"


# 测试代码
if __name__ == "__main__":
    print("=== 掼蛋牌堆模块测试 ===\n")
    
    # 测试创建牌堆
    print("1. 创建牌堆:")
    deck = Deck(level=2)
    print(f"   {deck}")
    print(f"   初始牌数：{len(deck)}")
    
    # 测试洗牌
    print("\n2. 测试洗牌:")
    top_before = deck.get_top_card()
    deck.shuffle()
    top_after = deck.get_top_card()
    print(f"   洗牌前顶牌：{top_before}")
    print(f"   洗牌后顶牌：{top_after}")
    
    # 测试发牌
    print("\n3. 测试发牌:")
    hand1 = deck.deal(5)
    print(f"   发出 5 张牌：{hand1}")
    print(f"   剩余牌数：{deck.remaining_cards()}")
    
    # 测试给所有玩家发牌
    print("\n4. 测试给 4 名玩家发牌:")
    deck.reset()
    deck.shuffle()
    hands = deck.deal_to_players()
    for i, hand in enumerate(hands, 1):
        print(f"   玩家{i} 手牌数：{len(hand)}")
    print(f"   牌堆剩余：{deck.remaining_cards()}")
    
    # 测试弃牌堆
    print("\n5. 测试弃牌堆:")
    discard = DiscardPile(level=2)
    discard.add(hand1)
    print(f"   弃牌堆：{discard}")
    print(f"   按牌面值统计：{discard.count_by_rank()}")
    
    # 测试记牌功能
    print("\n6. 测试记牌功能:")
    remaining = discard.count_remaining(deck)
    print(f"   各牌面值剩余数量（部分）:")
    count = 0
    for rank, num in remaining.items():
        if count < 5:
            print(f"     {rank}: {num} 张")
            count += 1
    
    print("\n=== 测试完成 ===")
