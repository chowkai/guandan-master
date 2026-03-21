"""
掼蛋游戏 - 玩家类模块

本模块定义了玩家类，管理玩家的手牌、出牌、状态等信息。
支持人类玩家和 AI 玩家。

作者：代码虾
创建日期：2026-03-20
"""

from enum import Enum
from typing import List, Optional, Tuple
from .cards import Card, CardCollection, CardRank


class PlayerType(Enum):
    """
    玩家类型枚举
    """
    HUMAN = "human"      # 人类玩家
    AI_EASY = "ai_easy"      # 简单 AI
    AI_MEDIUM = "ai_medium"  # 中等 AI
    AI_HARD = "ai_hard"      # 困难 AI


class PlayerStatus(Enum):
    """
    玩家状态枚举
    """
    WAITING = "waiting"       # 等待游戏开始
    PLAYING = "playing"       # 游戏中
    FINISHED = "finished"     # 已出完牌
    OUT = "out"              # 被淘汰（末游）


class Player:
    """
    玩家类
    
    管理玩家的基本信息、手牌、出牌历史等。
    
    Attributes:
        player_id: 玩家 ID（0-3）
        name: 玩家名称
        player_type: 玩家类型（人类/AI）
        hand: 手牌集合
        status: 玩家状态
        team: 队伍编号（0 或 1，对家为同一队）
        level: 当前级数
        cards_played: 已出的牌列表
        finish_order: 出完牌的顺序（1=头游，4=末游）
    """
    
    def __init__(self, player_id: int, name: str, player_type: PlayerType = PlayerType.HUMAN,
                 level: int = 2):
        """
        初始化玩家
        
        Args:
            player_id: 玩家 ID（0-3）
            name: 玩家名称
            player_type: 玩家类型
            level: 当前级数
        """
        self.player_id = player_id
        self.name = name
        self.player_type = player_type
        self.hand = CardCollection(level=level)
        self.status = PlayerStatus.WAITING
        self.team = player_id % 2  # 0 和 2 一队，1 和 3 一队
        self.level = level
        self.cards_played: List[Card] = []
        self.finish_order: Optional[int] = None
        
        # 出牌历史
        self.play_history: List[Tuple[List[Card], str]] = []  # (牌列表，牌型)
    
    def receive_cards(self, cards: List[Card]):
        """
        接收发牌
        
        Args:
            cards: 收到的牌列表
        """
        for card in cards:
            self.hand.add(card)
        self.hand.sort()  # 自动排序手牌
    
    def play_cards(self, cards: List[Card], card_type: str) -> bool:
        """
        出牌
        
        Args:
            cards: 要出的牌列表
            card_type: 牌型描述（如"单张"、"对子"、"炸弹"等）
            
        Returns:
            是否成功出牌
        """
        if not cards:
            return False
        
        # 验证手牌中是否有这些牌
        for card in cards:
            if card not in self.hand:
                return False
        
        # 从手牌中移除
        for card in cards:
            self.hand.remove(card)
            self.cards_played.append(card)
        
        # 记录出牌历史
        self.play_history.append((cards, card_type))
        
        # 检查是否出完牌
        if len(self.hand) == 0:
            self.status = PlayerStatus.FINISHED
        
        return True
    
    def pass_turn(self):
        """
        选择不出（过）
        
        这只是标记，实际逻辑由游戏控制器处理
        """
        pass
    
    def get_hand(self) -> CardCollection:
        """
        获取手牌
        
        Returns:
            手牌集合
        """
        return self.hand
    
    def get_hand_count(self) -> int:
        """
        获取手牌数量
        
        Returns:
            手牌数
        """
        return len(self.hand)
    
    def get_cards_played(self) -> List[Card]:
        """
        获取已出的牌
        
        Returns:
            已出的牌列表
        """
        return self.cards_played.copy()
    
    def get_play_history(self) -> List[Tuple[List[Card], str]]:
        """
        获取出牌历史
        
        Returns:
            出牌历史列表
        """
        return self.play_history.copy()
    
    def is_finished(self) -> bool:
        """
        判断是否已出完牌
        
        Returns:
            是否已出完
        """
        return self.status == PlayerStatus.FINISHED
    
    def is_playing(self) -> bool:
        """
        判断是否还在游戏中
        
        Returns:
            是否在游戏中
        """
        return self.status == PlayerStatus.PLAYING
    
    def set_finish_order(self, order: int):
        """
        设置出完牌的顺序
        
        Args:
            order: 顺序（1=头游，2=二游，3=三游，4=末游）
        """
        self.finish_order = order
        if order == 1:
            self.status = PlayerStatus.FINISHED
        elif order == 4:
            self.status = PlayerStatus.OUT
        else:
            self.status = PlayerStatus.FINISHED
    
    def get_level_cards_count(self) -> int:
        """
        获取手牌中级牌的数量
        
        Returns:
            级牌数量
        """
        return self.hand.count_level_cards()
    
    def has_card(self, card: Card) -> bool:
        """
        判断手牌中是否有某张牌
        
        Args:
            card: 要检查的牌
            
        Returns:
            是否有
        """
        return card in self.hand
    
    def has_rank(self, rank: CardRank) -> bool:
        """
        判断手牌中是否有某牌面值的牌
        
        Args:
            rank: 牌面值
            
        Returns:
            是否有
        """
        for card in self.hand:
            if card.rank == rank:
                return True
        return False
    
    def count_rank(self, rank: CardRank) -> int:
        """
        统计手牌中某牌面值的数量
        
        Args:
            rank: 牌面值
            
        Returns:
            数量
        """
        return sum(1 for card in self.hand if card.rank == rank)
    
    def get_sorted_hand(self) -> List[Card]:
        """
        获取排序后的手牌
        
        Returns:
            排序后的手牌列表
        """
        return self.hand.get_sorted()
    
    def get_teammate_id(self) -> int:
        """
        获取队友的玩家 ID
        
        Returns:
            队友 ID
        """
        return (self.player_id + 2) % 4
    
    def get_opponent_ids(self) -> List[int]:
        """
        获取对手的玩家 ID 列表
        
        Returns:
            对手 ID 列表
        """
        return [(self.player_id + 1) % 4, (self.player_id + 3) % 4]
    
    def get_big_joker_count(self) -> int:
        """
        获取手牌中大王的数量
        
        Returns:
            大王数量
        """
        from .cards import CardRank
        return sum(1 for card in self.hand if card.rank == CardRank.BIG_JOKER)
    
    def select_tribute_card(self, level: int) -> Optional[Card]:
        """
        选择进贡牌（手牌中最大单牌，排除红心级牌）
        
        规则：
        - 选择手牌中最大的单牌
        - 如果是红心级牌，用次大牌
        - 有两张最大牌，选第一张
        
        Args:
            level: 当前级数（用于判断红心级牌）
            
        Returns:
            进贡牌
        """
        from .cards import Suit
        if len(self.hand) == 0:
            return None
        
        # 获取排序后的手牌（从大到小）
        sorted_hand = self.get_sorted_hand()
        
        # 首先检查是否有两张相同的最大牌（对子），自动选第一张
        if len(sorted_hand) >= 2:
            # 检查前两张是否相同牌面值
            if sorted_hand[0].rank.value == sorted_hand[1].rank.value:
                # 检查第一张是否是红心级牌
                is_red_heart = (sorted_hand[0].is_level_card and sorted_hand[0].suit == Suit.HEARTS)
                if not is_red_heart:
                    return sorted_hand[0]
                # 如果第一张是红心级，检查第二张
                is_red_heart_2 = (sorted_hand[1].is_level_card and sorted_hand[1].suit == Suit.HEARTS)
                if not is_red_heart_2:
                    return sorted_hand[1]
        
        # 找到最大的非红心级牌
        for card in sorted_hand:
            # 检查是否是红心级牌
            is_red_heart_level = (card.is_level_card and card.suit == Suit.HEARTS)
            if not is_red_heart_level:
                return card
        
        # 如果所有牌都是红心级牌（极端情况），返回第一张
        return sorted_hand[0] if sorted_hand else None
    
    def select_return_card(self, level: int) -> Optional[Card]:
        """
        选择还贡牌（≤10 的牌，AI 自动选择最小的）
        
        规则：
        - 选择手牌中≤10 的牌
        - AI 自动选择最小的≤10 的牌
        
        Args:
            level: 当前级数
            
        Returns:
            还贡牌
        """
        from .cards import CardRank
        if len(self.hand) == 0:
            return None
        
        # 找到所有≤10 的牌
        valid_cards = [card for card in self.hand 
                      if card.rank.value <= CardRank.TEN.value]
        
        if not valid_cards:
            return None
        
        # 返回最小的牌（排序后取最后一个）
        valid_cards.sort(key=lambda c: c._compare_value(), reverse=False)
        return valid_cards[0]
    
    def can_resist_tribute(self, required_kings: int = 2) -> bool:
        """
        判断是否可以抗贡
        
        规则：
        - 单贡：有 2 个大王 → 抗贡
        - 双贡：两家共有 2 个大王 → 抗贡
        
        Args:
            required_kings: 需要的大王数量（默认 2）
            
        Returns:
            是否可以抗贡
        """
        return self.get_big_joker_count() >= required_kings
    
    def __str__(self):
        """返回玩家的字符串表示"""
        status_map = {
            PlayerStatus.WAITING: "等待中",
            PlayerStatus.PLAYING: "游戏中",
            PlayerStatus.FINISHED: "已出完",
            PlayerStatus.OUT: "淘汰"
        }
        type_map = {
            PlayerType.HUMAN: "人类",
            PlayerType.AI_EASY: "简单 AI",
            PlayerType.AI_MEDIUM: "中等 AI",
            PlayerType.AI_HARD: "困难 AI"
        }
        
        finish_info = ""
        if self.finish_order:
            order_map = {1: "头游", 2: "二游", 3: "三游", 4: "末游"}
            finish_info = f" ({order_map[self.finish_order]})"
        
        return (f"玩家{self.player_id}({self.name})[{type_map[self.player_type]}] "
                f"手牌:{len(self.hand)}张 {status_map[self.status]}{finish_info}")
    
    def __repr__(self):
        """返回玩家的详细表示"""
        return f"Player(id={self.player_id}, name='{self.name}', type={self.player_type.value})"


