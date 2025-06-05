<script>
  import { session } from "../stores/actors.svelte.ts";
  import { timestampToDate } from "../utils/timestamp-to-date.ts";
  const currentSession = $derived(
    session.state.context.sessionLogs.find(({ id }) => id === session.state.context.sessionId),
  );
  const sessionDuration = $derived(currentSession.endTime - currentSession.startTime);
  const msToReadableDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);

    const yearsStr = years > 0 ? `${years}y ` : "";
    const daysStr = days % 365 > 0 ? `${days % 365}d ` : "";
    const hoursStr = hours % 24 > 0 ? `${hours % 24}h ` : "";
    const minutesStr = minutes % 60 > 0 ? `${minutes % 60}m ` : "";
    const secondsStr = seconds % 60 > 0 ? `${seconds % 60}s ` : "";

    return `${yearsStr}${daysStr}${hoursStr}${minutesStr}${secondsStr}`;
  };
</script>

<ul class="bg-black text-xs text-white">
  <li>startTime: {timestampToDate(currentSession.startTime)}</li>
  <li>endTime: {timestampToDate(currentSession.endTime)}</li>
  <li>duration: {msToReadableDuration(sessionDuration)}</li>
  <li>
    events: <ul>
      {#each currentSession.events.sort((a, b) => a.timestamp - b.timestamp).slice(-6) as event}
        <li>{msToReadableDuration(event.timestamp - currentSession.startTime)} {event.type} {event.view}</li>
      {/each}
    </ul>
  </li>
</ul>
