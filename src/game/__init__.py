"""
掼蛋游戏 - 游戏核心模块

包含：
- cards: 卡牌类
- deck: 牌堆类
- player: 玩家类
- rules: 规则判断
- game: 游戏主循环
"""

from .cards import Card, CardRank, Suit, CardCollection, create_standard_deck
from .deck import Deck, DiscardPile
from .player import Player, PlayerManager, PlayerType, PlayerStatus
from .rules import RulesEngine, CardType, HandResult
from .game import GuandanGame, GamePhase, GameResult

__all__ = [
    'Card', 'CardRank', 'Suit', 'CardCollection', 'create_standard_deck',
    'Deck', 'DiscardPile',
    'Player', 'PlayerManager', 'PlayerType', 'PlayerStatus',
    'RulesEngine', 'CardType', 'HandResult',
    'GuandanGame', 'GamePhase', 'GameResult'
]