class PlayerManager:
    """
    玩家管理类
    
    管理所有玩家，提供便捷的访问和操作接口。
    
    Attributes:
        players: 玩家列表
        level: 当前级数
        current_player_index: 当前出牌玩家索引
    """
    
    def __init__(self, level: int = 2):
        """
        初始化玩家管理器
        
        Args:
            level: 当前级数
        """
        self.level = level
        self.players: List[Player] = []
        self.current_player_index = 0
    
    def add_player(self, player: Player):
        """
        添加玩家
        
        Args:
            player: 玩家对象
        """
        self.players.append(player)
    
    def create_default_players(self, human_player_index: int = 0):
        """
        创建默认的 4 名玩家（1 个人类 + 3 个 AI）
        
        Args:
            human_player_index: 人类玩家的位置（0-3）
        """
        default_names = ["玩家", "电脑 1", "电脑 2", "电脑 3"]
        default_types = [PlayerType.HUMAN, PlayerType.AI_MEDIUM, 
                        PlayerType.AI_MEDIUM, PlayerType.AI_MEDIUM]
        
        for i in range(4):
            if i == human_player_index:
                player_type = PlayerType.HUMAN
                name = f"你"
            else:
                player_type = PlayerType.AI_MEDIUM
                name = default_names[i]
            
            player = Player(player_id=i, name=name, player_type=player_type, level=self.level)
            self.add_player(player)
    
    def get_player(self, player_id: int) -> Optional[Player]:
        """
        获取指定玩家
        
        Args:
            player_id: 玩家 ID
            
        Returns:
            玩家对象，如果不存在则返回 None
        """
        if 0 <= player_id < len(self.players):
            return self.players[player_id]
        return None
    
    def get_current_player(self) -> Optional[Player]:
        """
        获取当前出牌玩家
        
        Returns:
            当前玩家
        """
        if self.players:
            return self.players[self.current_player_index]
        return None
    
    def next_player(self):
        """切换到下一个玩家"""
        self.current_player_index = (self.current_player_index + 1) % len(self.players)
    
    def get_player_by_order(self, order: int) -> Optional[Player]:
        """
        根据出牌顺序获取玩家
        
        Args:
            order: 顺序（1=头游，2=二游，3=三游，4=末游）
            
        Returns:
            玩家对象
        """
        for player in self.players:
            if player.finish_order == order:
                return player
        return None
    
    def get_finished_players(self) -> List[Player]:
        """
        获取已出完牌的玩家列表
        
        Returns:
            已出完的玩家列表
        """
        return [p for p in self.players if p.is_finished()]
    
    def get_playing_players(self) -> List[Player]:
        """
        获取还在游戏中的玩家列表
        
        Returns:
            游戏中的玩家列表
        """
        return [p for p in self.players if p.is_playing()]
    
    def get_team_players(self, team_id: int) -> List[Player]:
        """
        获取指定队伍的玩家列表
        
        Args:
            team_id: 队伍 ID（0 或 1）
            
        Returns:
            队伍玩家列表
        """
        return [p for p in self.players if p.team == team_id]
    
    def all_finished(self) -> bool:
        """
        判断是否所有玩家都已出完牌
        
        Returns:
            是否全部出完
        """
        return all(p.is_finished() for p in self.players)
    
    def get_finish_count(self) -> int:
        """
        获取已出完牌的玩家数量
        
        Returns:
            数量
        """
        return sum(1 for p in self.players if p.is_finished())
    
    def __len__(self) -> int:
        """返回玩家总数"""
        return len(self.players)
    
    def __iter__(self):
        """支持迭代"""
        return iter(self.players)
    
    def __getitem__(self, index: int) -> Player:
        """通过索引获取玩家"""
        return self.players[index]
    
    def __str__(self):
        """返回玩家管理器的字符串表示"""
        return f"PlayerManager({len(self.players)} players, level={self.level})"


