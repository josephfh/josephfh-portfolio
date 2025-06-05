<script lang="ts">
  import { session } from "../stores/actors.svelte.ts";
</script>

<svelte:window
  onoffline={() => session.send({ type: "REPORT_OFFLINE" })}
  ononline={() => session.send({ type: "REPORT_ONLINE" })}
  onfocus={() => session.send({ type: "REPORT_FOCUS" })}
  onblur={() => session.send({ type: "REPORT_BLUR" })}
/>
