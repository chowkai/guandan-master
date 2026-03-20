#!/usr/bin/env python3
"""
掼蛋游戏 - AI 单元测试

测试所有 AI 等级的功能和表现。

运行方式:
    cd /home/zhoukai/openclaw/workspace/projects/guandan
    python -m pytest tests/test_ai.py -v

作者：代码虾
创建日期：2026-03-20
"""

import sys
import unittest
import random

# 添加项目路径
sys.path.insert(0, '/home/zhoukai/openclaw/workspace/projects/guandan/src')

from game.cards import Card, CardRank, Suit, create_standard_deck
from game.rules import RulesEngine, CardType
from ai.ai_base import CardMemory, AIPlayer
from ai.easy_ai import EasyAI
from ai.medium_ai import MediumAI
from ai.hard_ai import HardAI


class TestCardMemory(unittest.TestCase):
    """记牌器测试"""
    
    def setUp(self):
        self.memory = CardMemory(level=2)
    
    def test_record_play(self):
        """测试记录出牌"""
        cards = [
            Card(CardRank.ACE, Suit.SPADES, level=2),
            Card(CardRank.KING, Suit.HEARTS, level=2),
        ]
        self.memory.record_play(0, cards)
        
        self.assertEqual(len(self.memory.played_cards), 2)
        self.assertEqual(self.memory.get_remaining_count(CardRank.ACE), 7)
        self.assertEqual(self.memory.get_remaining_count(CardRank.KING), 7)
    
    def test_key_cards_remaining(self):
        """测试关键牌剩余"""
        # 记录一些牌
        self.memory.record_play(0, [Card(CardRank.ACE, Suit.SPADES, level=2)])
        self.memory.record_play(1, [Card(CardRank.BIG_JOKER, Suit.JOKER, level=2)])
        
        key_cards = self.memory.get_key_cards_remaining()
        
        self.assertIn(f"级牌 ({self.memory.level})", key_cards)
        self.assertIn("大王", key_cards)
        self.assertEqual(key_cards["大王"], 1)  # 出了 1 张大王
    
    def test_get_played_by_player(self):
        """测试按玩家查询出牌"""
        cards1 = [Card(CardRank.ACE, Suit.SPADES, level=2)]
        cards2 = [Card(CardRank.KING, Suit.HEARTS, level=2)]
        
        self.memory.record_play(0, cards1)
        self.memory.record_play(1, cards2)
        
        played_0 = self.memory.get_played_by_player(0)
        played_1 = self.memory.get_played_by_player(1)
        
        self.assertEqual(len(played_0), 1)
        self.assertEqual(len(played_1), 1)
        self.assertEqual(played_0[0].rank, CardRank.ACE)
        self.assertEqual(played_1[0].rank, CardRank.KING)


class TestEasyAI(unittest.TestCase):
    """简单 AI 测试"""
    
    def setUp(self):
        self.ai = EasyAI(player_id=0, level=2)
        deck = create_standard_deck(level=2)
        random.shuffle(deck)
        self.hand = deck[:27]
    
    def test_free_play(self):
        """测试自由出牌"""
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        
        self.assertIsNotNone(choice)
        self.assertTrue(len(choice) > 0)
        
        # 验证出的牌是有效的
        result = self.ai.analyze_hand(choice)
        self.assertTrue(result.is_valid)
    
    def test_follow_play(self):
        """测试跟牌"""
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        # 多次测试，因为简单 AI 有随机性
        choices = []
        for _ in range(10):
            choice = self.ai.decide_play(
                hand=self.hand,
                last_played_cards=last_cards,
                last_played_player=1,
                teammates_hand_count=20,
                opponents_hand_counts=[20, 20]
            )
            choices.append(choice)
        
        # 应该有部分选择出牌，部分选择不出
        played_count = sum(1 for c in choices if c is not None)
        self.assertGreater(played_count, 0)
    
    def test_valid_hand_only(self):
        """测试只出有效牌型"""
        for _ in range(20):
            choice = self.ai.decide_play(
                hand=self.hand,
                last_played_cards=None,
                last_played_player=None,
                teammates_hand_count=20,
                opponents_hand_counts=[20, 20]
            )
            
            result = self.ai.analyze_hand(choice)
            self.assertTrue(result.is_valid, f"出的牌无效：{choice}")


