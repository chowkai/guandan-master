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
        this.previousRankings = null;      // 上局排名 [(position, rank), ...]
    }
}

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
        
        // 贡牌面板按钮
        document.getElementById('btn-resist-ok').addEventListener('click', () => {
            this.hideTributePanel();
            // 抗贡：头游先出牌
            const rankings = this.state.previousRankings;
            const playerByRank = {};
            rankings.forEach(([position, rank]) => {
                playerByRank[rank] = position;
            });
            const headYou = playerByRank[1];
            this.state.currentTurn = headYou;
            this.state.gameStatus = 'playing';
            this.updateTurnIndicator();
            this.showGameMessage('抗贡成功，游戏开始！');
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
    async startNewGame() {
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
        
        // 发牌（带动画）- 等待发牌完成
        await this.dealCardsWithAnimation();
        
        // 更新 UI
        this.updateUI();
        
        // 播放发牌音效
        this.playSound('deal');
        
        // 检查是否需要贡牌（第一局不需要）
        if (this.state.previousRankings && this.state.previousRankings.length > 0) {
            // 有上局排名，执行贡牌阶段
            this.executeTributePhase();
        } else {
            // 第一局，随机指定先手
            const positions = Object.values(PLAYER_POSITIONS);
            this.state.currentTurn = positions[Math.floor(Math.random() * 4)];
            this.state.gameStatus = 'playing';
            
            // 更新状态显示
            this.updateGameStatus('游戏开始！请出牌');
            this.updateTurnIndicator();
            
            const currentPlayerName = this.getPlayerName(this.state.currentTurn);
            this.showGameMessage(`${currentPlayerName} 先出牌！`);
            
            // 更新提示条显示先手玩家
            const turnMessage = document.getElementById('turn-message');
            if (turnMessage) {
                if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
                    turnMessage.textContent = '轮到你先出牌';
                    turnMessage.parentElement.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                } else {
                    turnMessage.textContent = `${currentPlayerName} 先出牌`;
                    turnMessage.parentElement.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
                }
            }
        }
        
        this.hideGameOver();
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
     * @returns {Promise} 发牌完成后 resolve
     */
    dealCardsWithAnimation() {
        return new Promise((resolve) => {
            this.state.players = {
                [PLAYER_POSITIONS.TOP]: [],
                [PLAYER_POSITIONS.LEFT]: [],
                [PLAYER_POSITIONS.RIGHT]: [],
                [PLAYER_POSITIONS.BOTTOM]: []
            };
            
            const positions = Object.values(PLAYER_POSITIONS);
            let cardIndex = 0;
            const handContainer = document.getElementById('my-hand');
            if (!handContainer) {
                console.error('❌ handContainer not found!');
                resolve();
                return;
            }
            handContainer.innerHTML = '';
            
            // 轮流发牌，带动画
            const dealOneCard = () => {
                if (cardIndex >= this.state.deck.length) {
                    // 发牌完成
                    console.log('✅ 发牌完成，共', cardIndex, '张');
                    this.sortHand();
                    this.dealAnimationComplete = true;
                    resolve(); // 通知发牌完成
                    return;
                }
                
                const posIndex = cardIndex % 4;
                const pos = positions[posIndex];
                
                this.state.players[pos].push(this.state.deck[cardIndex]);
                
                // 如果是玩家，添加卡牌到 UI（带动画）
                if (pos === PLAYER_POSITIONS.BOTTOM) {
                    const card = this.state.deck[cardIndex];
                    try {
                        const cardEl = this.createCardElement(card, this.state.players[pos].length - 1);
                        cardEl.classList.add('card-deal-anim');
                        handContainer.appendChild(cardEl);
                    } catch (e) {
                        console.error('❌ 创建卡牌失败:', e);
                    }
                }
                
                cardIndex++;
                
                // 继续发下一张
                setTimeout(dealOneCard, 50);
            };
            
            console.log('🃏 开始发牌，共', this.state.deck.length, '张');
            dealOneCard();
        });
    }
    
    /**
     * 执行贡牌阶段
     */
    async executeTributePhase() {
        this.showGameMessage('进入贡牌阶段');
        
        // 获取上局排名
        const rankings = this.state.previousRankings;
        if (!rankings || rankings.length < 4) {
            // 排名信息不完整，跳过贡牌
            this.startGameAfterTribute();
            return;
        }
        
        // 获取各名次玩家
        const playerByRank = {};
        rankings.forEach(([pos, rank]) => {
            playerByRank[rank] = pos;
        });
        
        const headYou = playerByRank[1];  // 头游
        const erYou = playerByRank[2];    // 二游
        const sanYou = playerByRank[3];   // 三游
        const moYou = playerByRank[4];    // 末游
        
        // 检查抗贡（末游有 2 个大王）
        const moYouHand = this.state.players[moYou];
        const moYouBigJokers = moYouHand.filter(c => c.rank === RANKS.BIG_JOKER).length;
        
        if (moYouBigJokers >= 2) {
            this.showGameMessage(`抗贡！${this.getPlayerName(moYou)} 有${moYouBigJokers}个大王`);
            await this.sleep(1500);
            // 抗贡：头游先出牌
            this.state.currentTurn = headYou;
            this.startGameAfterTribute();
            return;
        }
        
        // 检查是否双贡
        const isDouble = (headYou === PLAYER_POSITIONS.BOTTOM || headYou === PLAYER_POSITIONS.TOP) && 
                        (erYou === PLAYER_POSITIONS.BOTTOM || erYou === PLAYER_POSITIONS.TOP);
        
        if (isDouble) {
            // 双贡：检查两家共有 2 个大王
            const sanYouHand = this.state.players[sanYou];
            const sanYouBigJokers = sanYouHand.filter(c => c.rank === RANKS.BIG_JOKER).length;
            const totalKings = moYouBigJokers + sanYouBigJokers;
            
            if (totalKings >= 2) {
                this.showGameMessage(`抗贡！三游和末游共有${totalKings}个大王`);
                await this.sleep(1500);
                // 抗贡：头游先出牌
                this.state.currentTurn = headYou;
                this.startGameAfterTribute();
                return;
            }
            
            // 执行双贡
            this.showGameMessage('双贡：三游和末游向头游和二游进贡');
            await this.sleep(1000);
            
            // 三游进贡给头游
            await this.executeSingleTribute(sanYou, headYou);
            
            // 末游进贡给二游
            await this.executeSingleTribute(moYou, erYou);
            
            // 双贡后，由进贡方（三游）先出牌
            this.state.currentTurn = sanYou;
        } else {
            // 单贡
            this.showGameMessage(`单贡：${this.getPlayerName(moYou)} → ${this.getPlayerName(headYou)}`);
            await this.sleep(1000);
            
            // 末游进贡给头游
            await this.executeSingleTribute(moYou, headYou);
            
            // 单贡后，由进贡方（末游）先出牌
            this.state.currentTurn = moYou;
        }
        
        this.startGameAfterTribute();
    }
    
    /**
     * 执行单次进贡
     */
    async executeSingleTribute(giverPos, receiverPos) {
        const giverHand = this.state.players[giverPos];
        const receiverHand = this.state.players[receiverPos];
        
        // 选择进贡牌（最大牌，排除红心级牌）
        const tributeCard = this.selectTributeCard(giverHand);
        if (!tributeCard) {
            return;
        }
        
        // 显示贡牌提示
        this.showGameMessage(`${this.getPlayerName(giverPos)} 向 ${this.getPlayerName(receiverPos)} 进贡`);
        
        // 执行进贡动画
        await this.playTributeAnimation(giverPos, receiverPos, tributeCard);
        
        // 转移卡牌
        const giverIndex = giverHand.findIndex(c => 
            c.suit === tributeCard.suit && c.rank === tributeCard.rank
        );
        if (giverIndex !== -1) {
            const card = giverHand.splice(giverIndex, 1)[0];
            receiverHand.push(card);
            receiverHand.sort((a, b) => b.rank - a.rank);
        }
        
        // 还贡
        const returnCard = this.selectReturnCard(receiverHand);
        if (returnCard) {
            this.showGameMessage(`${this.getPlayerName(receiverPos)} 向 ${this.getPlayerName(giverPos)} 还贡`);
            
            // 执行还贡动画
            await this.playReturnTributeAnimation(receiverPos, giverPos, returnCard);
            
            // 转移卡牌
            const receiverIndex = receiverHand.findIndex(c => 
                c.suit === returnCard.suit && c.rank === returnCard.rank
            );
            if (receiverIndex !== -1) {
                const card = receiverHand.splice(receiverIndex, 1)[0];
                giverHand.push(card);
                giverHand.sort((a, b) => b.rank - a.rank);
            }
        }
        
        // 更新 UI
        this.renderMyHand();
        this.updateOtherPlayerCardCount(giverPos);
        this.updateOtherPlayerCardCount(receiverPos);
    }
    
    /**
     * 选择进贡牌
     */
    selectTributeCard(hand) {
        if (hand.length === 0) return null;
        
        // 排序手牌（从大到小）
        const sorted = [...hand].sort((a, b) => {
            const valueA = this.getCardValue(a);
            const valueB = this.getCardValue(b);
            return valueB - valueA;
        });
        
        // 找到最大的非红心级牌
        for (const card of sorted) {
            const isRedHeart = (card.isLevelCard && card.suit === SUITS.HEARTS);
            if (!isRedHeart) {
                return card;
            }
        }
        
        // 如果所有牌都是红心级牌，返回第一张
        return sorted[0];
    }
    
    /**
     * 选择还贡牌（≤10 的牌，选最小的）
     */
    selectReturnCard(hand) {
        if (hand.length === 0) return null;
        
        // 找到所有≤10 的牌
        const validCards = hand.filter(c => c.rank <= RANKS.TEN);
        
        if (validCards.length === 0) return null;
        
        // 返回最小的牌
        validCards.sort((a, b) => a.rank - b.rank);
        return validCards[0];
    }
    
    /**
     * 播放进贡动画
     */
    async playTributeAnimation(giverPos, receiverPos, cardData) {
        const posElements = {
            [PLAYER_POSITIONS.BOTTOM]: document.getElementById('my-hand'),
            [PLAYER_POSITIONS.TOP]: document.getElementById('top-hand'),
            [PLAYER_POSITIONS.LEFT]: document.getElementById('left-hand'),
            [PLAYER_POSITIONS.RIGHT]: document.getElementById('right-hand')
        };
        
        const fromElement = posElements[giverPos];
        const toElement = posElements[receiverPos];
        
        if (fromElement && toElement && window.animationManager) {
            return new Promise(resolve => {
                window.animationManager.tributeAnimation(
                    fromElement,
                    toElement,
                    cardData,
                    resolve
                );
            });
        }
        
        // 如果动画不可用，直接等待
        await this.sleep(800);
    }
    
    /**
     * 播放还贡动画
     */
    async playReturnTributeAnimation(fromPos, toPos, cardData) {
        const posElements = {
            [PLAYER_POSITIONS.BOTTOM]: document.getElementById('my-hand'),
            [PLAYER_POSITIONS.TOP]: document.getElementById('top-hand'),
            [PLAYER_POSITIONS.LEFT]: document.getElementById('left-hand'),
            [PLAYER_POSITIONS.RIGHT]: document.getElementById('right-hand')
        };
        
        const fromElement = posElements[fromPos];
        const toElement = posElements[toPos];
        
        if (fromElement && toElement && window.animationManager) {
            return new Promise(resolve => {
                window.animationManager.returnTributeAnimation(
                    fromElement,
                    toElement,
                    cardData,
                    resolve
                );
            });
        }
        
        // 如果动画不可用，直接等待
        await this.sleep(800);
    }
    
    /**
     * 贡牌结束后开始游戏
     */
    startGameAfterTribute() {
        this.state.gameStatus = 'playing';
        this.updateGameStatus('游戏开始！请出牌');
        this.updateTurnIndicator();
        this.playSound('deal');
        
        const currentPlayerName = this.getPlayerName(this.state.currentTurn);
        this.showGameMessage(`${currentPlayerName} 先出牌`);
        
        // 更新提示条显示先手玩家
        const turnMessage = document.getElementById('turn-message');
        if (turnMessage) {
            if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
                turnMessage.textContent = '轮到你先出牌';
                turnMessage.parentElement.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            } else {
                turnMessage.textContent = `${currentPlayerName} 先出牌`;
                turnMessage.parentElement.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
            }
        }
    }
    
    /**
     * 休眠辅助函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
     * 创建卡牌元素 - 极简设计 v1.4
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
            // 牌面 - 极简设计 v1.4：左上角 + 中央，无右下角
            const rankDisplay = this.getCardRankDisplay(card.rank);
            const suitDisplay = this.getCardSuitDisplay(card.suit);
            const suitColor = this.getCardSuitColor(card.suit, card.rank);
            
            if (card.suit === SUITS.JOKER) {
                // 大小王 - 竖排 JOKER + 王冠
                const jokerClass = card.rank === RANKS.BIG_JOKER ? 'card-joker-big' : 'card-joker-small';
                cardEl.classList.add('card-joker', jokerClass);
                cardEl.innerHTML = `
                    <div class="card-value-top">JOKER</div>
                    <div class="card-suit-center">👑</div>
                `;
            } else {
                // 普通牌 - 左上角竖排牌字 + 小花色，中央大花色
                cardEl.innerHTML = `
                    <div class="card-value-top" style="color: ${suitColor}">${rankDisplay}<span class="suit">${suitDisplay}</span></div>
                    <div class="card-suit-center" style="color: ${suitColor}">${suitDisplay}</div>
                `;
            }
        }
        
        return cardEl;
    }
    
    /**
     * 获取牌面显示字符
     */
    getCardRankDisplay(rank) {
        const display = {
            2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
            7: '7', 8: '8', 9: '9', 10: '10',
            11: 'J', 12: 'Q', 13: 'K', 14: 'A',
            15: '小王', 16: '大王'
        };
        return display[rank] || rank.toString();
    }
    
    /**
     * 获取花色显示符号
     */
    getCardSuitDisplay(suit) {
        const suits = {
            [SUITS.CLUBS]: '♣',
            [SUITS.DIAMONDS]: '♦',
            [SUITS.HEARTS]: '♥',
            [SUITS.SPADES]: '♠',
            [SUITS.JOKER]: ''
        };
        return suits[suit] || '';
    }
    
    /**
     * 获取卡牌颜色
     */
    getCardSuitColor(suit, rank) {
        if (suit === SUITS.JOKER) {
            return rank === RANKS.BIG_JOKER ? '#C41E3A' : '#2E8B57';
        }
        if (suit === SUITS.HEARTS || suit === SUITS.DIAMONDS) {
            return '#C41E3A'; // 红色
        }
        return '#2E8B57'; // 绿色/黑色
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
        const turnMessage = document.getElementById('turn-message');
        const playerName = this.getPlayerName(this.state.currentTurn);
        
        // 更新底部状态栏指示器
        if (indicator) {
            indicator.textContent = `${playerName} 出牌`;
        }
        
        // 更新顶部提示条
        if (turnMessage) {
            if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
                turnMessage.textContent = '轮到你出牌';
                turnMessage.parentElement.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            } else {
                turnMessage.textContent = `轮到 ${playerName} 出牌`;
                turnMessage.parentElement.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
            }
        }
        
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
        
        // 记录排名（根据出完牌的顺序）
        // 简化：假设 winner 是头游，其他按剩余牌数排序
        const positions = Object.values(PLAYER_POSITIONS);
        const rankings = [];
        
        // 头游
        rankings.push([winner, 1]);
        
        // 其他玩家按剩余牌数排序（少的排名靠前）
        const others = positions.filter(p => p !== winner);
        others.sort((a, b) => {
            return this.state.players[a].length - this.state.players[b].length;
        });
        
        // 二游、三游、末游
        rankings.push([others[0], 2]);
        rankings.push([others[1], 3]);
        rankings.push([others[2], 4]);
        
        // 保存排名供下局使用
        this.state.previousRankings = rankings;
        
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
     * 执行贡牌阶段（使用动画）
     * 正确规则：贡牌后由进贡方先出牌，抗贡由头游先出牌
     */
    async executeTributePhase() {
        const tributePanel = document.getElementById('tribute-panel');
        const tributeMessage = document.getElementById('tribute-message');
        const tributeInfo = document.getElementById('tribute-info');
        
        // 获取上局排名
        const rankings = this.state.previousRankings;
        if (!rankings || rankings.length === 0) {
            return;
        }
        
        // 确定头游、二游、三游、末游
        const playerByRank = {};
        rankings.forEach(([position, rank]) => {
            playerByRank[rank] = position;
        });
        
        const headYou = playerByRank[1]; // 头游
        const erYou = playerByRank[2];   // 二游
        const sanYou = playerByRank[3];  // 三游
        const moYou = playerByRank[4];   // 末游
        
        // 判断是否双贡
        const isDouble = ((headYou === 'bottom' && erYou === 'top') || 
                         (headYou === 'top' && erYou === 'bottom') ||
                         (headYou === 'left' && erYou === 'right') ||
                         (headYou === 'right' && erYou === 'left'));
        
        // 检查抗贡（末游有 2 个大王）
        const myHand = this.state.players['bottom'] || [];
        const bigJokerCount = myHand.filter(c => c.rank === RANKS.BIG_JOKER).length;
        
        if (bigJokerCount >= 2 && moYou === 'bottom') {
            // 抗贡
            tributeMessage.textContent = '🎉 抗贡成功！';
            tributeInfo.textContent = '你有 2 个大王，跳过贡牌阶段';
            document.getElementById('resist-section').style.display = 'block';
            tributePanel.classList.add('show');
            // 抗贡：头游先出牌
            this.state.currentTurn = headYou;
            return;
        }
        
        // 显示贡牌信息
        if (isDouble) {
            tributeMessage.textContent = '双贡';
            tributeInfo.textContent = '三游和末游向头游和二游进贡';
        } else {
            tributeMessage.textContent = '单贡';
            tributeInfo.textContent = `末游 (${this.getPlayerName(moYou)}) → 头游 (${this.getPlayerName(headYou)})`;
        }
        
        tributePanel.classList.add('show');
        
        // 执行贡牌动画
        await this.executeTributeAnimation(moYou, headYou, sanYou, erYou, isDouble);
        
        // 贡牌结束，由进贡方先出牌（重要！）
        if (isDouble) {
            // 双贡：三游先出牌（给头游进贡的）
            this.state.currentTurn = sanYou;
        } else {
            // 单贡：末游先出牌
            this.state.currentTurn = moYou;
        }
        
        this.hideTributePanel();
        this.state.gameStatus = 'playing';
        this.updateTurnIndicator();
        this.showGameMessage('贡牌结束，游戏开始！');
    }
    
    /**
     * 执行贡牌动画
     */
    async executeTributeAnimation(moYou, headYou, sanYou, erYou, isDouble) {
        if (!window.animationManager) {
            // 没有动画管理器，直接返回
            await this.sleep(1000);
            return;
        }
        
        if (isDouble) {
            // 双贡：三游→头游，末游→二游
            await this.playSingleTributeAnimation(sanYou, headYou);
            await this.sleep(500);
            await this.playSingleTributeAnimation(moYou, erYou);
        } else {
            // 单贡：末游→头游
            await this.playSingleTributeAnimation(moYou, headYou);
        }
        
        await this.sleep(500);
    }
    
    /**
     * 播放单次贡牌动画
     */
    async playSingleTributeAnimation(fromPos, toPos) {
        const fromPlayer = this.state.players[fromPos] || [];
        const toPlayer = this.state.players[toPos] || [];
        
        // 选择进贡牌（最大牌）
        const sortedHand = [...fromPlayer].sort((a, b) => {
            const aValue = a.isLevelCard ? 14.5 : a.rank;
            const bValue = b.isLevelCard ? 14.5 : b.rank;
            return bValue - aValue;
        });
        
        let tributeCard = sortedHand.find(c => !(c.isLevelCard && c.suit === SUITS.HEARTS));
        if (!tributeCard) tributeCard = sortedHand[0];
        
        // 选择还贡牌（≤10 的最小数）
        const validReturns = toPlayer.filter(c => c.rank <= RANKS.TEN);
        let returnCard = null;
        if (validReturns.length > 0) {
            validReturns.sort((a, b) => a.rank - b.rank);
            returnCard = validReturns[0];
        }
        
        // 播放动画
        return new Promise(resolve => {
            window.animationManager.tributeAnimation({
                fromPosition: fromPos,
                toPosition: toPos,
                tributeCard: tributeCard,
                returnCard: returnCard,
                onComplete: () => {
                    // 更新手牌
                    const tributeIndex = fromPlayer.indexOf(tributeCard);
                    if (tributeIndex > -1) fromPlayer.splice(tributeIndex, 1);
                    
                    if (returnCard) {
                        const returnIndex = toPlayer.indexOf(returnCard);
                        if (returnIndex > -1) toPlayer.splice(returnIndex, 1);
                        fromPlayer.push(returnCard);
                    }
                    
                    // 排序手牌
                    fromPlayer.sort((a, b) => b.rank - a.rank);
                    toPlayer.sort((a, b) => b.rank - a.rank);
                    
                    resolve();
                }
            });
        });
    }
    
    /**
     * 延时工具
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 显示进贡牌选择界面
     */
    showTributeSelect(isDouble) {
        const selectSection = document.getElementById('tribute-select-section');
        const cardsContainer = document.getElementById('tribute-cards-container');
        
        selectSection.style.display = 'block';
        cardsContainer.innerHTML = '';
        
        const myHand = this.state.players['bottom'] || [];
        let selectedCard = null;
        
        // 显示所有手牌供选择
        myHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'tribute-card' + (card.suit === SUITS.HEARTS || card.suit === SUITS.DIAMONDS ? ' red' : ' black');
            cardEl.textContent = RANK_DISPLAY[card.rank];
            cardEl.dataset.index = index;
            
            cardEl.addEventListener('click', () => {
                // 取消其他选择
                document.querySelectorAll('.tribute-card').forEach(c => c.classList.remove('selected'));
                cardEl.classList.add('selected');
                selectedCard = card;
                document.getElementById('btn-tribute-confirm').disabled = false;
            });
            
            cardsContainer.appendChild(cardEl);
        });
        
        // 自动选牌按钮
        document.getElementById('btn-tribute-auto').onclick = () => {
            // 选择最大的非红心级牌
            const sortedHand = [...myHand].sort((a, b) => {
                const aValue = a.isLevelCard ? 14.5 : a.rank;
                const bValue = b.isLevelCard ? 14.5 : b.rank;
                return bValue - aValue;
            });
            
            for (let card of sortedHand) {
                if (!(card.isLevelCard && card.suit === SUITS.HEARTS)) {
                    selectedCard = card;
                    const cardEl = document.querySelector(`.tribute-card[data-index="${myHand.indexOf(card)}"]`);
                    if (cardEl) {
                        document.querySelectorAll('.tribute-card').forEach(c => c.classList.remove('selected'));
                        cardEl.classList.add('selected');
                        document.getElementById('btn-tribute-confirm').disabled = false;
                    }
                    break;
                }
            }
        };
        
        // 确认进贡按钮
        document.getElementById('btn-tribute-confirm').onclick = () => {
            if (selectedCard) {
                // 移除进贡牌
                const index = myHand.indexOf(selectedCard);
                if (index > -1) {
                    myHand.splice(index, 1);
                }
                
                // 添加一张随机牌（还贡）
                const returnCard = myHand.find(c => c.rank <= RANKS.TEN);
                if (returnCard) {
                    // 简化：直接移除一张≤10 的牌
                }
                
                selectSection.style.display = 'none';
                this.hideTributePanel();
                
                // 游戏开始 - 由进贡方先出牌
                this.state.gameStatus = 'playing';
                this.updateTurnIndicator();
                this.startGameAfterTribute();
            }
        };
    }
    
    /**
     * 显示还贡牌选择界面
     */
    showReturnSelect() {
        const selectSection = document.getElementById('return-select-section');
        const cardsContainer = document.getElementById('return-cards-container');
        
        selectSection.style.display = 'block';
        cardsContainer.innerHTML = '';
        
        const myHand = this.state.players['bottom'] || [];
        let selectedCard = null;
        
        // 只显示≤10 的牌
        const validCards = myHand.filter(c => c.rank <= RANKS.TEN);
        
        if (validCards.length === 0) {
            selectSection.style.display = 'none';
            this.hideTributePanel();
            return;
        }
        
        validCards.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'tribute-card' + (card.suit === SUITS.HEARTS || card.suit === SUITS.DIAMONDS ? ' red' : ' black');
            cardEl.textContent = RANK_DISPLAY[card.rank];
            
            cardEl.addEventListener('click', () => {
                document.querySelectorAll('.tribute-card').forEach(c => c.classList.remove('selected'));
                cardEl.classList.add('selected');
                selectedCard = card;
                document.getElementById('btn-return-confirm').disabled = false;
            });
            
            cardsContainer.appendChild(cardEl);
        });
        
        // 自动选牌按钮（选最小的）
        document.getElementById('btn-return-auto').onclick = () => {
            const sortedCards = [...validCards].sort((a, b) => a.rank - b.rank);
            selectedCard = sortedCards[0];
            const cardEl = document.querySelector(`.tribute-card`);
            if (cardEl) {
                document.querySelectorAll('.tribute-card').forEach(c => c.classList.remove('selected'));
                cardEl.classList.add('selected');
                document.getElementById('btn-return-confirm').disabled = false;
            }
        };
        
        // 确认还贡按钮
        document.getElementById('btn-return-confirm').onclick = () => {
            if (selectedCard) {
                const index = myHand.indexOf(selectedCard);
                if (index > -1) {
                    myHand.splice(index, 1);
                }
                
                selectSection.style.display = 'none';
                this.hideTributePanel();
                
                // 游戏开始 - 由进贡方先出牌
                this.state.gameStatus = 'playing';
                this.updateTurnIndicator();
                this.startGameAfterTribute();
            }
        };
    }
    
    /**
     * 隐藏贡牌面板
     */
    hideTributePanel() {
        document.getElementById('tribute-panel').classList.remove('show');
        document.getElementById('tribute-select-section').style.display = 'none';
        document.getElementById('return-select-section').style.display = 'none';
        document.getElementById('resist-section').style.display = 'none';
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
    
    /**
     * 调试模式
     */
    enableDebugMode() {
        console.log('🎮 调试模式已启用 - 访问 https://github.com/chowkai/guandan-master');
        
        // 暴露 game 实例到全局
        window.gameInstance = this;
        window.game = this;
        
        // 调试命令
        window.debug = {
            forcePlayerTurn: () => {
                this.state.currentTurn = PLAYER_POSITIONS.BOTTOM;
                this.state.gameStatus = 'playing';
                this.updateTurnIndicator();
                console.log('✅ 已强制玩家回合');
            },
            
            skipDealAnimation: () => {
                this.dealAnimationComplete = true;
                console.log('✅ 已跳过发牌动画');
            },
            
            status: () => {
                const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
                console.table({
                    currentTurn: this.state.currentTurn,
                    gameStatus: this.state.gameStatus,
                    myHandSize: myHand ? myHand.length : 0,
                    isPlayerTurn: this.state.currentTurn === PLAYER_POSITIONS.BOTTOM,
                    lastHandPlayer: this.state.lastHandPlayer
                });
            },
            
            autoPlay: async (times = 5) => {
                console.log(`🔄 开始自动出牌 ${times} 次...`);
                for (let i = 0; i < times; i++) {
                    if (this.state.currentTurn === PLAYER_POSITIONS.BOTTOM) {
                        const myHand = this.state.players[PLAYER_POSITIONS.BOTTOM];
                        if (myHand && myHand.length > 0) {
                            const card = myHand[0];
                            this.playCard([card]);
                            console.log(`✅ 出牌：${card.rank}${card.suit}`);
                            await this.sleep(1000);
                        }
                    }
                    await this.sleep(500);
                }
                console.log('✅ 自动出牌完成');
            },
            
            reset: () => {
                this.startNewGame();
                console.log('✅ 已重置游戏');
            }
        };
        
        console.log('🔧 可用调试命令:');
        console.log('  debug.status() - 查看游戏状态');
        console.log('  debug.forcePlayerTurn() - 强制玩家回合');
        console.log('  debug.skipDealAnimation() - 跳过发牌动画');
        console.log('  debug.autoPlay(5) - 自动出牌 5 次');
        console.log('  debug.reset() - 重置游戏');
        console.log('  window.game - 访问游戏实例');
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
