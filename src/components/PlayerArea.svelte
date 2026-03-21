<script>
  import { game } from '../stores/game'
  
  export let position
  
  const playerNames: Record<PlayerPosition, string> = {
    top: '对家',
    left: 'AI 左',
    right: 'AI 右',
    bottom: '我'
  }
  
  const avatars: Record<PlayerPosition, string> = {
    top: '🧑‍💻',
    left: '🤖',
    right: '🤖',
    bottom: '👤'
  }
  
  $: handSize = $game.players[position]?.length || 0
  $: isCurrentTurn = $game.currentTurn === position
</script>

<div class="player-area player-{position}" class:active={isCurrentTurn}>
  <div class="player-info">
    <div class="player-avatar">{avatars[position]}</div>
    <div class="player-name">{playerNames[position]}</div>
    <div class="player-status">
      <span class="card-count">剩余：{handSize}张</span>
      {#if isCurrentTurn}
        <span class="thinking-badge">思考中...</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .player-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    transition: all 0.3s;
  }
  
  .player-info {
    text-align: center;
  }
  
  .player-avatar {
    font-size: 48px;
    margin-bottom: 10px;
  }
  
  .player-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .player-status {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 14px;
  }
  
  .card-count {
    opacity: 0.9;
  }
  
  .thinking-badge {
    background: rgba(255,255,255,0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  .player-area.active {
    transform: scale(1.05);
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
