<script lang="ts">
  import { push } from 'svelte-spa-router';

  function goHome() {
    push('/');
  }
</script>

<div class="min-h-screen bg-black flex flex-col items-center justify-center px-4">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-white mb-4">404</h1>
    <p class="text-xl text-gray-400 mb-8">Página não encontrada</p>
    <button
      onclick={goHome}
      class="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
    >
      Voltar para o início
    </button>
  </div>
</div>
