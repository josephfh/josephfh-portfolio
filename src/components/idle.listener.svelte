<script>
  import { session } from "../stores/actors.svelte";
  session.send({ type: "REPORT_CLIENT_IDLE" });
</script>
