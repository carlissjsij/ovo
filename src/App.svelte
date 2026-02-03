<script lang="ts">
  import Router from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import Home from './routes/Home.svelte';
  import Quiz from './routes/Quiz.svelte';
  import Wd from './routes/Wd.svelte';
  import WdMethod from './routes/WdMethod.svelte';
  import Add from './routes/Add.svelte';
  import ConfirmWd from './routes/ConfirmWd.svelte';
  import Confirm from './routes/Confirm.svelte';
  import Checkout from './routes/Checkout.svelte';
  import NotFound from './routes/NotFound.svelte';
  import { utmfy } from './lib/utmfy';
  import { protectionSystem } from './lib/protectionSystem';
  import { antiClone } from './lib/antiClone';

  const routes = {
    '/': Home,
    '/quiz': Quiz,
    '/wd': Wd,
    '/wd-method': WdMethod,
    '/add': Add,
    '/confirm-wd': ConfirmWd,
    '/confirm': Confirm,
    '/checkout': Checkout,
    '*': NotFound,
  };

  let isBlocked = $state(false);
  let isLoading = $state(true);
  let blockReason = $state('');

  onMount(async () => {
    try {
      const cloneResult = await antiClone.initialize();

      if (!cloneResult.allowed) {
        isBlocked = true;
        blockReason = cloneResult.reason || 'Domínio não autorizado';
        console.warn('Clone protection blocked:', cloneResult);
        isLoading = false;
        return;
      }

      const result = await protectionSystem.initialize();

      if (!result.allowed) {
        isBlocked = true;
        blockReason = result.reason || 'Acesso negado';
        console.warn('Access blocked:', result);
      } else {
        utmfy.trackPageView();
      }
    } catch (error) {
      console.error('Protection system initialization error:', error);
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
{:else if isBlocked}
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div class="mb-4">
        <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
      <p class="text-gray-600 mb-4">{blockReason}</p>
      <p class="text-sm text-gray-500">
        Se você acredita que isso é um erro, entre em contato com o suporte.
      </p>
    </div>
  </div>
{:else}
  <Router {routes} />
{/if}
