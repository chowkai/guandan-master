"""
掼蛋游戏 - 游戏主循环模块

本模块实现了掼蛋游戏的完整流程控制，包括：
- 游戏初始化
- 发牌
- 出牌流程
- 牌型验证
- 胜负判定
- 升级规则

一局结束条件：前 3 家出完手牌（第 3 家出完游戏结束）

作者：代码虾
创建日期：2026-03-20
"""

import random
from typing import List, Optional, Tuple, Dict
from enum import Enum
from .cards import Card, CardCollection, CardRank
from .deck import Deck, DiscardPile
from .player import Player, PlayerManager, PlayerType, PlayerStatus
from .rules import RulesEngine, CardType, HandResult


class GamePhase(Enum):
    """
    游戏阶段枚举
    """
    NOT_STARTED = "not_started"     # 未开始
    DEALING = "dealing"             # 发牌中
    TRIBUTE = "tribute"             # 贡牌阶段
    PLAYING = "playing"             # 游戏中
    ROUND_END = "round_end"         # 一轮结束
    GAME_END = "game_end"           # 游戏结束


class TributeType(Enum):
    """
    贡牌类型枚举
    """
    NONE = "none"           # 无贡牌
    SINGLE = "single"       # 单贡
    DOUBLE = "double"       # 双贡
    RESIST = "resist"       # 抗贡


class GameResult:
    """
    游戏结果类
    
    Attributes:
        winner_team: 获胜队伍（0 或 1）
        rankings: 玩家排名列表 [(玩家 ID, 名次)]
        level_up: 是否升级
        level_up_count: 升级数（1/2/3）
        next_level: 下一局的级数
    """
    
    def __init__(self):
        self.winner_team: Optional[int] = None
        self.rankings: List[Tuple[int, int]] = []  # (player_id, rank)
        self.level_up: bool = False
        self.level_up_count: int = 0
        self.next_level: int = 2
    
    def __str__(self):
        return (f"GameResult(winner=队{self.winner_team}, "
                f"level_up={self.level_up}(+{self.level_up_count}))")


class GameState:
    """
    游戏状态类
    
    保存游戏的当前状态信息
    
    Attributes:
        phase: 游戏阶段
        level: 当前级数
        current_player_id: 当前出牌玩家 ID
        last_played_cards: 最后出的牌
        last_played_player: 最后出牌的玩家 ID
        pass_count: 连续不出次数
        finish_order: 出完牌的顺序记录
    """
    
    def __init__(self, level: int = 2):
        self.phase = GamePhase.NOT_STARTED
        self.level = level
        self.current_player_id = 0
        self.last_played_cards: Optional[List[Card]] = None
        self.last_played_player: Optional[int] = None
        self.pass_count = 0
        self.finish_order: List[int] = []  # 按顺序记录出完牌的玩家 ID
        self.round_winner: Optional[int] = None  # 本轮赢家
        
        # 贡牌阶段状态
        self.tribute_type: TributeType = TributeType.NONE
        self.tribute_giver: Optional[int] = None  # 进贡者
        self.tribute_receiver: Optional[int] = None  # 受贡者
        self.tribute_card: Optional[Card] = None  # 进贡牌
        self.return_card: Optional[Card] = None  # 还贡牌
    
    def reset_round(self):
        """重置一轮的状态"""
        self.last_played_cards = None
        self.last_played_player = None
        self.pass_count = 0
        self.round_winner = None
    
    def reset_tribute(self):
        """重置贡牌阶段状态"""
        self.tribute_type = TributeType.NONE
        self.tribute_giver = None
        self.tribute_receiver = None
        self.tribute_card = None
        self.return_card = None


