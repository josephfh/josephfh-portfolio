import type { View } from "../consts/views";
import { CONSOLE_WELCOME_MESSAGE_DEVELOPMENT } from "../consts/console-welcome-message.development";
import { CONSOLE_WELCOME_MESSAGE_PRODUCTION } from "../consts/console-welcome-message.production";
import { assign, setup, stateIn, type ActorRefFrom } from "xstate";
import { weatherMachine } from "./weather.machine";
import { USER_CONSIDERED_INACTIVE_TIMEOUT } from "../consts/timings";
import { telemetryMachine } from "./telemetry.machine";

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
    forwardReportAppBlurToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_APP_BLUR" });
    },
    forwardReportAppFocusToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_APP_FOCUS" });
    },
    forwardReportAppOfflineToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_APP_OFFLINE" });
    },
    forwardReportAppOnlineToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_APP_ONLINE" });
    },
    forwardReportUserActivityToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_USER_ACTIVITY" });
    },
    spawnChildMachines: assign({
      childMachineRefs: ({ context, spawn }) => ({
        ...context.childMachineRefs,
        telemetryMachine: spawn(telemetryMachine, { input: { actorStartTime: context.actorStartTime } }),
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
      actorStartTime: number;
      childMachineRefs: {
        telemetryMachine?: ActorRefFrom<typeof telemetryMachine>;
        weatherMachine?: ActorRefFrom<typeof weatherMachine>;
      };
      isAppFocused: boolean;
      isAppOnline: boolean;
    },
    events: {} as
      | { type: "NAVIGATE"; view: View }
      | { type: "REPORT_APP_BLUR" }
      | { type: "REPORT_APP_FOCUS" }
      | { type: "REPORT_CLICK"; href?: string; tagName?: string; targetId?: string }
      | { type: "REPORT_APP_OFFLINE" }
      | { type: "REPORT_APP_ONLINE" }
      | { type: "REPORT_USER_ACTIVITY" },
    input: {} as {
      actorStartTime: number;
    },
  },
}).createMachine({
  id: "session",
  context: ({ input }) => ({
    actorStartTime: input.actorStartTime,
    childMachineRefs: {},
    isAppFocused: true,
    isAppOnline: true,
  }),
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
    user: {
      initial: "engaged",
      states: {
        engaged: {
          after: {
            [USER_CONSIDERED_INACTIVE_TIMEOUT]: {
              target: "disengaged",
            },
          },
          on: {
            REPORT_APP_BLUR: {
              target: "disengaged",
            },
            REPORT_USER_ACTIVITY: {
              target: "engaged",
              reenter: true,
            },
          },
        },
        disengaged: {
          on: {
            REPORT_APP_FOCUS: {
              target: "engaged",
            },
            REPORT_USER_ACTIVITY: {
              target: "engaged",
            },
          },
        },
      },
    },
  },
  on: {
    REPORT_APP_BLUR: {
      actions: [assign({ isAppFocused: false }), "forwardReportAppBlurToChildMachines"],
    },
    REPORT_APP_FOCUS: {
      actions: [assign({ isAppFocused: true }), "forwardReportAppFocusToChildMachines"],
    },
    REPORT_APP_OFFLINE: {
      actions: [assign({ isAppOnline: false }), "forwardReportAppOfflineToChildMachines"],
    },
    REPORT_APP_ONLINE: {
      actions: [assign({ isAppOnline: true }), "forwardReportAppOnlineToChildMachines"],
    },
    REPORT_USER_ACTIVITY: {
      actions: ["forwardReportUserActivityToChildMachines"],
    },
  },
});
