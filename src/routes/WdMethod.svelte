<script lang="ts">
  import { push } from 'svelte-spa-router';

  let selectedMethod = $state<'pix' | null>(null);

  function handleContinue() {
    if (selectedMethod) {
      push('/add');
    }
  }
</script>

<div class="min-h-screen bg-black flex flex-col">
  <header class="bg-black py-4 flex justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-8" />
  </header>

  <main class="flex-1 flex flex-col items-center px-4 pb-8">
    <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
      <h2 class="text-xl font-semibold text-gray-900 mb-2 text-center">
        Método de saque
      </h2>
      <p class="text-gray-500 text-sm text-center mb-6">
        Escolha como deseja receber seu saldo
      </p>

      <button
        onclick={() => selectedMethod = 'pix'}
        class={`w-full p-4 rounded-lg border-2 mb-4 flex items-center gap-4 transition-all ${
          selectedMethod === 'pix'
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-gray-900">PIX</p>
          <p class="text-sm text-gray-500">Receba em até 5 minutos</p>
        </div>
        {#if selectedMethod === 'pix'}
          <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        {/if}
      </button>

      <button
        disabled
        class="w-full p-4 rounded-lg border-2 border-gray-200 mb-6 flex items-center gap-4 opacity-50 cursor-not-allowed"
      >
        <div class="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6z" />
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-gray-500">Transferência bancária</p>
          <p class="text-sm text-gray-400">Indisponível no momento</p>
        </div>
      </button>

      <button
        onclick={handleContinue}
        disabled={!selectedMethod}
        class={`w-full py-4 rounded-lg font-semibold transition-colors ${
          selectedMethod
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continuar
      </button>
    </div>

    <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
  </main>
</div>
