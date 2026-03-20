/**
 * 掼蛋大师 - 游戏主逻辑
 * Guandan Master - Game Core Logic
 * 
 * 作者：代码虾
 * 创建日期：2026-03-20
 */

// ========================================
// 游戏常量
// ========================================

const SUITS = {
    CLUBS: 'clubs',
    DIAMONDS: 'diamonds',
    HEARTS: 'hearts',
    SPADES: 'spades',
    JOKER: 'joker'
};

const RANKS = {
    TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6,
    SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10,
    JACK: 11, QUEEN: 12, KING: 13, ACE: 14,
    SMALL_JOKER: 15, BIG_JOKER: 16
};

const RANK_DISPLAY = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
    7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A',
    15: '小王', 16: '大王'
};

const PLAYER_POSITIONS = {
    TOP: 'top',      // 对家
    LEFT: 'left',    // AI 左
    RIGHT: 'right',  // AI 右
    BOTTOM: 'bottom' // 自己
};

// ========================================
// 游戏状态
// ========================================

class GameState {
    constructor() {
        this.level = 2;                    // 当前级数
        this.deck = [];                    // 牌堆
        this.players = {};                 // 玩家手牌
        this.currentTurn = null;           // 当前出牌玩家
        this.lastHand = null;              // 最后出的牌
        this.lastHandPlayer = null;        // 最后出牌的玩家
        this.gameStatus = 'ready';         // 游戏状态：ready, playing, over
        this.selectedCards = [];           // 选中的牌
        this.passCount = 0;                // 连续不要次数
        this.winner = null;                // 获胜者
    }
}

// 报牌提醒标记（每个玩家是否已提醒）
const hasReminded = {};

// ========================================
// 游戏主类
// ========================================

class GuandanGame {
    constructor() {
        this.state = new GameState();
        this.settings = {
            aiDifficulty: 'medium',
            soundEnabled: true,
            animationEnabled: true,
            cardSize: 80
        };
        
        this.init();
    }
    
    /**
     * 初始化游戏
     */
    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateCardSize();
        
        // 同步设置到音效和动画管理器
        if (window.soundManager) {
            window.soundManager.setEnabled(this.settings.soundEnabled);
        }
        if (window.animationManager) {
            window.animationManager.setEnabled(this.settings.animationEnabled);
        }
        
        // 显示开始画面
        this.showStartScreen();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 开始画面按钮
        document.getElementById('btn-start-game').addEventListener('click', () => {
            this.hideStartScreen();
            this.startNewGame();
        });
        document.getElementById('btn-start-settings').addEventListener('click', () => this.showSettings());
        document.getElementById('btn-start-help').addEventListener('click', () => this.showHelp());
        
        // 按钮事件
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-quit').addEventListener('click', () => this.quitGame());
        document.getElementById('btn-play').addEventListener('click', () => this.playSelectedCards());
        document.getElementById('btn-pass').addEventListener('click', () => this.passTurn());
        document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
        
        // 多种排序方式
        document.getElementById('btn-sort-suit').addEventListener('click', () => this.sortBySuit());
        document.getElementById('btn-sort-rank').addEventListener('click', () => this.sortByRank());
        document.getElementById('btn-sort-smart').addEventListener('click', () => this.sortSmart());
        
