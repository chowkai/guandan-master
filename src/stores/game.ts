import { writable, derived } from 'svelte/store'

// ========================================
// 类型定义
// ========================================

export type PlayerPosition = 'top' | 'left' | 'right' | 'bottom'
export type GameStatus = 'ready' | 'playing' | 'over' | 'tribute'
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'joker'
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | 'small_joker' | 'big_joker'

export interface Card {
  suit: Suit
  rank: Rank
  value: number
}

export interface Player {
  position: PlayerPosition
  hand: Card[]
  isAI: boolean
  name: string
}

export interface GameState {
  players: Record<PlayerPosition, Card[]>
  currentTurn: PlayerPosition | null
  gameStatus: GameStatus
  level: number
  lastHand: {
    player: PlayerPosition
    cards: Card[]
    type: string
  } | null
  winner: PlayerPosition | null
}

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
    level: 2,
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
    
    // 发牌
    dealCards(deck: Card[]): Record<PlayerPosition, Card[]> {
      const hands: Record<PlayerPosition, Card[]> = {
        top: [],
        left: [],
        right: [],
        bottom: []
      }
      
      const positions: PlayerPosition[] = ['top', 'left', 'right', 'bottom']
      
      deck.forEach((card, index) => {
        const pos = positions[index % 4]
        hands[pos].push(card)
      })
      
      // 排序
      positions.forEach(pos => {
        hands[pos].sort((a, b) => b.value - a.value)
      })
      
      return hands
    },
    
    // 设置先手玩家（核心修复！）
    setFirstPlayer() {
      const positions: PlayerPosition[] = ['top', 'left', 'right', 'bottom']
      const randomIndex = Math.floor(Math.random() * 4)
      const firstPlayer = positions[randomIndex]
      
      update(state => ({
        ...state,
        currentTurn: firstPlayer,
        gameStatus: 'playing'
      }))
      
      console.log('✅ 先手玩家已设置:', firstPlayer)
      
      // 如果是 AI 先手，自动出牌
      if (firstPlayer !== 'bottom') {
        setTimeout(() => {
          this.aiPlay(firstPlayer)
        }, 1500)
      }
    },
    
    // AI 自动出牌（简单版）
    aiPlay(player: PlayerPosition) {
      const hand = this.getState().players[player]
      if (!hand || hand.length === 0) return
      
      // 简单策略：出最小的单张
      const card = hand[hand.length - 1]
      this.playCards(player, [card])
      
      // 切换到下一回合
      setTimeout(() => {
        this.nextTurn()
      }, 1000)
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
