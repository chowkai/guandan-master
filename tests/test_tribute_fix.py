"""
掼蛋游戏 v1.1 - 贡牌规则修正测试

验证：
1. 出牌权规则：贡牌后由进贡方先出牌，抗贡由头游先出牌
"""

import sys
sys.path.insert(0, 'src')

from game.game import GuandanGame, TributeType
from game.cards import Card, CardRank, Suit
from game.player import Player, PlayerType


def test_tribute_turn_order_single():
    """测试单贡后出牌权（进贡方先出）"""
    print("\n=== 测试 1: 单贡后出牌权 ===\n")
    
    game = GuandanGame(level=2, human_player_index=0)
    
    # 手动设置排名
    game.game_result.rankings = [(0, 1), (1, 2), (2, 3), (3, 4)]
    game.winner_position = 0
    
    # 确保末游没有 2 个大王（避免抗贡）
    mo_you = game.player_manager.get_player(3)
    mo_you.hand.cards = [c for c in mo_you.hand.cards if c.rank != CardRank.BIG_JOKER]
    
    # 执行贡牌阶段
    print("执行单贡...")
    game.execute_tribute_phase()
    
    # 验证：单贡后由进贡方（末游，玩家 3）先出牌
    print(f"贡牌类型：{game.state.tribute_type.value}")
    print(f"先手玩家：{game.first_player}")
    
    # 单贡：末游（玩家 3）进贡给头游（玩家 0），然后末游先出牌
    assert game.state.tribute_type == TributeType.SINGLE, f"应该是单贡，实际是{game.state.tribute_type.value}"
    assert game.first_player == 3, f"单贡后应该由进贡方（末游，玩家 3）先出牌，实际是玩家{game.first_player}"
    
    print("✓ 单贡后由进贡方（末游）先出牌")
    print()


def test_tribute_turn_order_double():
    """测试双贡后出牌权（三游先出）"""
    print("\n=== 测试 2: 双贡后出牌权 ===\n")
    
    game = GuandanGame(level=2, human_player_index=0)
    
    # 模拟上局排名：两队分别包揽前 2 和后 2
    # 玩家 0 头游，玩家 2 二游（同队），玩家 1 三游，玩家 3 末游（同队）
    game.game_result.rankings = [(0, 1), (2, 2), (1, 3), (3, 4)]
    game.winner_position = 0
    
    # 确保三游和末游没有 2 个大王（避免抗贡）
    san_you = game.player_manager.get_player(1)
    mo_you = game.player_manager.get_player(3)
    san_you.hand.cards = [c for c in san_you.hand.cards if c.rank != CardRank.BIG_JOKER]
    mo_you.hand.cards = [c for c in mo_you.hand.cards if c.rank != CardRank.BIG_JOKER]
    
    # 执行贡牌阶段
    print("执行双贡...")
    game.execute_tribute_phase()
    
    # 验证：双贡后由进贡方（三游，玩家 1）先出牌
    print(f"贡牌类型：{game.state.tribute_type.value}")
    print(f"先手玩家：{game.first_player}")
    
    assert game.state.tribute_type == TributeType.DOUBLE, f"应该是双贡，实际是{game.state.tribute_type.value}"
    assert game.first_player == 1, f"双贡后应该由进贡方（三游，玩家 1）先出牌，实际是玩家{game.first_player}"
    
    print("✓ 双贡后由进贡方（三游）先出牌")
    print()


def test_resist_tribute_turn_order():
    """测试抗贡后出牌权（头游先出）"""
    print("\n=== 测试 3: 抗贡后出牌权 ===\n")
    
    game = GuandanGame(level=2, human_player_index=0)
    
    # 模拟上局排名
    game.game_result.rankings = [(0, 1), (1, 2), (2, 3), (3, 4)]
    game.winner_position = 0
    
    # 给末游（玩家 3）添加 2 个大王
    mo_you = game.player_manager.get_player(3)
    big_joker = Card(CardRank.BIG_JOKER, Suit.JOKER, 2)
    mo_you.hand.cards = [big_joker, big_joker]
    
    # 执行贡牌阶段
    print("执行抗贡...")
    game.execute_tribute_phase()
    
    # 验证：抗贡后由头游（玩家 0）先出牌
    print(f"贡牌类型：{game.state.tribute_type.value}")
    print(f"先手玩家：{game.first_player}")
    
    assert game.state.tribute_type == TributeType.RESIST, "应该触发抗贡"
    assert game.first_player == 0, f"抗贡后应该由头游（玩家 0）先出牌，实际是玩家{game.first_player}"
    
    print("✓ 抗贡后由头游先出牌")
    print()


