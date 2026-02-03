<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';

  let showWelcome = $state(true);
  let onlineCount = $state(Math.floor(Math.random() * 500) + 1000);
  let timeLeft = $state(15 * 60);
  let intervalId: number | undefined = $state(undefined);

  onMount(() => {
    const timer = setTimeout(() => {
      showWelcome = false;
      startTimer();
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  });

  function startTimer() {
    intervalId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    }, 1000) as unknown as number;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function handleResgate() {
    push('/quiz');
  }
</script>

{#if showWelcome}
  <div class="min-h-screen bg-black flex flex-col items-center justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="w-32 h-32 mb-6" />
    <h1 class="text-white text-2xl font-semibold">Bem-vindo ao TikTok</h1>
  </div>
{:else}
  <div class="min-h-screen bg-black flex flex-col">
    <header class="bg-black py-4 flex justify-center">
      <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-8" />
    </header>

    <div class="flex justify-center py-4">
      <div class="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        AO VIVO: {onlineCount.toLocaleString('pt-BR')} pessoas online
      </div>
    </div>

    <main class="flex-1 flex flex-col items-center px-4 pb-8">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 class="text-center text-xl font-semibold text-gray-900 mb-6">
          Sua conta foi validada<br />com sucesso!
        </h2>

        <div class="border border-gray-200 rounded-lg p-4 mb-6">
          <p class="text-center">
            <span class="font-semibold">Parabéns</span>
          </p>
          <p class="text-center text-gray-600 text-sm mt-2">
            Você foi selecionado para participar de uma{' '}
            <span class="font-semibold text-gray-900">Tarefa de Monetização</span>{' '}
            exclusiva do TikTok!
          </p>
        </div>

        <div class="text-center mb-6">
          <p class="text-gray-500 text-sm">Ganhe até</p>
          <p class="text-4xl font-bold text-gray-900">R$ 2.000,00</p>
          <p class="text-gray-500 text-sm">agora mesmo!</p>
        </div>

        <button
          onclick={handleResgate}
          class="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          Resgate agora
        </button>

        <div class="text-center mt-6">
          <p class="text-3xl font-bold text-gray-900">{formatTime(timeLeft)}</p>
          <p class="text-gray-500 text-sm mt-2">
            Responda dentro do tempo e libere sua recompensa. Caso o prazo acabe,{' '}
            <span class="text-red-500">a premiação será encerrada.</span>
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg w-full max-w-md p-4 mt-4 flex items-start gap-3">
        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900">Site oficial de resgate TikTok</p>
          <p class="text-gray-500 text-sm">
            Esta é a plataforma oficial do TikTok. Evite golpes e sites falsos.
            Nunca compartilhe suas senhas com terceiros.
          </p>
        </div>
      </div>

      <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
    </main>
  </div>
{/if}
