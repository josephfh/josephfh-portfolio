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

export const session = runifyActor(
  createActor(sessionMachine, {
    inspect,
  }),
);

export const weather = runifyActor(
  session.state.context.childMachineRefs.weatherMachine as Actor<typeof weatherMachine>,
);