        // 设置和帮助
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettings());
        document.getElementById('btn-help').addEventListener('click', () => this.showHelp());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        document.getElementById('close-help').addEventListener('click', () => this.hideHelp());
        
        // 设置保存
        document.getElementById('ai-difficulty').addEventListener('change', (e) => {
            this.settings.aiDifficulty = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            if (window.soundManager) {
                window.soundManager.setEnabled(this.settings.soundEnabled);
            }
            this.saveSettings();
        });
        
        document.getElementById('animation-enabled').addEventListener('change', (e) => {
            this.settings.animationEnabled = e.target.checked;
            if (window.animationManager) {
                window.animationManager.setEnabled(this.settings.animationEnabled);
            }
            this.saveSettings();
        });
        
        document.getElementById('card-size').addEventListener('input', (e) => {
            this.settings.cardSize = parseInt(e.target.value);
            this.updateCardSize();
            this.saveSettings();
        });
        
        // 游戏结束 - 再来一局
        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.hideGameOver();
            this.startNewGame();
        });
        
        // 卡牌点击事件（事件委托）
        document.getElementById('my-hand').addEventListener('click', (e) => {
            const cardEl = e.target.closest('.card');
            if (cardEl) {
                const index = parseInt(cardEl.dataset.index);
                this.toggleCardSelection(index);
            }
        });
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        const saved = localStorage.getItem('guandan-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                
                // 恢复设置 UI
                document.getElementById('ai-difficulty').value = this.settings.aiDifficulty;
                document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
                document.getElementById('animation-enabled').checked = this.settings.animationEnabled;
                document.getElementById('card-size').value = this.settings.cardSize;
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
    }
    
    /**
     * 保存设置
     */
    saveSettings() {
        localStorage.setItem('guandan-settings', JSON.stringify(this.settings));
    }
    
    /**
     * 更新卡牌大小
     */
    updateCardSize() {
        document.documentElement.style.setProperty('--card-width', this.settings.cardSize + 'px');
        document.documentElement.style.setProperty('--card-height', (this.settings.cardSize * 1.4) + 'px');
    }
    
    /**
     * 开始新游戏
     */
    startNewGame() {
        this.state = new GameState();
        this.state.level = 2;
        
        // 重置报牌提醒
        this.hasReminded = {
            [PLAYER_POSITIONS.TOP]: false,
            [PLAYER_POSITIONS.LEFT]: false,
            [PLAYER_POSITIONS.RIGHT]: false
        };
        
        // 创建牌堆
        this.createDeck();
        
        // 洗牌
        this.shuffleDeck();
        
        // 发牌（带动画）
        this.dealCardsWithAnimation();
        
        // 整理手牌
        this.sortHand();
        
        // 更新 UI
        this.updateUI();
        
        // 确定先手（简化：总是玩家先手）
        this.state.currentTurn = PLAYER_POSITIONS.BOTTOM;
        this.state.gameStatus = 'playing';
        
        // 更新状态显示
        this.updateGameStatus('游戏开始！请出牌');
        this.updateTurnIndicator();
        
        // 播放发牌音效
        this.playSound('deal');
        
        this.hideGameOver();
        this.showGameMessage('新游戏开始！');
    }
    
    /**
     * 创建牌堆（2 副牌，共 108 张）
     */
    createDeck() {
        this.state.deck = [];
        
        for (let d = 0; d < 2; d++) { // 2 副牌
            // 4 花色普通牌
            for (let suit of [SUITS.CLUBS, SUITS.DIAMONDS, SUITS.HEARTS, SUITS.SPADES]) {
                for (let rank = 2; rank <= 14; rank++) {
                    const isLevelCard = (rank === this.state.level);
                    this.state.deck.push({
                        suit,
                        rank,
                        isLevelCard,
                        id: `${d}-${suit}-${rank}`
                    });
                }
            }
            
            // 大小王
            this.state.deck.push({
                suit: SUITS.JOKER,
                rank: RANKS.SMALL_JOKER,
                isLevelCard: false,
                id: `${d}-joker-small`
            });
            this.state.deck.push({
                suit: SUITS.JOKER,
                rank: RANKS.BIG_JOKER,
                isLevelCard: false,
                id: `${d}-joker-big`
            });
        }
    }
    
    /**
     * 洗牌（Fisher-Yates 算法）
     */
    shuffleDeck() {
        const deck = this.state.deck;
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    /**
     * 发牌（每人 27 张）
     */
    dealCards() {
        this.state.players = {
            [PLAYER_POSITIONS.TOP]: [],
            [PLAYER_POSITIONS.LEFT]: [],
            [PLAYER_POSITIONS.RIGHT]: [],
            [PLAYER_POSITIONS.BOTTOM]: []
        };
        
        const positions = Object.values(PLAYER_POSITIONS);
        let cardIndex = 0;
        
        // 轮流发牌
        for (let i = 0; i < 27; i++) {
            for (let pos of positions) {
                if (cardIndex < this.state.deck.length) {
                    this.state.players[pos].push(this.state.deck[cardIndex]);
                    cardIndex++;
                }
            }
        }
    }
    
    /**
     * 发牌带动画
     */
    dealCardsWithAnimation() {
        this.state.players = {
            [PLAYER_POSITIONS.TOP]: [],
            [PLAYER_POSITIONS.LEFT]: [],
            [PLAYER_POSITIONS.RIGHT]: [],
            [PLAYER_POSITIONS.BOTTOM]: []
        };
        
        const positions = Object.values(PLAYER_POSITIONS);
        let cardIndex = 0;
        const handContainer = document.getElementById('my-hand');
        handContainer.innerHTML = '';
        
        // 轮流发牌，带动画
        const dealOneCard = () => {
            if (cardIndex >= this.state.deck.length) {
                // 发牌完成
                this.sortHand();
                return;
            }
            
            const posIndex = cardIndex % 4;
            const pos = positions[posIndex];
            
            this.state.players[pos].push(this.state.deck[cardIndex]);
            
            // 如果是玩家，添加卡牌到 UI（带动画）
            if (pos === PLAYER_POSITIONS.BOTTOM) {
                const card = this.state.deck[cardIndex];
                const cardEl = this.createCardElement(card, this.state.players[pos].length - 1);
                cardEl.classList.add('card-deal-anim');
                handContainer.appendChild(cardEl);
            }
            
            cardIndex++;
            
            // 继续发下一张
            setTimeout(dealOneCard, 50);
        };
        
        dealOneCard();
    }
    
    /**
     * 整理手牌（默认按牌值排序）
     */
    sortHand() {
        this.sortByRank();
    }
    
    /**
     * 按花色排序
     */
    sortBySuit() {
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        
        const suitOrder = {
            [SUITS.CLUBS]: 1,
            [SUITS.DIAMONDS]: 2,
            [SUITS.HEARTS]: 3,
            [SUITS.SPADES]: 4,
            [SUITS.JOKER]: 5
        };
        
        myHand.sort((a, b) => {
            // 先按花色排序
            const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
            if (suitDiff !== 0) return suitDiff;
            
            // 同花色按牌值排序
            return b.rank - a.rank;
        });
        
        this.renderMyHand();
        this.showGameMessage('按花色排序');
    }
    
    /**
     * 按牌值排序
     */
    sortByRank() {
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        
        myHand.sort((a, b) => {
            const valueA = this.getCardValue(a);
            const valueB = this.getCardValue(b);
            
            if (valueA !== valueB) {
                return valueB - valueA; // 降序
            }
            
            // 同值按花色排序
            return a.suit.localeCompare(b.suit);
        });
        
        this.renderMyHand();
        this.showGameMessage('按牌值排序');
    }
    
    /**
     * 智能排序（炸弹优先）
     */
    sortSmart() {
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        
        // 统计每种牌的数量
        const rankCount = {};
        myHand.forEach(card => {
            const key = card.rank;
            rankCount[key] = (rankCount[key] || 0) + 1;
        });
        
        myHand.sort((a, b) => {
            const countA = rankCount[a.rank] || 0;
            const countB = rankCount[b.rank] || 0;
            
            // 炸弹（4 张及以上）优先
            if (countA >= 4 && countB < 4) return -1;
            if (countB >= 4 && countA < 4) return 1;
            
            // 同是炸弹或同不是炸弹，按数量降序
            if (countA !== countB) return countB - countA;
            
            // 数量相同，按牌值降序
            const valueA = this.getCardValue(a);
            const valueB = this.getCardValue(b);
            if (valueA !== valueB) return valueB - valueA;
            
            // 牌值相同，按花色排序
            return a.suit.localeCompare(b.suit);
        });
        
        this.renderMyHand();
        this.showGameMessage('智能排序（炸弹优先）');
    }
    
    /**
     * 获取牌的实际大小值
     */
    getCardValue(card) {
        if (card.rank === RANKS.BIG_JOKER) return 160;
        if (card.rank === RANKS.SMALL_JOKER) return 150;
        if (card.isLevelCard) return 145; // 级牌
        return card.rank * 10;
    }
    
    /**
     * 渲染我的手牌
     */
    renderMyHand() {
        const handContainer = document.getElementById('my-hand');
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        
        handContainer.innerHTML = '';
        
        myHand.forEach((card, index) => {
            const cardEl = this.createCardElement(card, index);
            handContainer.appendChild(cardEl);
        });
        
        // 更新剩余牌数
        document.getElementById('my-card-count').textContent = myHand.length;
    }
    
    /**
     * 创建卡牌元素
     */
    createCardElement(card, index, isBack = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (isBack ? ' card-back' : '');
        cardEl.dataset.index = index;
        
        if (isBack) {
            // 牌背
            cardEl.innerHTML = `<svg viewBox="0 0 200 280">
                <rect x="5" y="5" width="190" height="270" rx="15" fill="#C41E3A" stroke="#D4AF37" stroke-width="2"/>
                <rect x="12" y="12" width="176" height="256" rx="10" fill="#F5F0E6"/>
                <circle cx="100" cy="140" r="50" fill="none" stroke="#C41E3A" stroke-width="2"/>
                <circle cx="100" cy="140" r="40" fill="none" stroke="#D4AF37" stroke-width="1"/>
            </svg>`;
        } else {
            // 牌面 - 加载 SVG 文件
            let svgPath;
            
            // 特殊处理王（joker）
            if (card.suit === SUITS.JOKER) {
                if (card.rank === RANKS.SMALL_JOKER) {
                    svgPath = `assets/images/cards/joker_small.svg`;
                } else if (card.rank === RANKS.BIG_JOKER) {
                    svgPath = `assets/images/cards/joker_big.svg`;
                }
            } else {
                const suitName = card.suit;
                const rankName = card.rank === 10 ? '10' : 
                                card.rank === 11 ? 'J' :
                                card.rank === 12 ? 'Q' :
                                card.rank === 13 ? 'K' :
                                card.rank === 14 ? 'A' :
                                card.rank.toString();
                
                svgPath = `assets/images/cards/${suitName}_${rankName}.svg`;
            }
            
            cardEl.innerHTML = `<img src="${svgPath}" alt="${this.getCardDisplayName(card)}" style="width:100%;height:100%;object-fit:contain;">`;
        }
        
        return cardEl;
    }
    
    /**
     * 获取卡牌显示名称
     */
    getCardDisplayName(card) {
        const suitNames = {
            [SUITS.CLUBS]: '梅花',
            [SUITS.DIAMONDS]: '方块',
            [SUITS.HEARTS]: '红桃',
            [SUITS.SPADES]: '黑桃',
            [SUITS.JOKER]: ''
        };
        
        if (card.rank === RANKS.SMALL_JOKER) return '小王';
        if (card.rank === RANKS.BIG_JOKER) return '大王';
        
        return `${suitNames[card.suit]}${RANK_DISPLAY[card.rank]}`;
    }
    
    /**
     * 切换卡牌选择
     */
    toggleCardSelection(index) {
        if (this.state.currentTurn !== PLAYER_POSITIONS.BOTTOM) {
            return; // 不是玩家的回合
        }
        
        const selectedIndex = this.state.selectedCards.indexOf(index);
        
        if (selectedIndex === -1) {
            // 选中
            this.state.selectedCards.push(index);
        } else {
            // 取消选中
            this.state.selectedCards.splice(selectedIndex, 1);
        }
        
        this.updateCardSelectionUI();
    }
    
    /**
     * 更新卡牌选择 UI
     */
    updateCardSelectionUI() {
        const cards = document.querySelectorAll('#my-hand .card');
        
        cards.forEach((card, index) => {
            if (this.state.selectedCards.includes(index)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }
    
    /**
     * 出选中的牌
     */
    playSelectedCards() {
        if (this.state.currentTurn !== PLAYER_POSITIONS.BOTTOM) {
            this.showGameMessage('还没轮到您出牌！');
            return;
        }
        
        if (this.state.selectedCards.length === 0) {
            this.showGameMessage('请选择要出的牌');
            return;
        }
        
        // 获取选中的牌
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        const selectedCards = this.state.selectedCards.sort((a, b) => b - a).map(i => myHand[i]);
        
        // 验证牌型（简化：暂时不验证）
        // TODO: 添加牌型验证
        
        // 从手牌移除
        this.state.selectedCards.sort((a, b) => b - a).forEach(i => {
            myHand.splice(i, 1);
        });
        
        // 更新出牌记录
        this.state.lastHand = selectedCards;
        this.state.lastHandPlayer = PLAYER_POSITIONS.BOTTOM;
        this.state.passCount = 0;
        
        // 播放音效
        this.playSound('play');
        
        // 显示出的牌
        this.displayPlayedCards(PLAYER_POSITIONS.BOTTOM, selectedCards);
        
        // 检查是否获胜
        if (myHand.length === 0) {
            this.gameOver(PLAYER_POSITIONS.BOTTOM);
            return;
        }
        
        // 清空选择
        this.state.selectedCards = [];
        
        // 更新 UI
        this.renderMyHand();
        this.updateLastHandDisplay(selectedCards, '我');
        
        // 切换到下一个玩家
        this.nextTurn();
    }
    
    /**
     * 不要（过）
     */
    passTurn() {
        if (this.state.currentTurn !== PLAYER_POSITIONS.BOTTOM) {
            return;
        }
        
        if (!this.state.lastHand || this.state.lastHandPlayer === PLAYER_POSITIONS.BOTTOM) {
            this.showGameMessage('您是先手，不能不要');
            return;
        }
        
        this.state.passCount++;
        
        // 播放音效
        this.playSound('pass');
        
        this.showGameMessage('不要');
        
        // 显示不要标记
        document.getElementById('my-status').textContent = '不要';
        setTimeout(() => {
            document.getElementById('my-status').textContent = '';
        }, 1500);
        
        // 切换到下一个玩家
        this.nextTurn();
    }
    
    /**
     * 切换到下一个玩家
     */
    nextTurn() {
        const positions = [
            PLAYER_POSITIONS.BOTTOM,
            PLAYER_POSITIONS.LEFT,
            PLAYER_POSITIONS.TOP,
            PLAYER_POSITIONS.RIGHT
        ];
        
        const currentIndex = positions.indexOf(this.state.currentTurn);
        
        // 检查是否所有人都不要（除了最后出牌者）
        if (this.state.passCount >= 3) {
            // 最后出牌者获得出牌权
            this.state.currentTurn = this.state.lastHandPlayer;
            this.state.passCount = 0;
            this.state.lastHand = null;
            this.state.lastHandPlayer = null;
            this.updateLastHandDisplay(null, '');
            
            // 清理一轮出的牌
            this.clearPlayedCards();
        } else {
            // 正常轮转
            this.state.currentTurn = positions[(currentIndex + 1) % 4];
        }
        
        this.updateTurnIndicator();
        
        // 如果是 AI 回合，延迟后自动出牌
        if (this.state.currentTurn !== PLAYER_POSITIONS.BOTTOM) {
            setTimeout(() => this.aiPlay(), 1000);
        }
    }
    
    /**
     * AI 出牌逻辑
     */
    aiPlay() {
        if (this.state.gameStatus !== 'playing') {
            return;
        }
        
        const aiPosition = this.state.currentTurn;
        const aiHand = this.state.players[aiPosition];
        
        // 简化 AI：随机出牌
        let cardsToPlay = [];
        
        if (!this.state.lastHand || this.state.lastHandPlayer === aiPosition) {
            // AI 是先手，出最小的单张
            cardsToPlay = [aiHand[aiHand.length - 1]];
        } else {
            // 尝试出牌（简化：50% 概率出牌，50% 概率不要）
            if (Math.random() > 0.5 && aiHand.length > 0) {
                cardsToPlay = [aiHand[aiHand.length - 1]];
            }
        }
        
        if (cardsToPlay.length > 0) {
            // 出牌
            const cardIndices = cardsToPlay.map(c => aiHand.indexOf(c));
            cardIndices.sort((a, b) => b - a).forEach(i => aiHand.splice(i, 1));
            
            this.state.lastHand = cardsToPlay;
            this.state.lastHandPlayer = aiPosition;
            this.state.passCount = 0;
            
            this.playSound('play');
            this.displayPlayedCards(aiPosition, cardsToPlay);
            
            // 检查 AI 是否获胜
            if (aiHand.length === 0) {
                this.gameOver(aiPosition);
                return;
            }
            
            this.updateOtherPlayerCardCount(aiPosition);
            this.updateLastHandDisplay(cardsToPlay, this.getPlayerName(aiPosition));
        } else {
            // 不要
            this.state.passCount++;
            this.playSound('pass');
            
            document.getElementById(`${aiPosition}-status`).textContent = '不要';
            setTimeout(() => {
                document.getElementById(`${aiPosition}-status`).textContent = '';
            }, 1500);
        }
        
        // 切换到下一个玩家
        setTimeout(() => this.nextTurn(), 500);
    }
    
    /**
     * 显示其他玩家剩余牌数（≤6 张时提醒一次）
     */
    updateOtherPlayerCardCount(position) {
        const count = this.state.players[position].length;
        const countEl = document.getElementById(`${position}-card-count`);
        
        // 只在剩余≤6 张时提醒一次
        if (count <= 6 && this.hasReminded && !this.hasReminded[position]) {
            this.hasReminded[position] = true;
            this.showGameMessage(`${this.getPlayerName(position)} 剩余 ${count} 张牌！`);
            this.playSound('hint');
        }
        
        // 不常显剩余牌数，只在≤6 张时显示
        if (count <= 6) {
            countEl.textContent = count;
        } else {
            countEl.textContent = '';
        }
    }
    
    /**
     * 显示出的牌
     */
    displayPlayedCards(position, cards) {
        const container = document.getElementById(`${position}-played-cards`);
        // 下方玩家（自己）没有出的牌显示区域，直接返回
        if (!container) {
            return;
        }
        container.innerHTML = '';
        
        // 添加最后出牌者标识
        const indicator = document.createElement('div');
        indicator.className = 'last-player-indicator';
        indicator.textContent = this.getPlayerName(position) + ' 出牌';
        container.style.position = 'relative';
        container.appendChild(indicator);
        
        cards.forEach((card, index) => {
            const cardEl = this.createCardElement(card, 0, false);
            cardEl.style.width = '50px';
            cardEl.style.height = '70px';
            cardEl.style.animationDelay = (index * 0.1) + 's';
            container.appendChild(cardEl);
        });
    }
    
    /**
     * 清理一轮出的牌
     */
    clearPlayedCards() {
        ['top', 'left', 'right'].forEach(pos => {
            const container = document.getElementById(`${pos}-played-cards`);
            if (container) {
                container.innerHTML = '';
                container.style.position = '';
            }
        });
    }
    
    /**
     * 更新最后出牌显示
     */
    updateLastHandDisplay(cards, playerName) {
        const container = document.getElementById('last-hand-cards');
        const infoEl = document.getElementById('last-hand-info');
        
        if (!cards || cards.length === 0) {
            container.innerHTML = '';
            infoEl.textContent = '';
            return;
        }
        
        container.innerHTML = '';
        cards.forEach(card => {
            const cardEl = this.createCardElement(card, 0, false);
            cardEl.style.width = '60px';
            cardEl.style.height = '84px';
            container.appendChild(cardEl);
        });
        
        infoEl.textContent = `${playerName} 出了 ${cards.length} 张牌`;
    }
    
    /**
     * 更新 UI
     */
    updateUI() {
        // 更新所有玩家的牌数
        Object.keys(PLAYER_POSITIONS).forEach(key => {
            const pos = PLAYER_POSITIONS[key];
            if (pos !== PLAYER_POSITIONS.BOTTOM) {
                this.updateOtherPlayerCardCount(pos);
            }
        });
        
        // 清空出的牌区域
        this.clearPlayedCards();
        
        // 清空状态标记
        document.querySelectorAll('.status-badge').forEach(el => {
            el.textContent = '';
        });
        
        // 更新级数显示
        document.getElementById('current-level').textContent = this.state.level;
    }
    
    /**
     * 更新回合指示器
     */
    updateTurnIndicator() {
        const indicator = document.getElementById('current-turn');
        const playerName = this.getPlayerName(this.state.currentTurn);
        
        indicator.textContent = `${playerName} 出牌`;
        
        // 更新状态标记
        document.querySelectorAll('.status-badge').forEach(el => {
            el.classList.remove('active');
            el.textContent = '';
        });
        
        const activeBadge = document.getElementById(`${this.state.currentTurn}-status`);
        if (activeBadge) {
            activeBadge.textContent = '思考中...';
            activeBadge.classList.add('active');
        }
        
        // 更新游戏状态
        if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
            this.updateGameStatus('轮到您出牌');
        } else {
            this.updateGameStatus(`${playerName} 正在思考...`);
        }
    }
    
    /**
     * 获取玩家名称
     */
    getPlayerName(position) {
        const names = {
            [PLAYER_POSITIONS.TOP]: '对家',
            [PLAYER_POSITIONS.LEFT]: 'AI 左',
            [PLAYER_POSITIONS.RIGHT]: 'AI 右',
            [PLAYER_POSITIONS.BOTTOM]: '我'
        };
        return names[position];
    }
    
    /**
     * 更新游戏状态显示
     */
    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }
    
    /**
     * 显示游戏消息
     */
    showGameMessage(message) {
        const msgEl = document.getElementById('game-message');
        msgEl.textContent = message;
        msgEl.style.display = 'block';
        
        // 移除旧的动画类并重新添加
        msgEl.style.animation = 'none';
        msgEl.offsetHeight; // 触发重绘
        msgEl.style.animation = 'fadeInOut 2s ease';
        
        setTimeout(() => {
            msgEl.style.display = 'none';
        }, 2000);
    }
    
    /**
     * 游戏结束
     */
    gameOver(winner) {
        this.state.gameStatus = 'over';
        this.state.winner = winner;
        
        const winnerName = this.getPlayerName(winner);
        const isPlayerWin = winner === PLAYER_POSITIONS.BOTTOM;
        
        // 显示游戏结束面板
        const resultEl = document.getElementById('game-over-result');
        resultEl.innerHTML = `
            <h3 style="color: ${isPlayerWin ? 'var(--success)' : 'var(--danger)'}; font-size: 1.5rem; margin-bottom: 15px;">
                ${isPlayerWin ? '🎉 恭喜获胜！' : '😔 游戏结束'}
            </h3>
            <p style="font-size: 1.1rem;">${winnerName} 第一个出完所有牌</p>
            <p style="margin-top: 10px; color: var(--text-light);">级数：${this.state.level}</p>
        `;
        
        document.getElementById('game-over-title').textContent = isPlayerWin ? '胜利！' : '游戏结束';
        
        this.showGameOver();
        
        // 播放胜利音效
        if (isPlayerWin) {
            this.playSound('win');
        }
    }
    
    /**
     * 显示提示
     */
    showHint() {
        if (this.state.currentTurn !== PLAYER_POSITIONS.BOTTOM) {
            return;
        }
        
        // 简化提示：建议选择最小的单张
        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
        if (myHand.length > 0) {
            const smallestCard = myHand[myHand.length - 1];
            const index = myHand.indexOf(smallestCard);
            
            this.state.selectedCards = [index];
            this.updateCardSelectionUI();
            
            this.showGameMessage(`建议出：${this.getCardDisplayName(smallestCard)}`);
        }
    }
    
    /**
     * 播放音效
     */
    playSound(soundName) {
        if (!this.settings.soundEnabled || !window.soundManager) {
            return;
        }
        
        // 使用 soundManager 播放音效
        switch (soundName) {
            case 'play':
                window.soundManager.playCard();
                break;
            case 'win':
                window.soundManager.playWin();
                break;
            case 'pass':
                window.soundManager.playPass();
                break;
            case 'deal':
                window.soundManager.playDeal();
                break;
            case 'hint':
                window.soundManager.playHint();
                break;
            case 'error':
                window.soundManager.playError();
                break;
            case 'click':
                window.soundManager.playClick();
                break;
        }
    }
    
    /**
     * 显示开始画面
     */
    showStartScreen() {
        document.getElementById('start-screen').classList.add('show');
        document.getElementById('game-container').style.display = 'none';
    }
    
    /**
     * 隐藏开始画面
     */
    hideStartScreen() {
        document.getElementById('start-screen').classList.remove('show');
        document.getElementById('game-container').style.display = 'flex';
    }
    
    /**
     * 显示设置面板
     */
    showSettings() {
        document.getElementById('settings-panel').classList.add('show');
    }
    
    /**
     * 隐藏设置面板
     */
    hideSettings() {
        document.getElementById('settings-panel').classList.remove('show');
    }
    
    /**
     * 显示帮助面板
     */
    showHelp() {
        document.getElementById('help-panel').classList.add('show');
    }
    
    /**
     * 隐藏帮助面板
     */
    hideHelp() {
        document.getElementById('help-panel').classList.remove('show');
    }
    
    /**
     * 显示游戏结束面板
     */
    showGameOver() {
        document.getElementById('game-over-panel').classList.add('show');
    }
    
    /**
     * 隐藏游戏结束面板
     */
    hideGameOver() {
        document.getElementById('game-over-panel').classList.remove('show');
    }
    
    /**
     * 退出游戏
     */
    quitGame() {
        if (confirm('确定要退出游戏吗？')) {
            this.state.gameStatus = 'ready';
            document.getElementById('my-hand').innerHTML = '';
            this.updateGameStatus('已退出');
            this.showGameMessage('再见！');
        }
    }
}

// ========================================
// 启动游戏
// ========================================

let game = null;

document.addEventListener('DOMContentLoaded', () => {
    game = new GuandanGame();
    
    // 暴露给全局以便调试
    window.guandanGame = game;
});
