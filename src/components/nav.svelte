<script lang="ts">
  import { session } from "../stores/actors.svelte.ts";
  import { navigate } from "../utils/navigate.ts";
  import { MAIN_NAV_ITEMS } from "../consts/main-nav.ts";
  import Button from "../ui/button/button.svelte";

  const navItems = $derived(
    MAIN_NAV_ITEMS.map(({ id, label, href, view }) => ({
      label,
      href,
      id: `main-nav-item-${id}`,
      isCurrent: session.state.matches({ journey: view }),
      handleClick: (event: MouseEvent) => {
        event.preventDefault();
        navigate(view, href);
      },
    })),
  );
</script>

<div class="-mx-1 flex gap-x-2">
  {#each navItems as { href, id, isCurrent, label, handleClick }}
    <Button {id} {href} onclick={handleClick} variant={isCurrent ? "default" : "secondary"}>{label}</Button>
  {/each}
</div>
