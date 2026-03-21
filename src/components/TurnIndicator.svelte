<script>
  import { game } from '../stores/game'
  
  $: currentPlayerName = (() => {
    const names = {
      top: '对家',
      left: 'AI 左',
      right: 'AI 右',
      bottom: '我'
    }
    return names[$game.currentTurn || 'bottom']
  })()
  
  $: isPlayerTurn = $game.currentTurn === 'bottom'
  $: message = $game.gameStatus === 'playing'
    ? (isPlayerTurn ? '轮到你出牌' : `轮到 ${currentPlayerName} 出牌`)
    : '游戏准备中...'
  $: bgColor = isPlayerTurn 
    ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
    : 'linear-gradient(135deg, #c0392b, #e74c3c)'
</script>

<div class="turn-indicator" style="background: {bgColor}">
  <span class="turn-message">{message}</span>
</div>

<style>
  .turn-indicator {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 40px;
    border-radius: 25px;
    color: white;
    font-size: 20px;
    font-weight: bold;
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    z-index: 2000;
    border: 2px solid gold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    animation: pulse 2s ease-in-out infinite;
    transition: background 0.3s ease;
  }
  
  .turn-message {
    white-space: nowrap;
  }
  
  @keyframes pulse {
    0%, 100% { 
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      transform: translateX(-50%) scale(1);
    }
    50% { 
      box-shadow: 0 8px 30px rgba(231,76,60,0.6);
      transform: translateX(-50%) scale(1.02);
    }
  }
</style>
