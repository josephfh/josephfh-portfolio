<script lang="ts">
  import { session } from "../stores/actors.svelte.ts";
</script>

<svelte:window
  onblur={() => session.send({ type: "REPORT_BLUR" })}
  onclick={(event) => {
    const target = event.target as HTMLElement | undefined;
    session.send({
      type: "REPORT_CLICK",
      href: target?.getAttribute("href") || undefined,
      tagName: target?.tagName,
      targetId: target?.id,
    });
    session.send({ type: "REPORT_USER_ACTIVITY" });
  }}
  onfocus={() => session.send({ type: "REPORT_FOCUS" })}
  onkeydown={() => session.send({ type: "REPORT_USER_ACTIVITY" })}
  onoffline={() => session.send({ type: "REPORT_OFFLINE" })}
  ononline={() => session.send({ type: "REPORT_ONLINE" })}
  onscroll={() => session.send({ type: "REPORT_USER_ACTIVITY" })}
/>
