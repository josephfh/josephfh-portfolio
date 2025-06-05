import type { View } from "../consts/views";
import { CONSOLE_WELCOME_MESSAGE_DEVELOPMENT } from "../consts/console-welcome-message.development";
import { CONSOLE_WELCOME_MESSAGE_PRODUCTION } from "../consts/console-welcome-message.production";
import { assign, setup, stateIn, type ActorRefFrom } from "xstate";
import { weatherMachine } from "./weather.machine";

export const sessionMachine = setup({
  actions: {
    logWelcomeMessageToConsole: () => {
      if (!import.meta.env.SSR) {
        import.meta.env.MODE === "development" &&
          console.log(`%c${CONSOLE_WELCOME_MESSAGE_DEVELOPMENT}`, `font-family: monospace`);
        import.meta.env.MODE === "production" &&
          console.log(`%c${CONSOLE_WELCOME_MESSAGE_PRODUCTION}`, `font-family: monospace`);
      }
    },
    reportBlurToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_BLUR" });
    },
    reportFocusToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_FOCUS" });
    },
    reportOfflineToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_OFFLINE" });
    },
    reportOnlineToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_ONLINE" });
    },
    spawnChildMachines: assign({
      childMachineRefs: ({ context, spawn }) => ({
        ...context.childMachineRefs,
        weatherMachine: spawn(weatherMachine),
      }),
    }),
  },
  guards: {
    isOffline: stateIn({ connection: "offline" }),
    isOnline: stateIn({ connection: "online" }),
  },
  types: {
    context: {} as {
      childMachineRefs: {
        weatherMachine?: ActorRefFrom<typeof weatherMachine>;
      };
      isAppFocused: boolean;
      isAppOnline: boolean;
    },
    events: {} as
      | { type: "NAVIGATE"; view: View }
      | { type: "REPORT_BLUR" }
      | { type: "REPORT_FOCUS" }
      | { type: "REPORT_OFFLINE" }
      | { type: "REPORT_ONLINE" },
  },
}).createMachine({
  id: "session",
  context: {
    childMachineRefs: {},
    isAppFocused: true,
    isAppOnline: true,
  },
  entry: ["logWelcomeMessageToConsole", "spawnChildMachines"],
  type: "parallel",
  states: {
    journey: {
      initial: "initializing",
      states: {
        initializing: {},
        intro: {},
        architecture: {},
        experience: {},
        contact: {},
      },
      on: {
        NAVIGATE: [
          {
            guard: ({ event }) => event.view === "architecture",
            target: ".architecture",
          },
          {
            guard: ({ event }) => event.view === "contact",
            target: ".contact",
          },
          {
            guard: ({ event }) => event.view === "experience",
            target: ".experience",
          },
          {
            guard: ({ event }) => event.view === "intro",
            target: ".intro",
          },
        ],
      },
    },
  },
  on: {
    REPORT_BLUR: {
      actions: [assign({ isAppFocused: false }), "reportBlurToChildMachines"],
    },
    REPORT_FOCUS: {
      actions: [assign({ isAppFocused: true }), "reportFocusToChildMachines"],
    },
    REPORT_OFFLINE: {
      actions: [assign({ isAppOnline: false }), "reportOfflineToChildMachines"],
    },
    REPORT_ONLINE: {
      actions: [assign({ isAppOnline: true }), "reportOnlineToChildMachines"],
    },
  },
});
