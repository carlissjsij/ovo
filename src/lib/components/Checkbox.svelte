<script lang="ts">
  interface Props {
    checked?: boolean;
    onchange?: (checked: boolean) => void;
    id?: string;
  }

  let { checked = $bindable(false), onchange, id }: Props = $props();

  function handleChange() {
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  role="checkbox"
  aria-checked={checked}
  {id}
  onclick={handleChange}
  class="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
  data-state={checked ? 'checked' : 'unchecked'}
>
  {#if checked}
    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
    </svg>
  {/if}
</button>
