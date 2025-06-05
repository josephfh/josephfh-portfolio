import type { View } from "../consts/views";
import { CONSOLE_WELCOME_MESSAGE_DEVELOPMENT } from "../consts/console-welcome-message.development";
import { CONSOLE_WELCOME_MESSAGE_PRODUCTION } from "../consts/console-welcome-message.production";
import { MAX_SESSION_LOG_AGE, MAX_SESSION_LOG_COUNT, MAX_SESSION_LOG_EVENTS } from "../consts/limits";
import { assign, setup, stateIn, type ActorRefFrom } from "xstate";
import { uuid } from "../utils/uuid";
import { weatherMachine } from "./weather.machine";

interface SessionEvent {
  timestamp: number;
  type: string;
  view?: View;
}

interface SessionLog {
  id: string;
  endTime: number;
  events: SessionEvent[];
  startTime: number;
}

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
      sessionId: string;
      sessionLogs: SessionLog[];
    },
    events: {} as
      | { type: "LOG_EVENT"; event: any }
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
    sessionId: uuid(),
    sessionLogs: [],
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
    telemetry: {
      initial: "prune old session logs",
      states: {
        "prune old session logs": {
          entry: [
            assign(({ context }) => ({
              sessionLogs: context.sessionLogs.filter((log) => log.startTime > Date.now() - MAX_SESSION_LOG_AGE),
            })),
          ],
          always: [
            {
              target: "prune excessive session logs",
            },
          ],
        },
        "prune excessive session logs": {
          entry: [
            assign(({ context }) => ({
              sessionLogs: context.sessionLogs.sort((a, b) => b.startTime - a.startTime).slice(-MAX_SESSION_LOG_COUNT),
            })),
          ],
          always: [
            {
              target: "initializing session",
            },
          ],
        },
        "initializing session": {
          entry: [
            assign(({ context }) => ({
              sessionLogs: [
                { id: context.sessionId, endTime: Date.now(), events: [], startTime: Date.now() },
                ...context.sessionLogs,
              ],
            })),
          ],
          always: [
            {
              target: "idle",
            },
          ],
        },
        idle: {
          after: {
            2000: {
              target: "updating session end time",
            },
          },
        },
        "updating session end time": {
          entry: [
            assign(({ context }) => ({
              sessionLogs: context.sessionLogs.map((log) =>
                log.id !== context.sessionId
                  ? log
                  : {
                      ...log,
                      endTime: Date.now(),
                    },
              ),
            })),
          ],
          always: [
            {
              target: "idle",
            },
          ],
        },
      },
    },
  },
  on: {
    LOG_EVENT: {
      actions: [
        assign(({ context, event }) => ({
          sessionLogs: context.sessionLogs.map((log) =>
            log.id !== context.sessionId
              ? log
              : {
                  ...log,
                  events: [
                    ...log.events.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_SESSION_LOG_EVENTS),
                    {
                      timestamp: Date.now(),
                      type: event.event.type,
                      ...(event.event.view ? { view: event.event.view } : {}),
                    },
                  ],
                },
          ),
        })),
      ],
    },
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
