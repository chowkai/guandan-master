#!/usr/bin/env python3
"""
掼蛋游戏 - AI 对战测试脚本

运行多场 AI 对战，统计结果并生成测试报告。

使用方法:
    python3 tests/test_ai_battle.py [--games 100] [--show False]

参数:
    --games: 对战场数 (默认 100)
    --show: 是否显示每局详情 (默认 False)

作者：代码虾
创建日期：2026-03-20
"""

import sys
import argparse
import random
from collections import Counter
from typing import List, Dict, Tuple

# 添加项目路径
sys.path.insert(0, '/home/zhoukai/openclaw/workspace/projects/guandan/src')

from game.cards import Card, CardRank, Suit, create_standard_deck
from game.game import GuandanGame, GamePhase
from game.player import PlayerType, Player


class AIBattleTester:
    """AI 对战测试器"""
    
    def __init__(self, num_games: int = 100, show_details: bool = False):
        """
        初始化测试器
        
        Args:
            num_games: 对战场数
            show_details: 是否显示每局详情
        """
        self.num_games = num_games
        self.show_details = show_details
        
        # 统计结果
        self.results = {
            'total_games': 0,
            'team0_wins': 0,
            'team1_wins': 0,
            'head_you': Counter(),  # 头游统计
            'level_up_count': Counter(),  # 升级数统计
            'game_lengths': [],  # 每局出牌轮数
        }
    
    def run_battle(self, ai_config: List[str]) -> Dict:
        """
        运行一场 AI 对战
        
        Args:
            ai_config: AI 配置列表，如 ["easy", "medium", "easy", "medium"]
            
        Returns:
            对局结果字典
        """
        # 创建游戏
        game = GuandanGame(level=2, human_player_index=-1)
        
        # 设置 AI 配置
        ai_types = {
            'easy': PlayerType.AI_EASY,
            'medium': PlayerType.AI_MEDIUM,
            'hard': PlayerType.AI_HARD
        }
        
        for i, player in enumerate(game.player_manager.players):
            if i < len(ai_config):
                ai_type = ai_config[i]
                player.player_type = ai_types.get(ai_type, PlayerType.AI_MEDIUM)
                player.name = f"AI-{ai_type[:4].upper()}"
        
        # 开始游戏
        game.start_game()
        
        if self.show_details:
            print(f"\n{'='*60}")
            print(f"第 {self.results['total_games'] + 1} 局")
            print(f"{'='*60}")
        
        # 模拟出牌
        max_rounds = 500  # 防止无限循环
        rounds = 0
        
        while not game.is_game_over() and rounds < max_rounds:
            current_player = game.get_current_player()
            
            if current_player.is_finished():
                game.next_player()
                continue
            
            # 获取 AI 决策
            hand = current_player.get_sorted_hand()
            
            if not hand:
                game.next_player()
                continue
            
            # 获取游戏状态
            last_cards = game.state.last_played_cards
            last_player = game.state.last_played_player
            
            # 根据 AI 类型获取决策
            if current_player.player_type == PlayerType.AI_EASY:
                from ai.easy_ai import EasyAI
                ai = EasyAI(current_player.player_id, game.level)
            elif current_player.player_type == PlayerType.AI_MEDIUM:
                from ai.medium_ai import MediumAI
                ai = MediumAI(current_player.player_id, game.level)
            else:  # HARD
                from ai.hard_ai import HardAI
                ai = HardAI(current_player.player_id, game.level)
            
            # 获取队友和对手信息
            teammate_id = current_player.get_teammate_id()
            teammate = game.player_manager.get_player(teammate_id)
            opponents = [p for p in game.player_manager.players 
                        if p.player_id != current_player.player_id 
                        and p.player_id != teammate_id]
            
            # AI 决策
            choice = ai.decide_play(
                hand=hand,
                last_played_cards=last_cards,
                last_played_player=last_player,
                teammates_hand_count=len(teammate.hand) if teammate else 27,
                opponents_hand_counts=[len(p.hand) for p in opponents]
            )
            
            if choice and len(choice) > 0:
                # 出牌
                success = game.play_cards(current_player.player_id, choice)
                if not success:
                    # 出牌失败，选择不出
                    game.pass_turn(current_player.player_id)
            else:
                # 不出
                if last_player is not None and last_player != current_player.player_id:
                    game.pass_turn(current_player.player_id)
                else:
                    # 自由出牌，必须出
                    game.play_cards(current_player.player_id, [hand[0]])
            
            rounds += 1
        
        # 记录结果
        result = {
            'winner_team': game.game_result.winner_team,
            'rankings': game.game_result.rankings,
            'level_up': game.game_result.level_up,
            'level_up_count': game.game_result.level_up_count,
            'rounds': rounds
        }
        
        if self.show_details:
            game.display_result()
        
        return result
    
    def update_statistics(self, result: Dict):
        """
        更新统计结果
        
        Args:
            result: 对局结果
        """
        self.results['total_games'] += 1
        
        # 统计获胜队伍
        if result['winner_team'] == 0:
            self.results['team0_wins'] += 1
        else:
            self.results['team1_wins'] += 1
        
        # 统计头游
        for player_id, rank in result['rankings']:
            if rank == 1:
                self.results['head_you'][player_id] += 1
        
        # 统计升级数
        if result['level_up']:
            self.results['level_up_count'][result['level_up_count']] += 1
        
        # 记录游戏长度
        self.results['game_lengths'].append(result['rounds'])
    
    def run_all_tests(self, ai_config: List[str] = None):
        """
        运行所有测试
        
        Args:
            ai_config: AI 配置，默认 ["easy", "medium", "easy", "medium"]
        """
        if ai_config is None:
            ai_config = ["easy", "medium", "easy", "medium"]
        
        print(f"\n{'='*60}")
        print(f"AI 对战测试")
        print(f"{'='*60}")
        print(f"配置：{ai_config}")
        print(f"场数：{self.num_games}")
        print(f"{'='*60}\n")
        
        for i in range(self.num_games):
            result = self.run_battle(ai_config)
            self.update_statistics(result)
            
            # 进度显示
            if (i + 1) % 10 == 0:
                print(f"已完成 {i + 1}/{self.num_games} 局")
        
        # 显示统计报告
        self.print_report()
    
    def print_report(self):
        """打印测试报告"""
        print(f"\n{'='*60}")
        print(f"AI 对战测试报告")
        print(f"{'='*60}\n")
        
        # 基本信息
        print(f"总场数：{self.results['total_games']}")
        print(f"\n获胜统计:")
        print(f"  队 0 胜：{self.results['team0_wins']} ({self.results['team0_wins']/self.results['total_games']*100:.1f}%)")
        print(f"  队 1 胜：{self.results['team1_wins']} ({self.results['team1_wins']/self.results['total_games']*100:.1f}%)")
        
        # 头游统计
        print(f"\n头游统计:")
        for player_id, count in sorted(self.results['head_you'].items()):
            percentage = count / self.results['total_games'] * 100
            print(f"  玩家{player_id}: {count}次 ({percentage:.1f}%)")
        
        # 升级统计
        print(f"\n升级统计:")
        for level_count, games in sorted(self.results['level_up_count'].items()):
            percentage = games / self.results['total_games'] * 100
            print(f"  升{level_count}级：{games}场 ({percentage:.1f}%)")
        
        # 不升级的场数
        no_level_up = self.results['total_games'] - sum(self.results['level_up_count'].values())
        if no_level_up > 0:
            percentage = no_level_up / self.results['total_games'] * 100
            print(f"  不升级：{no_level_up}场 ({percentage:.1f}%)")
        
        # 游戏长度统计
        if self.results['game_lengths']:
            avg_length = sum(self.results['game_lengths']) / len(self.results['game_lengths'])
            min_length = min(self.results['game_lengths'])
            max_length = max(self.results['game_lengths'])
            print(f"\n游戏长度统计:")
            print(f"  平均轮数：{avg_length:.1f}")
            print(f"  最少轮数：{min_length}")
            print(f"  最多轮数：{max_length}")
        
        print(f"\n{'='*60}")
        print(f"测试完成!")
        print(f"{'='*60}\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='AI 对战测试')
    parser.add_argument('--games', type=int, default=100, help='对战场数')
    parser.add_argument('--show', type=bool, default=False, help='是否显示每局详情')
    parser.add_argument('--config', type=str, default='easy,medium,easy,medium',
                       help='AI 配置 (逗号分隔)')
    
    args = parser.parse_args()
    
    # 解析 AI 配置
    ai_config = [x.strip() for x in args.config.split(',')]
    
    # 创建测试器
    tester = AIBattleTester(num_games=args.games, show_details=args.show)
    
    # 运行测试
    tester.run_all_tests(ai_config)


if __name__ == "__main__":
    main()
