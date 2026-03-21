<script>
  import { game } from '../stores/game'
  import PlayerArea from './PlayerArea.svelte'
  import TurnIndicator from './TurnIndicator.svelte'
  import Card from './Card.svelte'
  import { validateHand, canBeat } from '../utils/rules.js'
  
  let selectedCards = []
  let errorMsg = ''
  
  function toggleCard(card) {
    const index = selectedCards.indexOf(card)
    if (index > -1) {
      selectedCards = selectedCards.filter(c => c !== card)
    } else {
      selectedCards = [...selectedCards, card]
    }
  }
  
  function playCards() {
    if (selectedCards.length === 0) {
      errorMsg = '请选择牌'
      setTimeout(() => errorMsg = '', 2000)
      return
    }
    if ($game.currentTurn !== 'bottom') return
    
    // 验证牌型
    const result = validateHand(selectedCards)
    if (!result.valid) {
      errorMsg = result.message
      setTimeout(() => errorMsg = '', 2000)
      return
    }
    
    // 检查是否能管上
    if ($game.lastHand && $game.lastHand.player !== 'bottom') {
      if (!canBeat(selectedCards, $game.lastHand.cards)) {
        errorMsg = '管不上！'
        setTimeout(() => errorMsg = '', 2000)
        return
      }
    }
    
    // 出牌
    game.playCards('bottom', selectedCards)
    const cardCount = selectedCards.length
    selectedCards = []
    errorMsg = ''
    
    console.log(`💬 你出了${cardCount}张牌`)
    
    // 检查是否胜利
    if ($game.players.bottom.length === 0) {
      alert('🎉 你赢了！')
      return
    }
    
    // 切换到下一回合（AI 立即出牌）
    setTimeout(() => {
      game.nextTurn()
    }, 300)
  }
  
  function pass() {
    if ($game.currentTurn !== 'bottom') return
    console.log('💬 你不要')
    game.nextTurn()
  }
</script>

