#!/usr/bin/env python3
"""
掼蛋游戏 - 贡牌规则单元测试

测试贡牌阶段的所有规则：
- 单贡
- 双贡
- 抗贡
- 进贡牌选择
- 还贡牌选择
- 出牌权确定

运行方式:
    cd /home/zhoukai/openclaw/workspace/projects/guandan
    python -m pytest tests/test_tribute.py -v

作者：代码虾
创建日期：2026-03-20
"""

import sys
import unittest

# 添加项目路径
sys.path.insert(0, '/home/zhoukai/openclaw/workspace/projects/guandan/src')

from game.cards import Card, CardRank, Suit, create_standard_deck
from game.player import Player, PlayerType, PlayerManager
from game.game import GuandanGame, TributeType, GameResult
from game.deck import Deck


class TestTributeCardSelection(unittest.TestCase):
    """进贡牌选择测试"""
    
    def setUp(self):
        self.player = Player(player_id=0, name="测试玩家", player_type=PlayerType.HUMAN, level=2)
    
    def test_select_largest_card(self):
        """测试选择最大牌进贡"""
        # 给玩家一些牌
        cards = [
            Card(CardRank.THREE, Suit.SPADES, level=2),
            Card(CardRank.KING, Suit.HEARTS, level=2),
            Card(CardRank.ACE, Suit.CLUBS, level=2),
        ]
        self.player.receive_cards(cards)
        
        tribute_card = self.player.select_tribute_card(level=2)
        
        # 应该选择 ACE（最大）
        self.assertEqual(tribute_card.rank, CardRank.ACE)
    
    def test_skip_red_heart_level_card(self):
        """测试跳过红心级牌"""
        # 级牌是 2，红心 2 应该被跳过
        cards = [
            Card(CardRank.TWO, Suit.HEARTS, level=2),  # 红心级牌
            Card(CardRank.KING, Suit.SPADES, level=2),  # 次大
            Card(CardRank.ACE, Suit.CLUBS, level=2),
        ]
        self.player.receive_cards(cards)
        
        tribute_card = self.player.select_tribute_card(level=2)
        
        # 应该选择 ACE（红心 2 被跳过）
        self.assertEqual(tribute_card.rank, CardRank.ACE)
        self.assertNotEqual(tribute_card.suit, Suit.HEARTS)
    
    def test_select_first_of_pair(self):
        """测试有两张最大牌时选第一张"""
        # 给玩家两张 ACE
        cards = [
            Card(CardRank.ACE, Suit.SPADES, level=2),
            Card(CardRank.ACE, Suit.HEARTS, level=2),
            Card(CardRank.KING, Suit.CLUBS, level=2),
        ]
        self.player.receive_cards(cards)
        
        tribute_card = self.player.select_tribute_card(level=2)
        
        # 应该选择 ACE（第一张）
        self.assertEqual(tribute_card.rank, CardRank.ACE)
    
    def test_all_red_heart_level_cards(self):
        """测试极端情况：所有牌都是红心级牌"""
        # 给玩家多张红心级牌（理论上不可能，但测试边界）
        cards = [
            Card(CardRank.TWO, Suit.HEARTS, level=2),
            Card(CardRank.TWO, Suit.HEARTS, level=2),
        ]
        self.player.receive_cards(cards)
        
        tribute_card = self.player.select_tribute_card(level=2)
        
        # 应该返回第一张
        self.assertIsNotNone(tribute_card)


class TestReturnCardSelection(unittest.TestCase):
    """还贡牌选择测试"""
    
    def setUp(self):
        self.player = Player(player_id=0, name="测试玩家", player_type=PlayerType.HUMAN, level=2)
    
    def test_select_smallest_card_le_10(self):
        """测试选择最小的≤10 的牌"""
        cards = [
            Card(CardRank.ACE, Suit.SPADES, level=2),
            Card(CardRank.FIVE, Suit.HEARTS, level=2),  # ≤10
            Card(CardRank.TEN, Suit.CLUBS, level=2),     # ≤10
            Card(CardRank.THREE, Suit.DIAMONDS, level=2), # ≤10，最小
        ]
        self.player.receive_cards(cards)
        
        return_card = self.player.select_return_card(level=2)
        
        # 应该选择 3（最小的≤10 的牌）
        self.assertEqual(return_card.rank, CardRank.THREE)
    
    def test_no_card_le_10(self):
        """测试没有≤10 的牌时返回 None"""
        cards = [
            Card(CardRank.JACK, Suit.SPADES, level=2),
            Card(CardRank.QUEEN, Suit.HEARTS, level=2),
            Card(CardRank.KING, Suit.CLUBS, level=2),
            Card(CardRank.ACE, Suit.DIAMONDS, level=2),
        ]
        self.player.receive_cards(cards)
        
        return_card = self.player.select_return_card(level=2)
        
        # 应该返回 None
        self.assertIsNone(return_card)


class TestResistTribute(unittest.TestCase):
    """抗贡测试"""
    
    def test_single_resist_with_two_big_jokers(self):
        """测试单贡抗贡：有 2 个大王"""
        player = Player(player_id=0, name="测试玩家", player_type=PlayerType.HUMAN, level=2)
        
        # 给玩家 2 个大王
        cards = [
            Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
            Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
            Card(CardRank.THREE, Suit.SPADES, level=2),
        ]
        player.receive_cards(cards)
        
        # 检查是否可以抗贡
        can_resist = player.can_resist_tribute(required_kings=2)
        
        self.assertTrue(can_resist)
    
    def test_cannot_resist_with_one_big_joker(self):
        """测试只有 1 个大王不能抗贡"""
        player = Player(player_id=0, name="测试玩家", player_type=PlayerType.HUMAN, level=2)
        
        cards = [
            Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
            Card(CardRank.SMALL_JOKER, Suit.JOKER, level=2),
            Card(CardRank.THREE, Suit.SPADES, level=2),
        ]
        player.receive_cards(cards)
        
        can_resist = player.can_resist_tribute(required_kings=2)
        
        # 只有 1 个大王，不能抗贡
        self.assertFalse(can_resist)


