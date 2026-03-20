"""
掼蛋游戏 - 卡牌类模块

本模块定义了卡牌的基本数据结构，包括花色、点数、大小比较等。
掼蛋使用 2 副牌，共 108 张牌。

牌面大小顺序（从大到小）：
大王 > 小王 > 级牌 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2

作者：代码虾
创建日期：2026-03-20
"""

from enum import Enum
from typing import Optional, List
from dataclasses import dataclass, field


class Suit(Enum):
    """
    花色枚举
    
    掼蛋中花色用于判断同花顺等特殊牌型
    """
    CLUBS = "♣"      # 梅花
    DIAMONDS = "♦"   # 方块
    HEARTS = "♥"     # 红桃
    SPADES = "♠"     # 黑桃
    JOKER = "🃏"     # 王（大小王共用）
    
    def __str__(self):
        return self.value


class CardRank(Enum):
    """
    牌面值枚举
    
    注意：掼蛋中 2 是最小的牌，A 是较大的牌
    级牌（当前打几）是特殊牌，可当百搭牌使用
    """
    TWO = 2         # 2（最小）
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11       # J
    QUEEN = 12      # Q
    KING = 13       # K
    ACE = 14        # A
    SMALL_JOKER = 15    # 小王
    BIG_JOKER = 16      # 大王
    
    def __str__(self):
        """返回牌面的字符串表示"""
        rank_map = {
            2: "2", 3: "3", 4: "4", 5: "5", 6: "6",
            7: "7", 8: "8", 9: "9", 10: "10",
            11: "J", 12: "Q", 13: "K", 14: "A",
            15: "小王", 16: "大王"
        }
        return rank_map.get(self.value, str(self.value))


@dataclass
class Card:
    """
    卡牌类
    
    表示一张单独的牌，包含花色和点数信息。
    支持级牌（百搭牌）功能。
    
    Attributes:
        rank: 牌面值（CardRank 枚举）
        suit: 花色（Suit 枚举）
        is_level_card: 是否为级牌（当前打的级数对应的牌）
        level: 当前局的级数（用于判断级牌）
    """
    rank: CardRank
    suit: Suit
    is_level_card: bool = False
    level: int = 2  # 默认打 2
    
    def __post_init__(self):
        """初始化后检查是否为级牌"""
        # 检查是否为级牌（数字牌且等于当前级数）
        if self.rank.value <= 14 and self.rank.value == self.level:
            self.is_level_card = True
    
    @property
    def value(self) -> int:
        """
        获取牌的实际大小值（用于比较）
        
        级牌的大小介于小王和 A 之间
        返回：牌的大小值
        """
        if self.is_level_card:
            # 级牌大小：小王 (15) < 级牌 < A (14)，所以级牌设为 14.5
            # 但为了整数比较，我们重新定义大小顺序
            # 大王 (16) > 小王 (15) > 级牌 (14.5) > A (14) > ... > 2 (2)
            return 145  # 用 145 表示级牌，便于整数比较
        return self.rank.value * 10 if self.rank.value <= 14 else self.rank.value * 10
    
    @property
    def display_value(self) -> str:
        """
        获取牌的显示值（用于界面显示）
        
        返回：牌的字符串表示
        """
        if self.is_level_card:
            return f"{self.level} (级)"
        return str(self.rank)
    
    def __str__(self):
        """返回卡牌的字符串表示"""
        if self.rank == CardRank.BIG_JOKER or self.rank == CardRank.SMALL_JOKER:
            return str(self.rank)
        return f"{self.suit}{self.rank}"
    
    def __repr__(self):
        """返回卡牌的详细表示"""
        level_info = " (级牌)" if self.is_level_card else ""
        return f"Card({self.suit}{self.rank}{level_info})"
    
    def __eq__(self, other):
        """判断两张牌是否相等"""
        if not isinstance(other, Card):
            return False
        return (self.rank == other.rank and 
                self.suit == other.suit and 
                self.is_level_card == other.is_level_card)
    
    def __hash__(self):
        """支持将卡牌作为字典键或集合元素"""
        return hash((self.rank, self.suit, self.is_level_card))
    
    def __lt__(self, other):
        """
        小于比较（用于排序）
        
        掼蛋牌大小：大王 > 小王 > 级牌 > A > K > ... > 2
        """
        if not isinstance(other, Card):
            return NotImplemented
        
        # 获取实际比较值
        self_val = self._compare_value()
        other_val = other._compare_value()
        
        return self_val < other_val
    
    def __le__(self, other):
        """小于等于比较"""
        return self == other or self < other
    
    def __gt__(self, other):
        """大于比较"""
        if not isinstance(other, Card):
            return NotImplemented
        return other < self
    
    def __ge__(self, other):
        """大于等于比较"""
        return self == other or self > other
    
    def _compare_value(self) -> int:
        """
        获取用于比较的数值
        
        大小顺序：大王 (160) > 小王 (150) > 级牌 (145) > A (140) > K (130) > ... > 2 (20)
        
        返回：比较值
        """
        if self.rank == CardRank.BIG_JOKER:
            return 160
        elif self.rank == CardRank.SMALL_JOKER:
            return 150
        elif self.is_level_card:
            return 145  # 级牌在小王和 A 之间
        else:
            return self.rank.value * 10
    
    def can_be_any(self) -> bool:
        """
        判断是否可以作为百搭牌使用
        
        级牌可以当任意牌使用（逢人配）
        
        返回：是否为百搭牌
        """
        return self.is_level_card
    
    def matches_rank(self, target_rank: CardRank, current_level: int) -> bool:
        """
        判断是否可以匹配目标牌面值
        
        级牌可以匹配任何牌面值
        
        Args:
            target_rank: 目标牌面值
            current_level: 当前级数
            
        Returns:
            是否可以匹配
        """
        if self.is_level_card:
            return True  # 级牌可以当任何牌
        return self.rank == target_rank


