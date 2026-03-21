import { writable } from 'svelte/store'

// ========================================
// 类型定义（JSDoc 注释，不编译）
// ========================================

/**
 * @typedef {'top' | 'left' | 'right' | 'bottom'} PlayerPosition
 * @typedef {'ready' | 'playing' | 'over' | 'tribute'} GameStatus
 * @typedef {'clubs' | 'diamonds' | 'hearts' | 'spades' | 'joker'} Suit
 * @typedef {'3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | 'small_joker' | 'big_joker'} Rank
 */

/**
 * @typedef {Object} Card
 * @property {Suit} suit
 * @property {Rank} rank
 * @property {number} value
 */

/**
 * @typedef {Object} GameState
 * @property {Record<PlayerPosition, Card[]>} players
 * @property {PlayerPosition | null} currentTurn
 * @property {GameStatus} gameStatus
 * @property {number} level
 * @property {Object | null} lastHand
 * @property {PlayerPosition | null} winner
 */

// ========================================
// 游戏状态 Store
// ========================================

function createGameStore() {
  const initialState: GameState = {
    players: {
      top: [],
      left: [],
      right: [],
      bottom: []
    },
    currentTurn: null,
    gameStatus: 'ready',
    currentLevel: 2,  // 从打 2 开始
    currentPlayer: 1, // 第 1 局
    lastHand: null,
    winner: null
  }
  
  const { subscribe, set, update } = writable<GameState>(initialState)
  
  return {
    subscribe,
    
    // 开始新游戏
    async startNewGame() {
      // 重置状态
      set({
        ...initialState,
        level: 2
      })
      
      // 创建牌堆
      const deck = this.createDeck()
      
      // 洗牌
      this.shuffleDeck(deck)
      
      // 发牌
      const hands = this.dealCards(deck)
      
      // 更新状态
      update(state => ({
        ...state,
        players: hands,
        gameStatus: 'dealing'
      }))
      
      // 发牌动画完成后设置先手
      setTimeout(() => {
        this.setFirstPlayer()
      }, 3000) // 3 秒发牌时间
    },
    
    // 创建牌堆
    createDeck(): Card[] {
      const deck: Card[] = []
      const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
      const ranks: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
      const values: Record<Rank, number> = {
        '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
        'small_joker': 16, 'big_joker': 17
      }
      
      // 4 副牌
      for (let i = 0; i < 4; i++) {
        for (const suit of suits) {
          for (const rank of ranks) {
            deck.push({ suit, rank, value: values[rank] })
          }
        }
        // 大小王
        deck.push({ suit: 'joker', rank: 'small_joker', value: 16 })
        deck.push({ suit: 'joker', rank: 'big_joker', value: 17 })
      }
      
      return deck
    },
    
    // 洗牌
    shuffleDeck(deck: Card[]) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
      }
    },
    
    // 发牌（每家 27 张，共 108 张）
    dealCards(deck: Card[]): Record<PlayerPosition, Card[]> {
      const hands: Record<PlayerPosition, Card[]> = {
        top: [],
        left: [],
        right: [],
        bottom: []
      }
      
      const positions: PlayerPosition[] = ['top', 'left', 'right', 'bottom']
      const cardsPerPlayer = 27
      const totalCards = cardsPerPlayer * 4 // 108 张
      
      for (let i = 0; i < totalCards; i++) {
        const pos = positions[i % 4]
        hands[pos].push(deck[i])
      }
      
      // 排序
      positions.forEach(pos => {
        hands[pos].sort((a, b) => b.value - a.value)
      })
      
      return hands
    },
    
    // 设置先手玩家
    setFirstPlayer() {
      const positions = ['top', 'left', 'right', 'bottom']
      const randomIndex = Math.floor(Math.random() * 4)
      const firstPlayer = positions[randomIndex]
      
      update(state => ({
        ...state,
        currentTurn: firstPlayer,
        gameStatus: 'playing'
      }))
      
      console.log('✅ 先手玩家已设置:', firstPlayer)
      
      // 如果是 AI 先手，立即出牌
      if (firstPlayer !== 'bottom') {
        setTimeout(() => {
          this.aiPlay(firstPlayer)
        }, 300)
      }
    },
    
    // AI 自动出牌（快速响应）
    aiPlay(player) {
      const state = this.getState()
      const hand = state.players[player]
      if (!hand || hand.length === 0) return
      
      console.log('🤖 AI 出牌:', player)
      
      // 简单策略：出最小的单张
      const card = hand[hand.length - 1]
      this.playCards(player, [card])
      
      // 显示提示
      const playerName = {
        top: '对家',
        left: '左家',
        right: '右家',
        bottom: '我'
      }[player]
      console.log(`💬 ${playerName} 出了一张牌`)
      
      // 检查是否胜利
      if (hand.length === 1) {
        setTimeout(() => {
          alert('🎉 ' + playerName + ' 赢了！')
        }, 100)
        return
      }
      
      // 切换到下一回合（快速）
      setTimeout(() => {
        this.nextTurn()
      }, 300)
    },
    
    // 获取当前状态
    getState(): GameState {
      let state: GameState = initialState
      subscribe(s => state = s)()
      return state
    },
    
    // 出牌
    playCards(player: PlayerPosition, cards: Card[]) {
      update(state => {
        const newHand = state.players[player].filter(
          card => !cards.includes(card)
        )
        
        return {
          ...state,
          players: {
            ...state.players,
            [player]: newHand
          },
          lastHand: {
            player,
            cards,
            type: 'normal'
          }
        }
      })
    },
    
    // 切换回合
    nextTurn() {
      update(state => {
        const positions: PlayerPosition[] = ['top', 'left', 'right', 'bottom']
        const currentIndex = positions.indexOf(state.currentTurn!)
        const nextIndex = (currentIndex + 1) % 4
        
        return {
          ...state,
          currentTurn: positions[nextIndex]
        }
      })
    },
    
    // 重置
    reset() {
      set(initialState)
    }
  }
}

export const game = createGameStore()
