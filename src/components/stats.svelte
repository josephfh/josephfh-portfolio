<script>
  import { session } from "../stores/actors.svelte.ts";
  import { msToHhmmss } from "../utils/ms-to-hhmmss.ts";
  import { msToReadableDuration } from "../utils/ms-to-readable-duration.ts";
  import { timestampToDate } from "../utils/timestamp-to-date.ts";
  const currentSession = $derived(
    session.state.context.sessions.find(({ id }) => id === session.state.context.sessionId),
  );
  const sessionDuration = $derived(currentSession.endTime - currentSession.startTime);
</script>

<ul class="fixed top-0 right-0 bottom-0 w-80 bg-black text-xs text-white">
  <li>Session started at: {timestampToDate(currentSession.startTime)}</li>
  <li>Session duration: {msToReadableDuration(sessionDuration)}</li>
  <li class="border-t">
    Metrics: <ul>
      {#each Object.entries(currentSession.metrics) as metric}
        <li>{metric[0]}: {metric[1]}</li>
      {/each}
    </ul>
  </li>
  <li class="border-t">
    Events: <ul>
      {#each currentSession.events
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-200)
        .reverse() as event}
        <li>
          <span class="opacity-50">{msToHhmmss(event.timestamp - currentSession.startTime)}</span>
          {#if event.loggedEvent.type === "REPORT_CLICK"}
            CLICK
            <span class="border border-white">
              {#if event.loggedEvent.href}{event.loggedEvent.href}{/if}
              {#if event.loggedEvent.targetId}{event.loggedEvent.targetId}{/if}
              {#if event.loggedEvent.tagName}<span class="lowercase">&lt;{event.loggedEvent.tagName}&gt;</span>{/if}
            </span>
          {:else if event.loggedEvent.type === "NAVIGATE"}
            NAVIGATE to {event.loggedEvent.view}
          {:else}
            {event.loggedEvent.type}
          {/if}
        </li>
      {/each}
    </ul>
  </li>
</ul>
