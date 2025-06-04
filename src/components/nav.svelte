<script lang="ts">
  import { views } from "../consts/views.ts";
  import { session } from "../stores/session.svelte.ts";
  import { tv } from "tailwind-variants";
  import { navigate } from "../utils/navigate.ts";
  import { mainNav } from "../consts/main-nav.ts";

  const navLink = tv({
    base: "font-semibold py-1 px-3 rounded-full active:opacity-80",
    variants: {
      color: {
        active: "bg-blue-500 hover:bg-blue-700",
        default: "bg-transparent hover:bg-blue-700",
      },
    },
    defaultVariants: {
      color: "default",
    },
  });

  const navItems = $derived(
    mainNav.map(({ view, href }) => ({
      label:
        view === "intro"
          ? "Intro"
          : view === "contact"
            ? "Contact"
            : "Experience",
      href,
      isCurrent: session.state.value.journey === view,
      handleClick: (event: MouseEvent) => {
        event.preventDefault();
        navigate(view, href);
      },
    })),
  );
</script>

<div class="-mx-1 flex gap-x-2">
  {#each navItems as { href, isCurrent, label, handleClick }}
    <a
      {href}
      onclick={handleClick}
      class={navLink({ color: isCurrent ? "active" : "default" })}>{label}</a
    >
  {/each}
</div>
