<script lang="ts">
  import { game } from '../stores/game'
  import PlayerArea from './PlayerArea.svelte'
  import TurnIndicator from './TurnIndicator.svelte'
  import Card from './Card.svelte'
  
  let selectedCards: Card[] = $state([])
  
  function toggleCard(card: Card) {
    const index = selectedCards.indexOf(card)
    if (index > -1) {
      selectedCards = selectedCards.filter(c => c !== card)
    } else {
      selectedCards = [...selectedCards, card]
    }
  }
  
  function playCards() {
    if (selectedCards.length === 0) return
    if ($game.currentTurn !== 'bottom') return
    
    // 出牌
    game.playCards('bottom', selectedCards)
    const playedCards = [...selectedCards]
    selectedCards = []
    
    // 检查是否胜利
    if ($game.players.bottom.length === 0) {
      alert('🎉 你赢了！')
      return
    }
    
    // 切换到下一回合
    setTimeout(() => {
      game.nextTurn()
    }, 1000)
  }
  
  function pass() {
    if ($game.currentTurn !== 'bottom') return
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
  
  <!-- 中央出牌区 -->
  <div class="center-area">
    {#if $game.lastHand}
      <div class="last-hand">
        <div class="last-hand-label">最后出牌</div>
        <div class="last-hand-cards">
          {#each $game.lastHand.cards as card}
            <Card {card} small />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- 玩家手牌区 -->
  <div class="player-hand-area">
    <div class="hand-controls">
      <button class="btn-sort" on:click={() => {}}>🌸 排序</button>
      <button class="btn-sort" on:click={() => {}}>🔢 数字</button>
      <button class="btn-hint" on:click={() => {}}>💡 提示</button>
    </div>
    
    <div class="my-hand">
      {#each $game.players.bottom as card, i (i)}
        <Card 
          {card} 
          selected={selectedCards.includes(card)}
          on:toggle={() => toggleCard(card)}
        />
      {/each}
    </div>
    
    <div class="action-buttons">
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
    display: flex;
    align-items: center;
    justify-content: center;
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
  
  .hand-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .btn-sort, .btn-hint {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background: rgba(255,255,255,0.2);
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .btn-sort:hover, .btn-hint:hover {
    background: rgba(255,255,255,0.3);
  }
  
  .my-hand {
    display: flex;
    gap: -30px;
    margin: 10px 0;
  }
  
  .action-buttons {
    display: flex;
    gap: 20px;
    margin-top: 20px;
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
