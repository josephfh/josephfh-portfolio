<script lang="ts">
  import { VIEWS, type View } from "../consts/views.ts";
  import { session } from "../stores/actors.svelte.ts";

  // Listen for history changes to turn this app into a mini SPA

  const historyHandler = (event: PopStateEvent) => {
    const url = new URL(event.state?.url || location.href);
    const view = Object.entries(VIEWS).find(([_id, path]) => path === url.pathname);
    if (view) {
      session.send({ type: "NAVIGATE", view: view[0] as View });
    } else {
      history.back();
    }
  };
</script>

<svelte:window onpopstate={historyHandler} />
