<script lang="ts">
  import GameTable from './components/GameTable.svelte'
  import StartScreen from './components/StartScreen.svelte'
  import { game } from './stores/game'
  
  let isStarted = false
  
  function handleGameStart() {
    isStarted = true
    game.startNewGame()
  }
</script>

<main class="app">
  {#if !isStarted}
    <StartScreen on:start={handleGameStart} />
  {:else}
    <GameTable />
  {/if}
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  :global(html) {
    width: 100%;
    height: 100%;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Noto Serif SC', 'Microsoft YaHei', sans-serif;
    background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
    background-attachment: fixed;
    color: white;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  
  :global(#app) {
    width: 100%;
    height: 100%;
  }
  
  .app {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
