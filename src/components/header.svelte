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

<div class="bg-primary">dffdfd</div>
<div class="bg-secondary">dffdfd</div>
v
<div class="bg-primary text-primary-foreground">dffdfd</div>
<div class="bg-secondary text-secondary-foreground">dffdfd</div>
<div class="bg-muted text-muted-foreground">dffdfd</div>
<div class="bg-accent text-accent-foreground">dffdfd</div>

<div class="text-primary">text-primary</div>
<div class="text-secondary">text-secondary</div>
<div class="text-muted">text-muted</div>
<div class="text-accent">text-accent</div>
