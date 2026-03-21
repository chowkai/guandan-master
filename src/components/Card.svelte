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
      <span class="joker-icon">👑</span>
      <span class="joker-label">{card.rank === 'big_joker' ? '大王' : '小王'}</span>
    {:else}
      <span class="big-suit" style="color: {cardColor}">{cardIcon}</span>
    {/if}
  </div>
  
  <div class="card-bottom">
    <span class="card-rank">{card.rank}</span>
    <span class="card-suit" style="color: {cardColor}">{cardIcon}</span>
  </div>
</div>

<style>
  .card {
    width: 80px;
    height: 112px;
    background: white;
    border: 3px solid;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    position: relative;
    margin-left: -40px;
  }
  
  .card:first-child {
    margin-left: 0;
  }
  
  .card:hover {
    transform: translateY(-15px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
  }
  
  .card.selected {
    transform: translateY(-25px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    border-width: 4px;
    border-color: gold !important;
  }
  
  .card.small {
    width: 50px;
    height: 70px;
    margin-left: -20px;
  }
  
  .card-center {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56px;
  }
  
  .card.small .card-center {
    font-size: 36px;
  }
  
  .joker-icon {
    font-size: 40px;
  }
  
  .joker-label {
    font-size: 10px;
    color: #f39c12;
    font-weight: bold;
  }
  
  /* 隐藏牌面数字 */
  .card-top, .card-bottom {
    display: none;
  }
</style>
