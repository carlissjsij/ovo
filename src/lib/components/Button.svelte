<script lang="ts">
  interface Props {
    onclick?: () => void;
    disabled?: boolean;
    class?: string;
    children?: any;
  }

  let { onclick, disabled = false, class: className = '', children }: Props = $props();
</script>

<button
  {onclick}
  {disabled}
  class={className}
>
  {@render children?.()}
</button>
