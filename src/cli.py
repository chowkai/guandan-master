#!/usr/bin/env python3
"""
掼蛋游戏 - 命令行界面

提供命令行交互界面，支持人类玩家与 AI 对战。

使用方法:
    python cli.py [--level 2] [--position 0]

参数:
    --level: 初始级数 (默认 2)
    --position: 人类玩家位置 0-3 (默认 0)

作者：代码虾
创建日期：2026-03-20
"""

import sys
import argparse
from typing import List, Optional

# 添加项目路径
sys.path.insert(0, '/home/zhoukai/openclaw/workspace/projects/guandan/src')

from game.cards import Card, CardRank, Suit
from game.game import GuandanGame, GamePhase
from game.player import PlayerType


class CLI:
    """
    命令行界面类
    
    提供用户交互、输入解析、显示等功能
    """
    
    def __init__(self, level: int = 2, human_position: int = 0):
        """
        初始化 CLI
        
        Args:
            level: 初始级数
            human_position: 人类玩家位置
        """
        self.level = level
        self.human_position = human_position
        self.game: Optional[GuandanGame] = None
        self.running = False
    
    def start(self):
        """启动游戏"""
        print("\n" + "=" * 60)
        print(" " * 18 + "掼蛋大师")
        print(" " * 15 + "Guandan Master v1.0")
        print("=" * 60)
        print("\n欢迎游玩掼蛋！")
        print(f"当前级数：打 {self.level}")
        print(f"你的位置：玩家 {self.human_position}")
        print("\n游戏规则简述:")
        print("  - 4 人游戏，对家为队友")
        print("  - 尽快出完手牌，争取头游")
        print("  - 可以出相同牌型且更大的牌，或选择不出")
        print("  - 炸弹可以炸任何非炸弹牌型")
        print("  - 核弹 (6 张+) 可以炸同花顺")
        print("\n输入 'help' 查看帮助，'quit' 退出游戏\n")
        
        # 创建游戏
        self.game = GuandanGame(level=self.level, human_player_index=self.human_position)
        self.game.start_game()
        
        self.running = True
        self.game_loop()
    
    def game_loop(self):
        """游戏主循环"""
        while self.running and not self.game.is_game_over():
            current_player = self.game.get_current_player()
            
            print("\n" + "-" * 60)
            self.display_game_info()
            
            if current_player.player_type == PlayerType.HUMAN:
                # 人类玩家回合
                self.human_turn(current_player)
            else:
                # AI 玩家回合
                self.ai_turn(current_player)
        
        # 游戏结束
        if self.game.is_game_over():
            self.show_game_over()
    
    def display_game_info(self):
        """显示游戏信息"""
        state = self.game.get_game_state()
        
        print(f"\n【第 {self.level} 局】")
        print(f"当前出牌：{self.game.player_manager.players[state['current_player']].name}")
        
        # 显示最后出的牌
        if state['last_played'] is not None:
            last_player = self.game.player_manager.players[state['last_played']]
            last_cards = self.game.state.last_played_cards
            print(f"最后出牌：{last_player.name} - {last_cards}")
        else:
            print("最后出牌：无 (新的一轮)")
        
        # 显示各玩家手牌数
        print("\n手牌情况:")
        for player in self.game.player_manager:
            if player.player_type == PlayerType.HUMAN:
                cards_str = ", ".join(str(c) for c in player.get_sorted_hand()[:10])
                if len(player.hand) > 10:
                    cards_str += f" ... (共{len(player.hand)}张)"
                print(f"  你：{len(player.hand)}张 [{cards_str}]")
            else:
                status = "✓" if player.is_finished() else ""
                print(f"  {player.name}: {len(player.hand)}张 {status}")
        
        # 显示已出完的玩家
        if state['finished_players']:
            finish_names = []
            for pid in state['finished_players']:
                player = self.game.player_manager.get_player(pid)
                order = len([p for p in state['finished_players'] if p < pid]) + 1
                finish_names.append(f"{player.name}(第{order}名)")
            print(f"\n已出完：{', '.join(finish_names)}")
    
    def human_turn(self, player):
        """人类玩家回合"""
        print(f"\n>>> 轮到你出牌 (手牌：{len(player.hand)}张)")
        
        while True:
            command = input("\n请输入指令 (出牌/不出/help/quit): ").strip().lower()
            
            if command in ['quit', 'exit', 'q']:
                self.running = False
                return
            
            if command in ['help', 'h', '?']:
                self.show_help()
                continue
            
            if command in ['pass', '过', '不出', 'p']:
                # 选择不出
                if self.game.state.last_played_player is None:
                    print("你是第一个出牌，不能过！请出牌。")
                    continue
                self.game.pass_turn(player.player_id)
                return
            
            if command in ['hand', '手牌', 'hs']:
                # 显示完整手牌
                self.show_hand(player)
                continue
            
            if command in ['sort', '排序']:
                # 重新排序手牌
                player.hand.sort()
                print("手牌已排序")
                continue
            
            # 尝试解析出牌
            if self.parse_and_play(command, player):
                return
    
    def parse_and_play(self, command: str, player) -> bool:
        """
        解析并执行出牌命令
        
        Args:
            command: 用户输入
            player: 当前玩家
            
        Returns:
            是否成功出牌
        """
        # 解析牌面
        cards_to_play = self.parse_cards(command, player.hand)
        
        if not cards_to_play:
            print("无法识别的牌，请重新输入。")
            return False
        
        # 验证手牌中是否有这些牌
        for card in cards_to_play:
            if card not in player.hand:
                print(f"你没有这张牌：{card}")
                return False
        
        # 出牌
        success = self.game.play_cards(player.player_id, cards_to_play)
        if success:
            return True
        else:
            return False
    
    def parse_cards(self, command: str, hand) -> List[Card]:
        """
        解析用户输入的牌
        
        Args:
            command: 用户输入，如 "A", "对 K", "33344"
            hand: 手牌
            
        Returns:
            牌列表
        """
        cards = []
        command = command.strip().upper()
        
        # 简单解析：按空格或逗号分割
        parts = command.replace(',', ' ').split()
        
        # 牌面映射
        rank_map = {
            '2': CardRank.TWO, '3': CardRank.THREE, '4': CardRank.FOUR,
            '5': CardRank.FIVE, '6': CardRank.SIX, '7': CardRank.SEVEN,
            '8': CardRank.EIGHT, '9': CardRank.NINE, '10': CardRank.TEN,
            'J': CardRank.JACK, 'Q': CardRank.QUEEN, 'K': CardRank.KING,
            'A': CardRank.ACE,
            '小王': CardRank.SMALL_JOKER, 'XW': CardRank.SMALL_JOKER,
            '大王': CardRank.BIG_JOKER, 'DW': CardRank.BIG_JOKER,
        }
        
        for part in parts:
            # 处理"对 X"、"三个 X"等
            if part.startswith('对') or part.startswith('D'):
                rank_str = part[1:].strip()
                if rank_str in rank_map:
                    rank = rank_map[rank_str]
                    # 找两张
                    count = 0
                    for card in hand:
                        if card.rank == rank and card not in cards:
                            cards.append(card)
                            count += 1
                            if count >= 2:
                                break
                continue
            
            if part.startswith('三') or part.startswith('S'):
                rank_str = part[1:].strip()
                if rank_str in rank_map:
                    rank = rank_map[rank_str]
                    count = 0
                    for card in hand:
                        if card.rank == rank and card not in cards:
                            cards.append(card)
                            count += 1
                            if count >= 3:
                                break
                continue
            
            # 普通牌面
            if part in rank_map:
                rank = rank_map[part]
                # 找一张
                for card in hand:
                    if card.rank == rank and card not in cards:
                        cards.append(card)
                        break
        
        return cards
    
    def show_hand(self, player):
        """显示完整手牌"""
        print("\n你的手牌:")
        sorted_hand = player.get_sorted_hand()
        
        # 按牌面值分组显示
        rank_groups = {}
        for card in sorted_hand:
            rank_str = str(card.rank)
            if rank_str not in rank_groups:
                rank_groups[rank_str] = []
            rank_groups[rank_str].append(card)
        
        for rank_str in sorted(rank_groups.keys(), reverse=True):
            group = rank_groups[rank_str]
            cards_str = " ".join(str(c) for c in group)
            print(f"  {rank_str}: {cards_str}")
    
    def ai_turn(self, player):
        """AI 玩家回合（简化版：随机出牌）"""
        import time
        time.sleep(1)  # 模拟思考
        
        print(f"\n>>> {player.name} 思考中...")
        
        # 简单 AI：如果有能出的牌就出，否则过
        if player.hand:
            # 尝试出最小的单张
            card = player.hand[0]  # 手牌已排序，这是最小的
            
            # 如果有上一手牌，检查能否打过
            if self.game.state.last_played_cards:
                if not self.game.rules_engine.can_beat([card], self.game.state.last_played_cards):
                    # 打不过，选择过
                    self.game.pass_turn(player.player_id)
                    return
            
            # 出牌
            self.game.play_cards(player.player_id, [card])
        else:
            self.game.pass_turn(player.player_id)
    
    def show_help(self):
        """显示帮助信息"""
        print("\n=== 帮助 ===")
        print("出牌指令:")
        print("  单张：直接输入牌面，如 'A', 'K', '10', '小王'")
        print("  对子：'对 A', '对 K', 或 'AA', 'KK'")
        print("  三张：'三个 K', 'KKK'")
        print("  多张：用空格分隔，如 'A K Q'")
        print("\n其他指令:")
        print("  过/不出/pass - 选择不出")
        print("  手牌/hs - 查看完整手牌")
        print("  排序/sort - 重新排序手牌")
        print("  帮助/help - 显示帮助")
        print("  退出/quit - 退出游戏")
        print("=============\n")
    
    def show_game_over(self):
        """显示游戏结束"""
        print("\n" + "=" * 60)
        print("游戏结束！")
        print("=" * 60)
        
        # 显示排名
        print("\n最终排名:")
        rank_names = {1: "头游 🏆", 2: "二游 🥈", 3: "三游 🥉", 4: "末游"}
        for player_id, rank in sorted(self.game.game_result.rankings, key=lambda x: x[1]):
            player = self.game.player_manager.get_player(player_id)
            marker = "← 你" if player.player_type == PlayerType.HUMAN else ""
            print(f"  第{rank}名 {rank_names[rank]}: {player.name} {marker}")
        
        print(f"\n获胜队伍：队{self.game.game_result.winner_team}")
        
        if self.game.game_result.level_up:
            print(f"升级：+{self.game.game_result.level_up_count} 级")
            print(f"下一级：打 {self.game.game_result.next_level}")
            
            # 询问是否继续
            if self.game.game_result.next_level <= 14:
                cont = input("\n是否继续下一局？(y/n): ").strip().lower()
                if cont in ['y', 'yes', '是']:
                    self.start_next_game()
        else:
            print("不升级，继续打当前级")
    
    def start_next_game(self):
        """开始下一局游戏"""
        next_level = self.game.get_next_level()
        print(f"\n开始第 {next_level} 局...\n")
        
        self.level = next_level
        self.game = GuandanGame(level=self.level, human_player_index=self.human_position)
        self.game.start_game()
        self.game_loop()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='掼蛋大师 - 命令行版')
    parser.add_argument('--level', type=int, default=2, help='初始级数 (默认：2)')
    parser.add_argument('--position', type=int, default=0, choices=[0, 1, 2, 3],
                       help='人类玩家位置 (默认：0)')
    
    args = parser.parse_args()
    
    # 创建并启动 CLI
    cli = CLI(level=args.level, human_position=args.position)
    cli.start()


if __name__ == "__main__":
    main()