# 测试代码
if __name__ == "__main__":
    print("=== 掼蛋玩家模块测试 ===\n")
    
    # 测试创建玩家
    print("1. 创建玩家:")
    player1 = Player(player_id=0, name="小明", player_type=PlayerType.HUMAN, level=2)
    player2 = Player(player_id=1, name="电脑 1", player_type=PlayerType.AI_MEDIUM, level=2)
    print(f"   {player1}")
    print(f"   {player2}")
    
    # 测试队伍关系
    print("\n2. 测试队伍关系:")
    print(f"   玩家 0 的队友：玩家{player1.get_teammate_id()}")
    print(f"   玩家 0 的对手：玩家{player1.get_opponent_ids()}")
    print(f"   玩家 0 和玩家 2 同队：{player1.team == player2.get_teammate_id()}")
    
    # 测试发牌
    print("\n3. 测试接收手牌:")
    from .deck import Deck
    deck = Deck(level=2)
    deck.shuffle()
    hand = deck.deal(27)
    player1.receive_cards(hand)
    print(f"   玩家 1 手牌数：{player1.get_hand_count()}")
    print(f"   级牌数量：{player1.get_level_cards_count()}")
    
    # 测试出牌
    print("\n4. 测试出牌:")
    if len(player1.hand) > 0:
        card_to_play = [player1.hand[0]]
        success = player1.play_cards(card_to_play, "单张")
        print(f"   出牌成功：{success}")
        print(f"   剩余手牌：{player1.get_hand_count()}")
    
    # 测试玩家管理器
    print("\n5. 测试玩家管理器:")
    manager = PlayerManager(level=2)
    manager.create_default_players(human_player_index=0)
    print(f"   玩家总数：{len(manager)}")
    for player in manager:
        print(f"   {player}")
    
    print("\n=== 测试完成 ===")