class TestMediumAI(unittest.TestCase):
    """中等 AI 测试"""
    
    def setUp(self):
        self.ai = MediumAI(player_id=0, level=2)
        deck = create_standard_deck(level=2)
        random.shuffle(deck)
        self.hand = deck[:27]
    
    def test_free_play_smart(self):
        """测试智能自由出牌"""
        # 正常情况
        choice1 = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        
        # 队友需要帮助
        choice2 = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=3,  # 队友快出完了
            opponents_hand_counts=[20, 20]
        )
        
        self.assertIsNotNone(choice1)
        self.assertIsNotNone(choice2)
        
        # 验证出的牌有效
        result1 = self.ai.analyze_hand(choice1)
        result2 = self.ai.analyze_hand(choice2)
        self.assertTrue(result1.is_valid)
        self.assertTrue(result2.is_valid)
    
    def test_follow_teammate(self):
        """测试跟队友的牌（不应该压）"""
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        # 队友手牌少，不应该压
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=last_cards,
            last_played_player=2,  # 队友
            teammates_hand_count=3,
            opponents_hand_counts=[20, 20]
        )
        
        # 中等 AI 在队友手牌少时应该不出
        self.assertIsNone(choice)
    
    def test_follow_opponent(self):
        """测试跟对手的牌"""
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=last_cards,
            last_played_player=1,  # 对手
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        
        # 如果出牌，必须能打过后牌
        if choice is not None:
            self.assertTrue(self.ai.can_beat(choice, last_cards))
    
    def test_suppress_opponent(self):
        """测试压制对手"""
        # 对手快出完了，应该积极压制
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=20,
            opponents_hand_counts=[3, 20]  # 一个对手只剩 3 张
        )
        
        self.assertIsNotNone(choice)
        result = self.ai.analyze_hand(choice)
        self.assertTrue(result.is_valid)


class TestHardAI(unittest.TestCase):
    """困难 AI 测试"""
    
    def setUp(self):
        self.ai = HardAI(player_id=0, level=2)
        deck = create_standard_deck(level=2)
        random.shuffle(deck)
        self.hand = deck[:27]
    
    def test_situation_analysis(self):
        """测试局势分析"""
        # 开局
        situation = self.ai._analyze_situation(
            self.hand,  # 27 张
            teammates_hand_count=20,
            opponents_hand_counts=[20, 20]
        )
        self.assertEqual(situation.value, "early")
        
        # 中局
        mid_hand = self.hand[:15]
        situation = self.ai._analyze_situation(
            mid_hand,
            teammates_hand_count=15,
            opponents_hand_counts=[15, 15]
        )
        self.assertEqual(situation.value, "mid")
        
        # 残局
        end_hand = self.hand[:5]
        situation = self.ai._analyze_situation(
            end_hand,
            teammates_hand_count=10,
            opponents_hand_counts=[10, 10]
        )
        self.assertEqual(situation.value, "end")
    
    def test_teammate_cooperation(self):
        """测试队友配合"""
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        # 队友手牌很少，绝对不压
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=last_cards,
            last_played_player=2,  # 队友
            teammates_hand_count=3,
            opponents_hand_counts=[20, 20]
        )
        
        self.assertIsNone(choice)
    
    def test_opponent_suppression(self):
        """测试对手压制"""
        # 对手危险，应该积极压制
        choice = self.ai.decide_play(
            hand=self.hand,
            last_played_cards=None,
            last_played_player=None,
            teammates_hand_count=20,
            opponents_hand_counts=[3, 20]
        )
        
        self.assertIsNotNone(choice)
        result = self.ai.analyze_hand(choice)
        self.assertTrue(result.is_valid)
    
    def test_bomb_usage(self):
        """测试炸弹使用策略"""
        # 残局且手牌少，应该用炸弹
        small_hand = [
            Card(CardRank.THREE, Suit.SPADES, level=2),
            Card(CardRank.THREE, Suit.HEARTS, level=2),
            Card(CardRank.THREE, Suit.CLUBS, level=2),
            Card(CardRank.THREE, Suit.DIAMONDS, level=2),
            Card(CardRank.FOUR, Suit.SPADES, level=2),
        ]
        
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        should_use = self.ai._should_use_bomb_strategically(
            small_hand,
            last_cards,
            self.ai._analyze_situation(small_hand, 10, [10, 10]),
            [10, 10]
        )
        
        # 残局且手牌少，应该用炸弹
        self.assertTrue(should_use)
    
    def test_optimal_play(self):
        """测试最优出牌计算"""
        # 手牌能组成一个牌型
        hand = [
            Card(CardRank.THREE, Suit.SPADES, level=2),
            Card(CardRank.THREE, Suit.HEARTS, level=2),
            Card(CardRank.THREE, Suit.CLUBS, level=2),
        ]
        
        optimal = self.ai.calculate_optimal_play(hand, None)
        
        # 应该能一手出完
        self.assertEqual(len(optimal), 3)
        result = self.ai.analyze_hand(optimal)
        self.assertTrue(result.is_valid)