class GuandanGame:
    """
    掼蛋游戏主类
    
    控制整个游戏流程
    
    Attributes:
        level: 当前级数
        deck: 牌堆
        discard_pile: 弃牌堆
        player_manager: 玩家管理器
        rules_engine: 规则引擎
        state: 游戏状态
        game_result: 游戏结果
    """
    
    def __init__(self, level: int = 2, human_player_index: int = 0):
        """
        初始化游戏
        
        Args:
            level: 初始级数
            human_player_index: 人类玩家位置
        """
        self.level = level
        self.deck = Deck(level=level)
        self.discard_pile = DiscardPile(level=level)
        self.player_manager = PlayerManager(level=level)
        self.player_manager.create_default_players(human_player_index=human_player_index)
        self.rules_engine = RulesEngine(level=level)
        self.state = GameState(level=level)
        self.game_result = GameResult()
        
        # 出牌历史
        self.play_history: List[Dict] = []
        
        # 首出玩家（用于后续局）
        self.first_player = 0
        self.winner_position = None  # 上局头游位置
    
    def start_game(self):
        """开始游戏"""
        print(f"\n{'='*60}")
        print(f"掼蛋游戏开始！当前打 {self.level}")
        print(f"{'='*60}\n")
        
        # 重置状态
        self.state = GameState(level=self.level)
        self.state.phase = GamePhase.DEALING
        
        # 重置牌堆并发牌
        self.deck.reset()
        self.deck.shuffle()
        self.discard_pile = DiscardPile(level=self.level)
        
        # 更新玩家手牌
        for player in self.player_manager:
            player.hand = CardCollection(level=self.level)
            player.status = PlayerStatus.PLAYING
            player.cards_played = []
            player.play_history = []
            player.finish_order = None
        
        # 发牌
        hands = self.deck.deal_to_players()
        for i, hand in enumerate(hands):
            self.player_manager.players[i].receive_cards(hand.cards)
        
        # 检查是否需要贡牌（不是第一局）
        if self.winner_position is not None:
            self.state.phase = GamePhase.TRIBUTE
            self.execute_tribute_phase()
            # 贡牌阶段已经设置了 first_player，不需要再设置
        
        self.state.phase = GamePhase.PLAYING
        
        # 新游戏开始时随机指定一家先出牌
        # 如果贡牌阶段已经设置了 first_player，使用贡牌阶段的结果
        if not hasattr(self, '_tribute_set_first_player') or not self._tribute_set_first_player:
            if self.winner_position is not None:
                self.first_player = self.winner_position
            else:
                self.first_player = random.randint(0, 3)
        
        self.state.current_player_id = self.first_player
        
        print(f"发牌完成！{self.player_manager.get_player(self.first_player).name} 先出牌\n")
        self.display_all_hands()
    
    def execute_tribute_phase(self):
        """
        执行贡牌阶段
        
        贡牌规则：
        1. 判断贡牌类型（单贡/双贡/抗贡）
        2. 确定进贡者和受贡者
        3. 选择进贡牌（最大单牌，排除红心级牌）
        4. 执行进贡
        5. 受贡方还贡（≤10 的牌）
        6. 确定出牌权（重要！正常贡牌后由进贡方先出，抗贡由头家先出）
        """
        print(f"\n{'='*60}")
        print("贡牌阶段")
        print(f"{'='*60}\n")
        
        # 获取上局排名
        rank_map = {player_id: rank for player_id, rank in self.game_result.rankings}
        
        # 获取各名次玩家
        player_by_rank = {}
        for player_id, rank in rank_map.items():
            player_by_rank[rank] = self.player_manager.get_player(player_id)
        
        head_you = player_by_rank.get(1)  # 头游
        er_you = player_by_rank.get(2)    # 二游
        san_you = player_by_rank.get(3)   # 三游
        mo_you = player_by_rank.get(4)    # 末游
        
        if not all([head_you, er_you, san_you, mo_you]):
            print("排名信息不完整，跳过贡牌阶段")
            return
        
        # 判断贡牌类型
        # 单贡：末游 → 头游
        # 双贡：三游、末游 → 头游、二游
        # 抗贡：有 2 个大王
        
        # 检查单贡抗贡（末游有 2 个大王）
        if mo_you.get_big_joker_count() >= 2:
            print(f"抗贡！{mo_you.name} 有{mo_you.get_big_joker_count()}个大王，跳过贡牌")
            self.state.tribute_type = TributeType.RESIST
            # 抗贡：上局头家直接出牌
            self.first_player = head_you.player_id
            self._tribute_set_first_player = True
            return
        
        # 检查是否双贡（头游和二游是队友，三游和末游是队友）
        is_double = (head_you.team == er_you.team) and (san_you.team == mo_you.team)
        
        if is_double:
            # 双贡：检查两家共有 2 个大王
            total_kings = san_you.get_big_joker_count() + mo_you.get_big_joker_count()
            if total_kings >= 2:
                print(f"抗贡！三游和末游共有{total_kings}个大王，跳过贡牌")
                self.state.tribute_type = TributeType.RESIST
                self.first_player = head_you.player_id
                self._tribute_set_first_player = True
                return
            
            # 执行双贡
            self.state.tribute_type = TributeType.DOUBLE
            print("双贡：三游和末游向头游和二游进贡\n")
            
            # 三游进贡给头游
            self._execute_single_tribute(san_you, head_you)
            
            # 末游进贡给二游
            self._execute_single_tribute(mo_you, er_you)
            
            # 双贡后，由进贡方（三游，给头游进贡的）先出牌
            self.first_player = san_you.player_id
            self._tribute_set_first_player = True
            print(f"\n贡牌结束，{san_you.name}（进贡方）获得出牌权\n")
        else:
            # 单贡
            self.state.tribute_type = TributeType.SINGLE
            print(f"单贡：{mo_you.name} → {head_you.name}\n")
            
            # 末游进贡给头游
            self._execute_single_tribute(mo_you, head_you)
            
            # 单贡后，由进贡方（末游）先出牌
            self.first_player = mo_you.player_id
            self._tribute_set_first_player = True
            print(f"\n贡牌结束，{mo_you.name}（进贡方）获得出牌权\n")
    
    def _execute_single_tribute(self, giver: Player, receiver: Player):
        """
        执行单次进贡
        
        Args:
            giver: 进贡方
            receiver: 受贡方
        """
        print(f"{giver.name} 向 {receiver.name} 进贡")
        
        # 选择进贡牌（最大单牌，排除红心级牌）
        tribute_card = giver.select_tribute_card(self.level)
        if not tribute_card:
            print(f"  {giver.name} 没有牌可进贡")
            return
        
        print(f"  进贡牌：{tribute_card}")
        
        # 执行进贡
        giver.hand.remove(tribute_card)
        receiver.hand.add(tribute_card)
        receiver.hand.sort()
        
        # 还贡
        return_card = receiver.select_return_card(self.level)
        if return_card:
            print(f"  还贡牌：{return_card}")
            receiver.hand.remove(return_card)
            giver.hand.add(return_card)
            giver.hand.sort()
        else:
            print(f"  {receiver.name} 没有≤10 的牌可还贡")
        
        print()
    
    def display_all_hands(self):
        """显示所有玩家的手牌（用于调试）"""
        for player in self.player_manager:
            print(f"{player.name}: {player.get_hand_count()} 张牌")
    
    def get_current_player(self) -> Player:
        """获取当前出牌玩家"""
        return self.player_manager.get_player(self.state.current_player_id)
    
    def play_cards(self, player_id: int, cards: List[Card]) -> bool:
        """
        玩家出牌
        
        Args:
            player_id: 玩家 ID
            cards: 要出的牌
            
        Returns:
            是否成功出牌
        """
        player = self.player_manager.get_player(player_id)
        if not player or not player.is_playing():
            return False
        
        # 验证是否轮到该玩家
        if player_id != self.state.current_player_id:
            print(f"还没到 {player.name} 出牌！")
            return False
        
        # 分析牌型
        hand_result = self.rules_engine.analyze_hand(cards)
        if not hand_result.is_valid:
            print(f"{player.name} 出了无效牌型！")
            return False
        
        # 验证是否能打过上一手牌
        if self.state.last_played_cards:
            if self.state.last_played_player != player_id:
                # 不是同一轮，需要比较大小
                if not self.rules_engine.can_beat(cards, self.state.last_played_cards):
                    print(f"{player.name} 的牌打不过上一手！")
                    return False
        
        # 出牌成功
        player.play_cards(cards, hand_result.card_type.display_name)
        self.discard_pile.add(cards)
        
        # 记录出牌历史
        self.play_history.append({
            'player_id': player_id,
            'player_name': player.name,
            'cards': cards,
            'card_type': hand_result.card_type.display_name,
            'is_bomb': hand_result.card_type.is_bomb
        })
        
        print(f"{player.name} 出了 {hand_result.card_type.display_name}: {cards}")
        
        # 更新状态
        self.state.last_played_cards = cards
        self.state.last_played_player = player_id
        self.state.pass_count = 0
        self.state.round_winner = player_id
        
        # 检查是否出完牌
        if player.is_finished():
            self.handle_player_finished(player)
        
        # 切换到下一个玩家
        self.next_player()
        
        return True
    
    def pass_turn(self, player_id: int):
        """
        玩家选择不出
        
        Args:
            player_id: 玩家 ID
        """
        player = self.player_manager.get_player(player_id)
        if not player:
            return
        
        # 如果是第一个出牌的，不能过
        if self.state.last_played_player is None:
            print(f"{player.name} 是第一个出牌，不能过！")
            return
        
        # 如果是新的一轮（上家是队友且出完了），可以重新出牌
        if self.state.pass_count >= 3:
            # 一轮结束，当前玩家可以重新出牌
            self.state.last_played_cards = None
            self.state.last_played_player = None
            self.state.pass_count = 0
            print(f"{player.name} 选择不出（新的一轮）")
            return
        
        player.pass_turn()
        self.state.pass_count += 1
        print(f"{player.name} 选择不出 (跳过)")
        
        # 检查是否一轮结束
        if self.state.pass_count >= 3:
            # 一轮结束，最后出牌的玩家获得下一轮出牌权
            self.state.current_player_id = self.state.round_winner
            self.state.last_played_cards = None
            self.state.last_played_player = None
            self.state.pass_count = 0
            print(f"\n一轮结束，{self.player_manager.get_player(self.state.round_winner).name} 获得出牌权\n")
            return
        
        # 切换到下一个玩家
        self.next_player()
    
    def next_player(self):
        """切换到下一个玩家"""
        # 找到下一个还在游戏中的玩家
        next_id = (self.state.current_player_id + 1) % 4
        attempts = 0
        while attempts < 4:
            player = self.player_manager.get_player(next_id)
            if player and player.is_playing():
                self.state.current_player_id = next_id
                return
            next_id = (next_id + 1) % 4
            attempts += 1
        
        # 如果所有玩家都出完了，游戏结束
        if self.state.phase == GamePhase.PLAYING:
            self.end_game()
    
    def handle_player_finished(self, player: Player):
        """
        处理玩家出完牌
        
        Args:
            player: 出完牌的玩家
        """
        order = len(self.state.finish_order) + 1
        player.set_finish_order(order)
        self.state.finish_order.append(player.player_id)
        
        print(f"\n*** {player.name} 出完牌！名次：第{order}名 ***\n")
        
        # 检查游戏是否结束（前 3 家出完）
        if len(self.state.finish_order) >= 3:
            self.end_game()
    
    def end_game(self):
        """结束游戏并计算结果"""
        self.state.phase = GamePhase.GAME_END
        
        print(f"\n{'='*60}")
        print("游戏结束！")
        print(f"{'='*60}\n")
        
        # 记录排名
        for i, player_id in enumerate(self.state.finish_order, 1):
            player = self.player_manager.get_player(player_id)
            if player:
                self.game_result.rankings.append((player_id, i))
        
        # 确定第 4 名
        for player in self.player_manager:
            if player.finish_order is None:
                player.set_finish_order(4)
                self.game_result.rankings.append((player.player_id, 4))
                break
        
        # 记录上局头游位置（用于下一局先手）
        for player_id, rank in self.game_result.rankings:
            if rank == 1:
                self.winner_position = player_id
                break
        
        # 计算胜负
        self.calculate_result()
        
        # 显示结果
        self.display_result()
    
    def calculate_result(self):
        """计算游戏结果和升级情况"""
        # 获取各名次对应的队伍
        team_scores = {0: 0, 1: 0}  # 队伍得分
        
        for player_id, rank in self.game_result.rankings:
            player = self.player_manager.get_player(player_id)
            if player:
                # 积分：头游 +3, 二游 +1, 三游 -1, 末游 -3
                score_map = {1: 3, 2: 1, 3: -1, 4: -3}
                team_scores[player.team] += score_map[rank]
        
        # 确定获胜队伍
        if team_scores[0] > team_scores[1]:
            self.game_result.winner_team = 0
        elif team_scores[1] > team_scores[0]:
            self.game_result.winner_team = 1
        else:
            # 平分，看头游
            head_you_team = None
            for player_id, rank in self.game_result.rankings:
                if rank == 1:
                    player = self.player_manager.get_player(player_id)
                    head_you_team = player.team
                    break
            self.game_result.winner_team = head_you_team
        
        # 计算升级
        # 头游 + 二游 -> 升 3 级
        # 头游 + 三游 -> 升 2 级
        # 头游 + 末游 -> 升 1 级
        winner_team = self.game_result.winner_team
        
        # 获取获胜队伍的排名
        winner_ranks = [rank for player_id, rank in self.game_result.rankings 
                       if self.player_manager.get_player(player_id).team == winner_team]
        winner_ranks.sort()
        
        # 检查打 A 规则
        can_level_up = True
        if self.level == 14:  # A
            # 必须己方有人头游且己方无人末游
            has_head_you = 1 in winner_ranks
            has_last = 4 in winner_ranks
            if not has_head_you or has_last:
                can_level_up = False
                print(f"\n打 A 规则：队{winner_team} 不能升级！")
        
        if can_level_up:
            if winner_ranks == [1, 2]:
                self.game_result.level_up = True
                self.game_result.level_up_count = 3
            elif winner_ranks == [1, 3]:
                self.game_result.level_up = True
                self.game_result.level_up_count = 2
            elif winner_ranks == [1, 4]:
                self.game_result.level_up = True
                self.game_result.level_up_count = 1
            else:
                self.game_result.level_up = False
                self.game_result.level_up_count = 0
        
        # 计算下一级
        if self.game_result.level_up:
            next_level = self.level + self.game_result.level_up_count
            if next_level > 14:  # 超过 A
                next_level = 14
            self.game_result.next_level = next_level
        else:
            self.game_result.next_level = self.level
    
    def display_result(self):
        """显示游戏结果"""
        print("\n排名:")
        rank_names = {1: "头游", 2: "二游", 3: "三游", 4: "末游"}
        for player_id, rank in sorted(self.game_result.rankings, key=lambda x: x[1]):
            player = self.player_manager.get_player(player_id)
            print(f"  第{rank}名 ({rank_names[rank]}): {player.name} (队{player.team})")
        
        print(f"\n获胜队伍：队{self.game_result.winner_team}")
        
        if self.game_result.level_up:
            print(f"升级：+{self.game_result.level_up_count} 级")
            print(f"下一级：打 {self.game_result.next_level}")
        else:
            print("不升级")
    
    def get_game_state(self) -> Dict:
        """
        获取游戏状态信息
        
        Returns:
            状态字典
        """
        return {
            'phase': self.state.phase.value,
            'level': self.level,
            'current_player': self.state.current_player_id,
            'last_played': self.state.last_played_player,
            'pass_count': self.state.pass_count,
            'finished_players': self.state.finish_order
        }
    
    def is_game_over(self) -> bool:
        """判断游戏是否结束"""
        return self.state.phase == GamePhase.GAME_END
    
    def get_next_level(self) -> int:
        """获取下一局的级数"""
        return self.game_result.next_level


# 测试代码
if __name__ == "__main__":
    print("=== 掼蛋游戏主循环测试 ===\n")
    
    # 创建游戏
    game = GuandanGame(level=2, human_player_index=0)
    
    # 开始游戏
    game.start_game()
    
    # 模拟出牌（简化测试）
    print("\n模拟出牌测试:")
    player0 = game.player_manager.get_player(0)
    if player0 and len(player0.hand) > 0:
        # 出一张牌
        card = player0.hand[0]
        game.play_cards(0, [card])
    
    print(f"\n游戏状态：{game.get_game_state()}")
    
    print("\n=== 测试完成 ===")
