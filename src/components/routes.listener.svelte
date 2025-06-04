<script lang="ts">
  import { views } from "../consts/views.ts";
  import { session } from "../stores/session.svelte.ts";

  // Listen for history changes to turn this app into a mini SPA

  const historyHandler = (event: PopStateEvent) => {
    const url = new URL(event.state?.url || location.href);
    const view = Object.entries(views).find(
      ([_id, path]) => path === url.pathname,
    );
    if (view) {
      session.send({ type: "NAVIGATE", view: view[0] as keyof typeof views });
    } else {
      history.back();
    }
  };
</script>

<svelte:window onpopstate={historyHandler} />
