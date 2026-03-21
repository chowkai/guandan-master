<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher<{
    start: void
  }>()
  
  function handleStart() {
    dispatch('start')
  }
</script>

<div class="start-screen">
  <h1 class="start-screen-title">掼蛋大师 v2</h1>
  <p class="start-screen-subtitle">Guandan Master - 经典扑克游戏</p>
  
  <div class="start-screen-buttons">
    <button class="start-btn btn-primary" on:click={handleStart}>
      🎮 新游戏
    </button>
    <button class="start-btn">
      ⚙️ 设置
    </button>
    <button class="start-btn">
      ❓ 游戏规则
    </button>
  </div>
</div>

<style>
  .start-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
    z-index: 3000;
  }
  
  .start-screen-title {
    font-size: 64px;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    margin-bottom: 10px;
  }
  
  .start-screen-subtitle {
    font-size: 24px;
    color: rgba(255,255,255,0.9);
    margin-bottom: 60px;
  }
  
  .start-screen-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .start-btn {
    padding: 20px 60px;
    font-size: 24px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.3s;
    font-family: inherit;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #f39c12, #f1c40f);
    color: #2c3e50;
    font-weight: bold;
    box-shadow: 0 6px 20px rgba(243,156,18,0.4);
  }
  
  .btn-primary:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(243,156,18,0.6);
  }
  
  .start-btn:not(.btn-primary) {
    background: rgba(255,255,255,0.2);
    color: white;
  }
  
  .start-btn:not(.btn-primary):hover {
    background: rgba(255,255,255,0.3);
  }
</style>
