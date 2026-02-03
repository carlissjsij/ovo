<script lang="ts">
  interface Props {
    type?: string;
    placeholder?: string;
    value?: string;
    oninput?: (value: string) => void;
    class?: string;
  }

  let { type = 'text', placeholder = '', value = $bindable(''), oninput, class: className = '' }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    oninput?.(target.value);
  }
</script>

<input
  {type}
  {placeholder}
  {value}
  oninput={handleInput}
  class={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
/>
