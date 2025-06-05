<script lang="ts">
  import { session } from "../stores/actors.svelte.ts";
  import { tv } from "tailwind-variants";
  import { navigate } from "../utils/navigate.ts";
  import { MAIN_NAV_ITEMS } from "../consts/main-nav.ts";

  const navLink = tv({
    base: "py-1 px-3 rounded-full active:opacity-80",
    variants: {
      color: {
        active: "bg-blue-500",
        default: "bg-transparent hover:bg-blue-700",
      },
    },
    defaultVariants: {
      color: "default",
    },
  });

  const navItems = $derived(
    MAIN_NAV_ITEMS.map(({ label, href, view }) => ({
      label,
      href,
      isCurrent: session.state.matches({ journey: view }),
      handleClick: (event: MouseEvent) => {
        event.preventDefault();
        navigate(view, href);
      },
    })),
  );
</script>

<div class="-mx-1 flex gap-x-2">
  {#each navItems as { href, isCurrent, label, handleClick }}
    <a {href} onclick={handleClick} class={navLink({ color: isCurrent ? "active" : "default" })}>{label}</a>
  {/each}
</div>
