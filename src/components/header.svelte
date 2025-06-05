<script>
  import { weather } from "../stores/actors.svelte.ts";
</script>

<h1 class="text-4xl">
  Joseph Hughes<span class="sr-only">:</span>
  <span class="block text-base uppercase"
    >Frontend developer / App architect / UX engineer <span class="block">
      Based in
      {#if weather.state.context.weatherForStockholm}
        <span class="line-through">Sunny</span> {weather.state.context.weatherForStockholm}
      {:else}
        Sunny
      {/if}
      Stockholm
    </span>
  </span>
</h1>
