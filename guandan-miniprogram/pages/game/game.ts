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
  infoText: string; // 信息提示 - 修复 BUG-011
  isFirstTurn: boolean; // 是否首发 - 修复 BUG-011
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
    currentPlayer: 0,
    infoText: '', // 信息提示 - 修复 BUG-011
    isFirstTurn: false // 是否首发 - 修复 BUG-011
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
   * 初始化游戏 - 修复 BUG-011
   */
  initGame() {
    // 初始化玩家
    this.initPlayers();
    
    // 初始化牌局
    this.dealCards();
    
    // 随机指定首发玩家 - 修复 BUG-011
    const firstPlayer = Math.floor(Math.random() * 4);
    const firstPlayerName = firstPlayer === 0 ? '我' : `玩家${firstPlayer + 1}`;
    
    // 设置游戏状态
    this.setData({
      gameStatus: 'playing',
      currentPlayer: firstPlayer,
      infoText: `${firstPlayerName} 首发`, // 首发提示
      isFirstTurn: true // 高亮显示
    });
    
    // 3 秒后恢复正常显示
    setTimeout(() => {
      this.updateInfoText();
    }, 3000);
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
      cards.push({ suit, value });
    }
    
    // 添加王牌
    cards.push({ suit: 'joker', value: 'BJ' });
    cards.push({ suit: 'joker', value: 'RJ' });
    
    return cards;
  },

  /**
   * 处理选牌 - 修复 BUG-010
   */
  onCardSelect(event: WechatMiniprogram.CustomEvent) {
    const { cardId, suit, value, isSelected } = event.detail;
    const { selectedCards } = this.data;
    
    // 使用 cardId 进行选择
    if (isSelected) {
      // 选中：添加 cardId
      if (selectedCards.length >= 5) {
        wx.showToast({ title: '最多选 5 张牌', icon: 'none' });
        return;
      }
      selectedCards.push(cardId);
      console.log('选中卡牌:', cardId);
    } else {
      // 反选：移除 cardId
      const index = selectedCards.indexOf(cardId);
      if (index > -1) {
        selectedCards.splice(index, 1);
        console.log('反选卡牌:', cardId);
      }
    }
    
    this.setData({ selectedCards });
  },

  /**
   * 卡牌点击事件处理 - 修复 BUG-010
   */
  onCardTap(event: WechatMiniprogram.TouchEvent) {
    const { cardId } = event.currentTarget.dataset;
    if (!cardId) return;
    
    this.toggleCardSelection(cardId);
  },

  /**
   * 切换卡牌选中状态 - 修复 BUG-010
   * 选中：向上移动 12px
   * 反选：恢复原位
   */
  toggleCardSelection(cardId: string) {
    const { selectedCards, myCards } = this.data;
    const index = selectedCards.indexOf(cardId);
    
    if (index > -1) {
      // 反选：移除
      selectedCards.splice(index, 1);
      console.log('反选卡牌:', cardId);
    } else {
      // 选中：添加（最多 5 张）
      if (selectedCards.length >= 5) {
        wx.showToast({ title: '最多选 5 张牌', icon: 'none' });
        return;
      }
      selectedCards.push(cardId);
      console.log('选中卡牌:', cardId);
    }
    
    this.setData({ selectedCards });
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
    this.updateInfoText();
  },

  /**
   * 更新信息提示 - 修复 BUG-011
   */
  updateInfoText() {
    const { currentPlayer } = this.data;
    const playerNames = ['我', '玩家 2', '玩家 3', '玩家 4'];
    const playerName = playerNames[currentPlayer] || `玩家${currentPlayer + 1}`;
    
    this.setData({
      infoText: `当前出牌：${playerName}`,
      isFirstTurn: false
    });
  }
});
