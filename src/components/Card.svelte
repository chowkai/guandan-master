<script>
  import { createEventDispatcher } from 'svelte'
  
  export let card
  export let selected = false
  export let small = false
  
  let isFlipped = false
  
  const dispatch = createEventDispatcher()
  
  function handleClick() {
    if (!small) {
      isFlipped = !isFlipped
      dispatch('toggle', { card })
    }
  }
  
  const suitIcons = {
    clubs: '♣',
    diamonds: '♦',
    hearts: '♥',
    spades: '♠',
    joker: '👑'
  }
  
  const suitColors = {
    clubs: '#2c3e50',
    diamonds: '#e74c3c',
    hearts: '#e74c3c',
    spades: '#2c3e50',
    joker: '#f39c12'
  }
  
  $: cardColor = suitColors[card.suit]
  $: cardIcon = suitIcons[card.suit]
  $: cardClass = small ? 'card small' : `card ${selected ? 'selected' : ''}`
</script>

<div class={cardClass} style="border-color: {cardColor}" on:click={handleClick}>
  <div class="card-top">
    <span class="card-rank">{card.rank}</span>
    <span class="card-suit" style="color: {cardColor}">{cardIcon}</span>
  </div>
  
  <div class="card-center">
    {#if card.suit === 'joker'}
      <div style="text-align: center;">
        <span class="joker-icon">👑</span>
        <br/>
        <span class="joker-label">{card.rank === 'big_joker' ? '大王' : '小王'}</span>
      </div>
    {:else}
      <span class="big-suit" style="color: {cardColor}">{cardIcon}</span>
    {/if}
  </div>
</div>

<style>
  .card {
    width: 140px;
    height: 210px;
    background: linear-gradient(145deg, #fff, #f0f0f0);
    border: 2px solid #333;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    position: relative;
    margin-left: -70px;
    overflow: hidden;
    aspect-ratio: 2 / 3;
  }
  
  .card:first-child {
    margin-left: 0;
  }
  
  .card:hover {
    transform: translateY(-20px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  }
  
  .card.selected {
    transform: translateY(-30px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
    border-width: 3px;
    border-color: gold !important;
  }
  
  .card.small {
    width: 140px;
    height: 210px;
    margin-left: -35px;
  }
  
  /* 左上角牌字 */
  .card-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
  }
  
  .card-rank {
    font-size: 28px;
    font-weight: bold;
  }
  
  .card-suit {
    font-size: 24px;
  }
  
  .card-bottom {
    display: none;
  }
  
  /* 中心大花色 */
  .card-center {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 96px;
    opacity: 0.9;
  }
  
  .card.small .card-center {
    font-size: 96px;
  }
  
  .joker-icon {
    font-size: 72px;
  }
  
  .joker-label {
    font-size: 16px;
    color: #f39c12;
    font-weight: bold;
    margin-top: 4px;
  }
  
  .card-top {
    position: absolute;
    top: 6px;
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
  }
  
  .card.small .card-top {
    font-size: 20px;
  }
</style>
