<script>
  import { telemetry } from "../stores/actors.svelte";
  telemetry.send({ type: "REPORT_CLIENT_IDLE" });
</script>
