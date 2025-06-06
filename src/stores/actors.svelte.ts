import { type Actor, createActor } from "xstate";
import { sessionMachine } from "../machines/session.machine.ts";
import { runifyActor } from "../utils/runify-actor.svelte.ts";
import { weatherMachine } from "../machines/weather.machine.ts";
import type { telemetryMachine } from "../machines/telemetry.machine.ts";

// If running in development mode, dynamically import @statelyai/inspect

let inspect = undefined;
if (import.meta.env.DEV && !import.meta.env.SSR && import.meta.env.PUBLIC_USE_INSPECTOR) {
  try {
    const inspectImport = await import("@statelyai/inspect");
    inspect = inspectImport.createBrowserInspector().inspect;
  } catch (error) {
    console.error("Failed to dynamically import @statelyai/inspect:", error);
  }
}

// Wrap the actors in a function that makes the state a reactive Svelte 5's rune
const sessionActor = createActor(sessionMachine, {
  input: {
    actorStartTime: Date.now(),
  },
  inspect,
});
export const session = runifyActor(sessionActor);

export const telemetry = runifyActor(
  session.state.context.childMachineRefs.telemetryMachine as Actor<typeof telemetryMachine>,
);

export const weather = runifyActor(
  session.state.context.childMachineRefs.weatherMachine as Actor<typeof weatherMachine>,
);

sessionActor.system.inspect((inspectEvent) => {
  // Only log events from the parent "session" actor, not the spawned child actors
  if (inspectEvent.actorRef !== sessionActor) return;
  // Ignore internal XState ignoredEvent
  if (inspectEvent.type !== "@xstate.event") return;
  if (inspectEvent.event.type.startsWith("xstate.")) return;
  // Don't log noisy events or irrelevant events, and don't log the logging event LOG_EVENT to avoid recursion
  const ignoredEvents: string[] = ["LOG_EVENT", "REPORT_USER_ACTIVITY"];
  if (ignoredEvents.includes(inspectEvent.event.type)) return;
  // Log the event
  telemetry.send({ type: "LOG_EVENT", event: inspectEvent.event });
});
