<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';

  let balance = $state(1847.93);
  let isLoading = $state(true);

  onMount(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 2000);

    return () => clearTimeout(timer);
  });

  function handleWithdraw() {
    push('/wd-method');
  }
</script>

{#if isLoading}
  <div class="min-h-screen bg-black flex flex-col items-center justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-12 mb-8" />
    <div class="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r from-cyan-400 to-pink-500 animate-pulse rounded-full" style="width: 70%"></div>
    </div>
    <p class="text-white mt-4">Carregando saldo...</p>
  </div>
{:else}
  <div class="min-h-screen bg-black flex flex-col">
    <header class="bg-black py-4 flex justify-center">
      <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-8" />
    </header>

    <main class="flex-1 flex flex-col items-center px-4 pb-8">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-900 mb-2 text-center">
          Saldo disponível para saque
        </h2>
        <p class="text-gray-500 text-sm text-center mb-6">
          Você completou as tarefas com sucesso!
        </p>

        <div class="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 mb-6">
          <p class="text-gray-400 text-sm">Saldo disponível</p>
          <p class="text-3xl font-bold text-white">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Tarefas concluídas</p>
              <p class="text-sm text-gray-500">Todas as etapas foram completadas</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Saque via PIX</p>
              <p class="text-sm text-gray-500">Receba em até 5 minutos</p>
            </div>
          </div>
        </div>

        <button
          onclick={handleWithdraw}
          class="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Sacar agora
        </button>
      </div>

      <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
    </main>
  </div>
{/if}
