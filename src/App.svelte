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

  onMount(() => {
    utmfy.trackPageView();
  });
</script>

<Router {routes} />
