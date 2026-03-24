/**
 * 游戏页面
 * 完整游戏界面
 */
interface IGameData {
  mode: string;
  players: any[];
  myCards: any[];
  selectedCards: any[];
  currentPlay: any[];
  playHistory: any[];
  canPlay: boolean;
  gameStatus: string;
  currentPlayer: number;
}

Page<IGameData>({
  data: {
    mode: 'single',
    players: [],
    myCards: [],
    selectedCards: [],
    currentPlay: [],
    playHistory: [],
    canPlay: false,
    gameStatus: 'waiting',
    currentPlayer: 0
  },

  onLoad(options) {
    const mode = options.mode || 'single';
    this.setData({ mode });
    console.log('游戏页面加载，模式:', mode);
    
    this.initGame();
  },

  onShow() {
    // 页面显示
  },

  onHide() {
    // 页面隐藏
  },

  onUnload() {
    // 页面卸载
  },

  /**
   * 初始化游戏
   */
  initGame() {
    // 初始化玩家
    this.initPlayers();
    
    // 初始化牌局
    this.dealCards();
    
    // 设置游戏状态
    this.setData({
      gameStatus: 'playing',
      currentPlayer: 0
    });
  },

  /**
   * 初始化玩家
   */
  initPlayers() {
    const players = [
      {
        playerId: 'player1',
        playerName: '我',
        avatarUrl: '',
        cardCount: 27,
        isSelf: true,
        isLandlord: false,
        position: 'bottom'
      },
      {
        playerId: 'player2',
        playerName: '上家',
        avatarUrl: '',
        cardCount: 27,
        isSelf: false,
        isLandlord: false,
        position: 'left'
      },
      {
        playerId: 'player3',
        playerName: '对家',
        avatarUrl: '',
        cardCount: 27,
        isSelf: false,
        isLandlord: false,
        position: 'top'
      },
      {
        playerId: 'player4',
        playerName: '下家',
        avatarUrl: '',
        cardCount: 27,
        isSelf: false,
        isLandlord: false,
        position: 'right'
      }
    ];
    
    this.setData({ players });
  },

  /**
   * 发牌
   */
  dealCards() {
    // 模拟发牌 - 实际应从游戏逻辑获取
    const myCards = this.generateSampleCards();
    this.setData({ myCards });
  },

  /**
   * 生成示例手牌
   */
  generateSampleCards(): any[] {
    const suits = ['heart', 'diamond', 'spade', 'club'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cards: any[] = [];
    
    // 生成示例牌
    for (let i = 0; i < 27; i++) {
      const suit = suits[i % 4];
      const value = values[i % 13];
      cards.push({ 
        suit, 
        value,
        id: `card_${i}` // 添加唯一 ID
      });
    }
    
    // 添加王牌
    cards.push({ suit: 'joker', value: 'BJ', id: 'bj' });
    cards.push({ suit: 'joker', value: 'RJ', id: 'rj' });
    
    console.log('生成的手牌:', cards.length, cards);
    return cards;
  },

  /**
   * 处理选牌
   */
  onCardSelect(event: WechatMiniprogram.CustomEvent) {
    const { suit, value, isSelected } = event.detail;
    const { selectedCards } = this.data;
    
    let newSelectedCards;
    if (isSelected) {
      newSelectedCards = [...selectedCards, { suit, value }];
    } else {
      newSelectedCards = selectedCards.filter(
        card => !(card.suit === suit && card.value === value)
      );
    }
    
    this.setData({ selectedCards: newSelectedCards });
  },

  /**
   * 出牌
   */
  onPlayCards() {
    const { selectedCards, canPlay } = this.data;
    
    if (!canPlay || selectedCards.length === 0) {
      wx.showToast({
        title: '请选择要出的牌',
        icon: 'none'
      });
      return;
    }
    
    // 出牌逻辑
    console.log('出牌:', selectedCards);
    
    // 更新手牌
    const { myCards } = this.data;
    const newMyCards = myCards.filter(card => 
      !selectedCards.some(selected => 
        selected.suit === card.suit && selected.value === card.value
      )
    );
    
    // 更新出牌记录
    const { playHistory } = this.data;
    const newPlayHistory = [
      ...playHistory,
      {
        round: playHistory.length + 1,
        playerName: '我',
        playType: this.detectPlayType(selectedCards),
        cards: selectedCards
      }
    ];
    
    this.setData({
      myCards: newMyCards,
      selectedCards: [],
      currentPlay: selectedCards,
      playHistory: newPlayHistory,
      canPlay: false
    });
    
    // 模拟其他玩家出牌
    setTimeout(() => {
      this.simulateOtherPlayerPlay();
    }, 2000);
  },

  /**
   * 不出
   */
  onPass() {
    console.log('不出');
    this.setData({ canPlay: false });
    
    // 轮到下家
    this.nextPlayer();
  },

  /**
   * 提示
   */
  onHint() {
    console.log('提示');
    // TODO: 实现提示逻辑
  },

  /**
   * 检测牌型
   */
  detectPlayType(cards: any[]): string {
    if (cards.length === 1) return 'single';
    if (cards.length === 2 && cards[0].value === cards[1].value) return 'pair';
    if (cards.length >= 5) return 'straight';
    return 'custom';
  },

  /**
   * 模拟其他玩家出牌
   */
  simulateOtherPlayerPlay() {
    // 模拟逻辑
    this.setData({
      canPlay: true,
      currentPlayer: 0
    });
  },

  /**
   * 下一个玩家
   */
  nextPlayer() {
    const { currentPlayer } = this.data;
    const next = (currentPlayer + 1) % 4;
    this.setData({ currentPlayer: next });
  }
});
