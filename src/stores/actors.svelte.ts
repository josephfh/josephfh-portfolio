import { Actor, createActor } from "xstate";
import { sessionMachine } from "../machines/session.machine.ts";
import { runifyActor } from "../utils/runify-actor.svelte.ts";
import { weatherMachine } from "../machines/weather.machine.ts";

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
  inspect,
});
export const session = runifyActor(sessionActor);

export const weather = runifyActor(
  session.state.context.childMachineRefs.weatherMachine as Actor<typeof weatherMachine>,
);

sessionActor.system.inspect((inspectEvent) => {
  if (inspectEvent.type === "@xstate.event" && !inspectEvent.event.type.startsWith("xstate.")) {
    // Don't log the event if it's a LOG_EVENT to avoid infinite recursion
    if (inspectEvent.event.type !== "LOG_EVENT") {
      // Only log events from the parent "session" actor, not the spawned child actors
      if (inspectEvent.actorRef === sessionActor) {
        console.log("Events:", inspectEvent.actorRef.getSnapshot().context.sessionLogs[0].events);
        console.log("Logging event:", inspectEvent.event);
        session.send({ type: "LOG_EVENT", event: inspectEvent.event });
      }
    }
  }
});
