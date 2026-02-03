<script lang="ts">
  interface Props {
    value?: number;
    class?: string;
  }

  let { value = 0, class: className = '' }: Props = $props();
</script>

<div class={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
  <div
    class="h-full w-full flex-1 bg-primary transition-all"
    style={`transform: translateX(-${100 - value}%)`}
  ></div>
</div>