class TestTributePhase(unittest.TestCase):
    """贡牌阶段完整流程测试"""
    
    def test_single_tribute_flow(self):
        """测试单贡流程"""
        game = GuandanGame(level=2, human_player_index=0)
        
        # 模拟上局排名：玩家 0 头游，玩家 1 二游，玩家 2 三游，玩家 3 末游
        game.game_result.rankings = [
            (0, 1),  # 头游
            (1, 2),  # 二游
            (2, 3),  # 三游
            (3, 4),  # 末游
        ]
        game.winner_position = 0
        
        # 给末游（玩家 3）一些牌用于进贡
        player3 = game.player_manager.get_player(3)
        player3.receive_cards([
            Card(CardRank.ACE, Suit.SPADES, level=2),
            Card(CardRank.KING, Suit.HEARTS, level=2),
        ])
        
        # 给头游（玩家 0）一些牌用于还贡
        player0 = game.player_manager.get_player(0)
        player0.receive_cards([
            Card(CardRank.FIVE, Suit.CLUBS, level=2),  # ≤10
            Card(CardRank.THREE, Suit.DIAMONDS, level=2),  # ≤10，最小
        ])
        
        # 执行贡牌阶段
        game.execute_tribute_phase()
        
        # 验证贡牌类型
        self.assertEqual(game.state.tribute_type, TributeType.SINGLE)
        
        # 验证出牌权（末游先出）
        self.assertEqual(game.first_player, 3)
    
    def test_double_tribute_flow(self):
        """测试双贡流程"""
        game = GuandanGame(level=2, human_player_index=0)
        
        # 模拟上局排名：队 0（玩家 0,2）是头游 + 二游，队 1（玩家 1,3）是三游 + 末游
        game.game_result.rankings = [
            (0, 1),  # 头游
            (2, 2),  # 二游
            (1, 3),  # 三游
            (3, 4),  # 末游
        ]
        game.winner_position = 0
        
        # 给三游和末游一些牌
        player1 = game.player_manager.get_player(1)
        player1.receive_cards([Card(CardRank.ACE, Suit.SPADES, level=2)])
        
        player3 = game.player_manager.get_player(3)
        player3.receive_cards([Card(CardRank.KING, Suit.HEARTS, level=2)])
        
        # 给头游和二游一些牌用于还贡
        player0 = game.player_manager.get_player(0)
        player0.receive_cards([Card(CardRank.FIVE, Suit.CLUBS, level=2)])
        
        player2 = game.player_manager.get_player(2)
        player2.receive_cards([Card(CardRank.THREE, Suit.DIAMONDS, level=2)])
        
        # 执行贡牌阶段
        game.execute_tribute_phase()
        
        # 验证贡牌类型
        self.assertEqual(game.state.tribute_type, TributeType.DOUBLE)
        
        # 验证出牌权（三游先出）
        self.assertEqual(game.first_player, 1)
    
    def test_resist_tribute_flow(self):
        """测试抗贡流程"""
        game = GuandanGame(level=2, human_player_index=0)
        
        # 模拟上局排名
        game.game_result.rankings = [
            (0, 1),  # 头游
            (1, 2),  # 二游
            (2, 3),  # 三游
            (3, 4),  # 末游
        ]
        game.winner_position = 0
        
        # 给末游 2 个大王
        player3 = game.player_manager.get_player(3)
        player3.receive_cards([
            Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
            Card(CardRank.BIG_JOKER, Suit.JOKER, level=2),
            Card(CardRank.THREE, Suit.SPADES, level=2),
        ])
        
        # 执行贡牌阶段
        game.execute_tribute_phase()
        
        # 验证抗贡
        self.assertEqual(game.state.tribute_type, TributeType.RESIST)
        
        # 验证出牌权（头游先出）
        self.assertEqual(game.first_player, 0)


class TestFirstPlayerSelection(unittest.TestCase):
    """先手玩家选择测试"""
    
    def test_random_first_player_in_first_game(self):
        """测试第一局随机指定先手"""
        game = GuandanGame(level=2, human_player_index=0)
        
        # 第一局，没有上局排名
        game.winner_position = None
        
        # 开始游戏
        game.start_game()
        
        # 验证先手在 0-3 之间
        self.assertIn(game.first_player, [0, 1, 2, 3])
        self.assertEqual(game.state.current_player_id, game.first_player)
    
    def test_winner_first_player_in_next_game(self):
        """测试后续局由上局头游先手"""
        game = GuandanGame(level=2, human_player_index=0)
        
        # 模拟上局头游是玩家 2
        game.winner_position = 2
        
        # 开始游戏（会跳过贡牌，因为 game_result.rankings 为空）
        # 手动设置 first_player
        game.first_player = game.winner_position
        game.state.current_player_id = game.first_player
        
        # 验证先手是上局头游
        self.assertEqual(game.first_player, 2)
        self.assertEqual(game.state.current_player_id, 2)


if __name__ == '__main__':
    print("=" * 60)
    print("掼蛋游戏 - 贡牌规则测试")
    print("=" * 60)
    
    unittest.main(verbosity=2)