class CardCollection:
    """
    卡牌集合类
    
    用于管理多张牌的集合，支持排序、筛选等操作。
    可作为手牌、出牌、牌堆等的基础类。
    
    Attributes:
        cards: 卡牌列表
        level: 当前级数
    """
    
    def __init__(self, cards: Optional[List[Card]] = None, level: int = 2):
        """
        初始化卡牌集合
        
        Args:
            cards: 初始卡牌列表
            level: 当前级数
        """
        self.cards: List[Card] = cards if cards else []
        self.level = level
    
    def add(self, card: Card):
        """添加一张牌"""
        self.cards.append(card)
    
    def remove(self, card: Card) -> bool:
        """
        移除一张牌
        
        Args:
            card: 要移除的牌
            
        Returns:
            是否成功移除
        """
        try:
            self.cards.remove(card)
            return True
        except ValueError:
            return False
    
    def remove_at(self, index: int) -> Card:
        """
        移除指定位置的牌
        
        Args:
            index: 牌的位置索引
            
        Returns:
            被移除的牌
        """
        return self.cards.pop(index)
    
    def clear(self):
        """清空所有牌"""
        self.cards.clear()
    
    def __len__(self) -> int:
        """返回牌的数量"""
        return len(self.cards)
    
    def __getitem__(self, index: int) -> Card:
        """通过索引获取牌"""
        return self.cards[index]
    
    def __iter__(self):
        """支持迭代"""
        return iter(self.cards)
    
    def __contains__(self, card: Card) -> bool:
        """判断是否包含某张牌"""
        return card in self.cards
    
    def sort(self, reverse: bool = True):
        """
        对牌进行排序
        
        Args:
            reverse: 是否降序排列（默认降序，大牌在前）
        """
        self.cards.sort(key=lambda c: c._compare_value(), reverse=reverse)
    
    def get_sorted(self, reverse: bool = True) -> List[Card]:
        """
        获取排序后的牌列表（不改变原顺序）
        
        Args:
            reverse: 是否降序排列
            
        Returns:
            排序后的牌列表
        """
        return sorted(self.cards, key=lambda c: c._compare_value(), reverse=reverse)
    
    def count_by_rank(self) -> dict:
        """
        统计各牌面值的数量
        
        Returns:
            字典 {牌面值：数量}
        """
        count = {}
        for card in self.cards:
            rank = card.rank
            if rank not in count:
                count[rank] = 0
            count[rank] += 1
        return count
    
    def count_level_cards(self) -> int:
        """
        统计级牌数量
        
        Returns:
            级牌数量
        """
        return sum(1 for card in self.cards if card.is_level_card)
    
    def __str__(self):
        """返回卡牌集合的字符串表示"""
        if not self.cards:
            return "[]"
        return "[" + ", ".join(str(card) for card in self.cards) + "]"
    
    def __repr__(self):
        """返回卡牌集合的详细表示"""
        return f"CardCollection({len(self.cards)} cards)"