<div class="game-table">
  <!-- 顶部提示条 -->
  <TurnIndicator />
  
  <!-- 上方玩家（对家） -->
  <PlayerArea position="top" />
  
  <!-- 左侧玩家 -->
  <PlayerArea position="left" />
  
  <!-- 右侧玩家 -->
  <PlayerArea position="right" />
  
  <!-- 级数显示 -->
  <div class="level-display">
    <div class="level-info">
      <span class="level-label">当前级数</span>
      <span class="level-value">{$game.currentLevel}</span>
    </div>
    <div class="game-info">
      <span class="game-label">第</span>
      <span class="game-value">{$game.currentPlayer}</span>
      <span class="game-label">局</span>
    </div>
  </div>
  
  <!-- 中央出牌区 - 显示每家出牌 -->
  <div class="center-area">
    <!-- 对家出牌区 -->
    {#if $game.lastHand && $game.lastHand.player === 'top'}
      <div class="played-area top">
        <div class="played-label">对家</div>
        <div class="played-cards">
          {#each $game.lastHand.cards as card}
            <Card {card} small />
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- 左家出牌区 -->
    {#if $game.lastHand && $game.lastHand.player === 'left'}
      <div class="played-area left">
        <div class="played-label">左家</div>
        <div class="played-cards">
          {#each $game.lastHand.cards as card}
            <Card {card} small />
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- 右家出牌区 -->
    {#if $game.lastHand && $game.lastHand.player === 'right'}
      <div class="played-area right">
        <div class="played-label">右家</div>
        <div class="played-cards">
          {#each $game.lastHand.cards as card}
            <Card {card} small />
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- 玩家出牌区 -->
    {#if $game.lastHand && $game.lastHand.player === 'bottom'}
      <div class="played-area bottom">
        <div class="played-label">我</div>
        <div class="played-cards">
          {#each $game.lastHand.cards as card}
            <Card {card} small />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- 玩家手牌区 -->
  <div class="player-hand-area">
    <!-- 操作栏 -->
    <div class="action-bar">
      {#if errorMsg}
        <div class="error-message">{errorMsg}</div>
      {/if}
      
      <button 
        class="btn-clear" 
        disabled={selectedCards.length === 0}
        on:click={() => selectedCards = []}
      >
        🔄 重选
      </button>
      
      <button 
        class="btn-play" 
        disabled={selectedCards.length === 0 || $game.currentTurn !== 'bottom'}
        on:click={playCards}
      >
        出牌
      </button>
      <button 
        class="btn-pass"
        disabled={$game.currentTurn !== 'bottom'}
        on:click={pass}
      >
        不要
      </button>
    </div>
    
    <!-- 出牌提示 -->
    {#if $game.lastHand}
      <div class="play-hint">
        {#if $game.lastHand.player === 'top'}
          💬 对家出了{$game.lastHand.cards.length}张牌
        {:else if $game.lastHand.player === 'left'}
          💬 左家出了{$game.lastHand.cards.length}张牌
        {:else if $game.lastHand.player === 'right'}
          💬 右家出了{$game.lastHand.cards.length}张牌
        {:else}
          💬 你出了{$game.lastHand.cards.length}张牌
        {/if}
      </div>
    {/if}
    
    <div class="my-hand">
      {#each $game.players.bottom as card, i (i)}
        <Card 
          {card} 
          selected={selectedCards.includes(card)}
          on:toggle={() => toggleCard(card)}
        />
      {/each}
    </div>
    
    <!-- 不显眼的控制按钮 -->
    <div class="hand-controls">
      <button class="btn-sort" on:click={() => {}}>🌸</button>
      <button class="btn-sort" on:click={() => {}}>🔢</button>
      <button class="btn-hint" on:click={() => {}}>💡</button>
    </div>
  </div>
</div>

<style>
  .game-table {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: grid;
    grid-template-areas:
      ". top ."
      "left center right"
      ". bottom .";
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 1fr 1fr 1.5fr;
  }
  
  :global(.player-top) { grid-area: top; }
  :global(.player-left) { grid-area: left; }
  :global(.player-right) { grid-area: right; }
  
  .center-area {
    grid-area: center;
    position: relative;
    display: grid;
    grid-template-areas:
      ". top ."
      "left center right"
      ". bottom .";
    grid-template-columns: 1fr 1.5fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
  }
  
  .played-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0,0,0,0.4);
    border-radius: 15px;
    min-height: 220px;
    min-width: 180px;
  }
  
  .played-area.top { grid-area: top; }
  .played-area.left { grid-area: left; }
  .played-area.right { grid-area: right; }
  .played-area.bottom { grid-area: bottom; }
  
  .played-label {
    font-size: 20px;
    color: gold;
    font-weight: bold;
    margin-bottom: 15px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }
  
  .played-cards {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .level-display {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    gap: 30px;
    background: rgba(0,0,0,0.6);
    padding: 15px 30px;
    border-radius: 20px;
    border: 2px solid gold;
    z-index: 100;
    white-space: nowrap;
  }
  
  .level-info, .game-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    font-size: 18px;
  }
  
  .level-label, .game-label {
    opacity: 0.8;
  }
  
  .level-value, .game-value {
    font-size: 28px;
    font-weight: bold;
    color: gold;
  }
  
  .last-hand {
    text-align: center;
  }
  
  .last-hand-label {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 10px;
  }
  
  .last-hand-cards {
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  
  .player-hand-area {
    grid-area: bottom;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 20px;
  }
  
  .action-bar {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px 30px;
    background: rgba(0,0,0,0.5);
    border-radius: 25px;
  }
  
  .play-hint {
    position: fixed;
    top: 150px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    color: gold;
    font-weight: bold;
    background: rgba(0,0,0,0.7);
    padding: 12px 30px;
    border-radius: 20px;
    border: 2px solid gold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    z-index: 200;
    white-space: nowrap;
  }
  
  .error-message {
    color: #ff6b6b;
    font-size: 18px;
    font-weight: bold;
    background: rgba(255,255,255,0.95);
    padding: 10px 25px;
    border-radius: 15px;
    animation: pulse 0.5s ease-in-out;
    min-width: 120px;
    text-align: center;
  }
  
  .btn-play, .btn-pass, .btn-clear {
    padding: 12px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .btn-play {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: white;
  }
  
  .btn-play:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-pass {
    background: linear-gradient(135deg, #95a5a6, #bdc3c7);
    color: white;
  }
  
  .btn-pass:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-clear {
    background: linear-gradient(135deg, #e74c3c, #ff6b6b);
    color: white;
  }
  
  .hand-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    opacity: 0.6;
  }
  
  .hand-controls:hover {
    opacity: 1;
  }
  
  .btn-sort, .btn-hint {
    padding: 6px 12px;
    border: none;
    border-radius: 15px;
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s;
  }
  
  .btn-sort:hover, .btn-hint:hover {
    background: rgba(255,255,255,0.3);
    color: white;
  }
  
  .my-hand {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin: 10px 0;
    padding: 20px 40px;
    background: rgba(0,0,0,0.3);
    border-radius: 20px;
    max-width: 1400px;
    overflow-x: auto;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .btn-play, .btn-pass {
    padding: 15px 40px;
    border: none;
    border-radius: 30px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .btn-play {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: white;
  }
  
  .btn-play:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-pass {
    background: linear-gradient(135deg, #c0392b, #e74c3c);
    color: white;
  }
  
  .btn-pass:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