def test_double_resist_tribute():
    """测试双贡抗贡"""
    print("\n=== 测试 4: 双贡抗贡 ===\n")
    
    game = GuandanGame(level=2, human_player_index=0)
    
    # 双贡排名
    game.game_result.rankings = [(0, 1), (2, 2), (1, 3), (3, 4)]
    game.winner_position = 0
    
    # 给三游和末游共 2 个大王
    san_you = game.player_manager.get_player(1)
    mo_you = game.player_manager.get_player(3)
    big_joker = Card(CardRank.BIG_JOKER, Suit.JOKER, 2)
    san_you.hand.cards = [big_joker]
    mo_you.hand.cards = [big_joker]
    
    # 执行贡牌阶段
    print("执行双贡抗贡...")
    game.execute_tribute_phase()
    
    # 验证：抗贡后由头游先出牌
    print(f"贡牌类型：{game.state.tribute_type.value}")
    print(f"先手玩家：{game.first_player}")
    
    assert game.state.tribute_type == TributeType.RESIST, "应该触发双贡抗贡"
    assert game.first_player == 0, f"抗贡后应该由头游（玩家 0）先出牌，实际是玩家{game.first_player}"
    
    print("✓ 双贡抗贡后由头游先出牌")
    print()


def test_tribute_card_selection():
    """测试进贡牌选择（排除红心级牌）"""
    print("\n=== 测试 5: 进贡牌选择 ===\n")
    
    from game.deck import Deck
    
    player = Player(0, '测试', PlayerType.HUMAN, 2)
    deck = Deck(level=2)
    deck.shuffle()
    player.receive_cards(deck.deal(27))
    
    # 选择进贡牌
    tribute_card = player.select_tribute_card(2)
    
    if tribute_card:
        print(f"选择的进贡牌：{tribute_card}")
        print(f"  是否为红心级牌：{tribute_card.is_level_card and tribute_card.suit == Suit.HEARTS}")
        
        # 验证不是红心级牌
        is_red_heart_level = tribute_card.is_level_card and tribute_card.suit == Suit.HEARTS
        assert not is_red_heart_level, "进贡牌不能是红心级牌"
        
        print("✓ 进贡牌选择正确（排除红心级牌）")
    else:
        print("✗ 没有选择到进贡牌")
    
    print()


def test_return_card_selection():
    """测试还贡牌选择（≤10 的最小数）"""
    print("\n=== 测试 6: 还贡牌选择 ===\n")
    
    from game.deck import Deck
    
    player = Player(0, '测试', PlayerType.HUMAN, 2)
    deck = Deck(level=2)
    deck.shuffle()
    player.receive_cards(deck.deal(27))
    
    # 选择还贡牌
    return_card = player.select_return_card(2)
    
    if return_card:
        print(f"选择的还贡牌：{return_card}")
        print(f"  牌面值：{return_card.rank.value}")
        
        # 验证≤10
        assert return_card.rank.value <= 10, f"还贡牌应该≤10，实际是{return_card.rank.value}"
        
        print("✓ 还贡牌选择正确（≤10）")
    else:
        print("ℹ 没有≤10 的牌可还贡")
    
    print()


if __name__ == "__main__":
    print("=" * 60)
    print("掼蛋游戏 v1.1 - 贡牌规则修正测试")
    print("验证：出牌权规则（进贡方先出，抗贡头游先出）")
    print("=" * 60)
    
    try:
        test_tribute_turn_order_single()
        test_tribute_turn_order_double()
        test_resist_tribute_turn_order()
        test_double_resist_tribute()
        test_tribute_card_selection()
        test_return_card_selection()
        
        print("=" * 60)
        print("✅ 所有测试通过！出牌权规则正确！")
        print("=" * 60)
        print("\n规则总结：")
        print("  - 单贡：末游进贡 → 末游先出牌")
        print("  - 双贡：三游、末游进贡 → 三游先出牌")
        print("  - 抗贡：跳过贡牌 → 头游先出牌")
        print()
    except AssertionError as e:
        print(f"\n❌ 测试失败：{e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 测试出错：{e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
