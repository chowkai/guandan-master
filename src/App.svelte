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
  
  :global(body) {
    font-family: 'Noto Serif SC', serif;
    background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
    color: white;
    overflow: hidden;
  }
  
  .app {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>
