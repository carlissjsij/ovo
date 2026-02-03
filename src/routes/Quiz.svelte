<script lang="ts">
  import { push } from 'svelte-spa-router';
  import Progress from '$lib/components/Progress.svelte';

  const questions = [
    {
      question: 'Qual é o nome da rede social que você está usando?',
      options: ['Instagram', 'TikTok', 'Facebook', 'Twitter'],
      correct: 1,
    },
    {
      question: 'Qual funcionalidade permite gravar vídeos curtos?',
      options: ['Stories', 'Reels', 'Dueto', 'Todas anteriores'],
      correct: 3,
    },
    {
      question: 'Quantos segundos pode ter um vídeo curto no TikTok?',
      options: ['15 segundos', '60 segundos', '3 minutos', 'Todas anteriores'],
      correct: 3,
    },
    {
      question: 'Qual é o símbolo do TikTok?',
      options: ['Coração', 'Nota musical', 'Câmera', 'Estrela'],
      correct: 1,
    },
    {
      question: 'O que significa "FYP" no TikTok?',
      options: ['Follow Your Page', 'For You Page', 'Find Your Profile', 'First Year Post'],
      correct: 1,
    },
  ];

  let currentQuestion = $state(0);
  let selectedOption = $state<number | null>(null);
  let isAnswered = $state(false);

  let progress = $derived(((currentQuestion + 1) / questions.length) * 100);

  function handleSelect(index: number) {
    if (isAnswered) return;
    selectedOption = index;
    isAnswered = true;

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        selectedOption = null;
        isAnswered = false;
      } else {
        push('/wd');
      }
    }, 1000);
  }

  function getOptionClass(index: number): string {
    if (!isAnswered) {
      return 'bg-white border-gray-200 hover:border-gray-400';
    }
    if (index === questions[currentQuestion].correct) {
      return 'bg-green-100 border-green-500';
    }
    if (index === selectedOption && index !== questions[currentQuestion].correct) {
      return 'bg-red-100 border-red-500';
    }
    return 'bg-white border-gray-200';
  }
</script>

<div class="min-h-screen bg-black flex flex-col">
  <header class="bg-black py-4 flex justify-center">
    <img src="/assets/tiktok-logo-white.svg" alt="TikTok" class="h-8" />
  </header>

  <div class="px-4 py-4">
    <div class="max-w-md mx-auto">
      <div class="flex justify-between text-white text-sm mb-2">
        <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} class="h-2 bg-gray-700" />
    </div>
  </div>

  <main class="flex-1 flex flex-col items-center px-4 pb-8">
    <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
      <h2 class="text-lg font-semibold text-gray-900 mb-6 text-center">
        {questions[currentQuestion].question}
      </h2>

      <div class="space-y-3">
        {#each questions[currentQuestion].options as option, index}
          <button
            onclick={() => handleSelect(index)}
            class={`w-full p-4 rounded-lg border-2 text-left transition-all ${getOptionClass(index)}`}
            disabled={isAnswered}
          >
            <span class="font-medium text-gray-900">{option}</span>
          </button>
        {/each}
      </div>
    </div>

    <p class="text-gray-500 text-sm mt-8">© 2025 — TikTok</p>
  </main>
</div>