# 工具函数

def create_standard_deck(level: int = 2) -> List[Card]:
    """
    创建标准的掼蛋牌堆（2 副牌，共 108 张）
    
    每副牌包含：
    - 52 张普通牌（4 花色 × 13 点数）
    - 2 张王（大王、小王）
    
    2 副牌共 108 张
    
    Args:
        level: 当前级数（用于标记级牌）
        
    Returns:
        包含 108 张牌的列表
    """
    deck = []
    
    # 创建 2 副牌
    for _ in range(2):
        # 添加 4 花色的普通牌
        for suit in [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES]:
            for rank in CardRank:
                if rank.value <= 14:  # 只添加 2 到 A
                    is_level = (rank.value == level)
                    deck.append(Card(rank=rank, suit=suit, is_level_card=is_level, level=level))
        
        # 添加大小王
        deck.append(Card(rank=CardRank.SMALL_JOKER, suit=Suit.JOKER, level=level))
        deck.append(Card(rank=CardRank.BIG_JOKER, suit=Suit.JOKER, level=level))
    
    return deck


def compare_cards(card1: Card, card2: Card) -> int:
    """
    比较两张牌的大小
    
    Args:
        card1: 第一张牌
        card2: 第二张牌
        
    Returns:
        1 表示 card1 大，-1 表示 card2 大，0 表示相等
    """
    if card1 > card2:
        return 1
    elif card1 < card2:
        return -1
    else:
        return 0


# 测试代码
if __name__ == "__main__":
    print("=== 掼蛋卡牌模块测试 ===\n")
    
    # 测试创建单张牌
    print("1. 创建单张牌:")
    card1 = Card(rank=CardRank.ACE, suit=Suit.SPADES, level=2)
    card2 = Card(rank=CardRank.TWO, suit=Suit.HEARTS, level=2)
    card3 = Card(rank=CardRank.BIG_JOKER, suit=Suit.JOKER, level=2)
    print(f"   黑桃 A: {card1}")
    print(f"   红桃 2: {card2}")
    print(f"   大王：{card3}")
    
    # 测试级牌
    print("\n2. 测试级牌（打 2）:")
    level_2_card = Card(rank=CardRank.TWO, suit=Suit.CLUBS, level=2)
    print(f"   梅花 2 (级牌): {level_2_card}, 是否为级牌：{level_2_card.is_level_card}")
    
    # 测试牌大小比较
    print("\n3. 测试牌大小比较:")
    print(f"   大王 > 小王：{Card(CardRank.BIG_JOKER, Suit.JOKER) > Card(CardRank.SMALL_JOKER, Suit.JOKER)}")
    print(f"   级牌 > A: {level_2_card > card1}")
    print(f"   A > K: {card1 > Card(CardRank.KING, Suit.CLUBS)}")
    
    # 测试创建完整牌堆
    print("\n4. 创建标准牌堆:")
    deck = create_standard_deck(level=2)
    print(f"   牌堆总数：{len(deck)} 张")
    
    # 测试卡牌集合
    print("\n5. 测试卡牌集合:")
    collection = CardCollection(level=2)
    collection.add(card1)
    collection.add(card2)
    collection.add(card3)
    collection.add(level_2_card)
    print(f"   集合内容：{collection}")
    collection.sort()
    print(f"   排序后：{collection}")
    
    print("\n=== 测试完成 ===")