class TestAILevelComparison(unittest.TestCase):
    """AI 等级对比测试"""
    
    def setUp(self):
        deck = create_standard_deck(level=2)
        random.shuffle(deck)
        self.hand = deck[:27]
        
        self.easy_ai = EasyAI(player_id=0, level=2)
        self.medium_ai = MediumAI(player_id=0, level=2)
        self.hard_ai = HardAI(player_id=0, level=2)
    
    def test_difficulty_difference(self):
        """测试不同难度的差异"""
        # 多次出牌，统计行为差异
        easy_plays = []
        medium_plays = []
        hard_plays = []
        
        for _ in range(20):
            easy = self.easy_ai.decide_play(
                self.hand, None, None, 20, [20, 20]
            )
            medium = self.medium_ai.decide_play(
                self.hand, None, None, 20, [20, 20]
            )
            hard = self.hard_ai.decide_play(
                self.hand, None, None, 20, [20, 20]
            )
            
            easy_plays.append(easy)
            medium_plays.append(medium)
            hard_plays.append(hard)
        
        # 所有 AI 都应该出有效牌
        for play in easy_plays:
            result = self.easy_ai.analyze_hand(play)
            self.assertTrue(result.is_valid)
        
        for play in medium_plays:
            result = self.medium_ai.analyze_hand(play)
            self.assertTrue(result.is_valid)
        
        for play in hard_plays:
            result = self.hard_ai.analyze_hand(play)
            self.assertTrue(result.is_valid)
    
    def test_cooperation_level(self):
        """测试配合意识"""
        last_cards = [Card(CardRank.TEN, Suit.SPADES, level=2)]
        
        # 测试队友手牌少时的反应
        easy_choice = self.easy_ai.decide_play(
            self.hand, last_cards, 2, 3, [20, 20]
        )
        medium_choice = self.medium_ai.decide_play(
            self.hand, last_cards, 2, 3, [20, 20]
        )
        hard_choice = self.hard_ai.decide_play(
            self.hand, last_cards, 2, 3, [20, 20]
        )
        
        # 困难 AI 最不可能压队友
        # 中等 AI 很可能不压
        # 简单 AI 可能随机出牌
        self.assertIsNone(hard_choice)
        self.assertIsNone(medium_choice)
        # 简单 AI 不确定（有随机性）


class TestAIIntegration(unittest.TestCase):
    """AI 集成测试"""
    
    def test_ai_vs_ai_game(self):
        """测试 AI 对战（简化版）"""
        from game.game import GuandanGame
        from game.player import PlayerType
        
        # 创建 4 个 AI 对战
        game = GuandanGame(level=2, human_player_index=-1)
        
        # 设置所有玩家为 AI
        for i, player in enumerate(game.player_manager.players):
            if i % 2 == 0:
                player.player_type = PlayerType.AI_EASY
            else:
                player.player_type = PlayerType.AI_MEDIUM
        
        # 开始游戏
        game.start_game()
        
        # 模拟出牌（简化，只出几轮）
        for _ in range(10):
            current = game.get_current_player()
            if current.is_finished():
                game.next_player()
                continue
            
            # AI 出牌
            ai = current.player_type
            hand = current.get_sorted_hand()
            
            if hand:
                # 出一张牌
                card = hand[0]
                game.play_cards(current.player_id, [card])
            
            if game.is_game_over():
                break
        
        # 游戏应该正常进行
        self.assertTrue(len(game.play_history) > 0)


# 运行测试

if __name__ == "__main__":
    unittest.main(verbosity=2)
