<script lang="ts">
  import Router from 'svelte-spa-router';
  import Home from './routes/Home.svelte';
  import Quiz from './routes/Quiz.svelte';
  import Wd from './routes/Wd.svelte';
  import WdMethod from './routes/WdMethod.svelte';
  import Add from './routes/Add.svelte';
  import ConfirmWd from './routes/ConfirmWd.svelte';
  import Confirm from './routes/Confirm.svelte';
  import Checkout from './routes/Checkout.svelte';
  import NotFound from './routes/NotFound.svelte';

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
</script>

<div class="app">
  <Router {routes} />
</div>

<style>
  .app {
    width: 100%;
    height: 100%;
  }
</style>
