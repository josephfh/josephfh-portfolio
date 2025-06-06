import type { View } from "../consts/views";
import { CONSOLE_WELCOME_MESSAGE_DEVELOPMENT } from "../consts/console-welcome-message.development";
import { CONSOLE_WELCOME_MESSAGE_PRODUCTION } from "../consts/console-welcome-message.production";
import { MAX_SESSION_LOG_AGE, MAX_SESSION_LOG_COUNT, MAX_SESSION_LOG_EVENTS } from "../consts/limits";
import { assign, setup, stateIn, type ActorRefFrom } from "xstate";
import { uuid } from "../utils/uuid";
import { weatherMachine } from "./weather.machine";
import { USER_CONSIDERED_INACTIVE_TIMEOUT } from "../consts/timings";

interface SessionEvent {
  timestamp: number;
  loggedEvent: any; // TODO type events
}

interface Session {
  id: string;
  endTime: number;
  events: SessionEvent[];
  metrics: {
    machineLoadTime?: number;
    timeToIdle?: number;
    timeToFirstClientIdle?: number;
  };
  startTime: number;
}

export const sessionMachine = setup({
  actions: {
    logTimeToClientIdle: ({ context }) => ({
      sessions: context.sessions.map((session) => ({
        ...session,
        metrics: {
          ...session.metrics,
          timeToFirstClientIdle: Date.now() - context.actorStartTime,
        },
      })),
    }),
    logTimeToIdle: ({ context }) => ({
      sessions: context.sessions.map((session) => ({
        ...session,
        metrics: {
          ...session.metrics,
          timeToIdle: Date.now() - context.actorStartTime,
        },
      })),
    }),
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
    reportUserActivityToChildMachines: ({ context }) => {
      context.childMachineRefs.weatherMachine?.send({ type: "REPORT_USER_ACTIVITY" });
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
      actorStartTime: number;
      childMachineRefs: {
        weatherMachine?: ActorRefFrom<typeof weatherMachine>;
      };
      isAppFocused: boolean;
      isAppOnline: boolean;
      sessionId: string;
      sessions: Session[];
    },
    events: {} as
      | { type: "LOG_EVENT"; event: any } //TODO: type logged events
      | { type: "REPORT_CLIENT_IDLE" }
      | { type: "NAVIGATE"; view: View }
      | { type: "REPORT_BLUR" }
      | { type: "REPORT_CLICK"; href?: string; tagName?: string; targetId?: string }
      | { type: "REPORT_FOCUS" }
      | { type: "REPORT_OFFLINE" }
      | { type: "REPORT_ONLINE" }
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
    sessionId: uuid(),
    sessions: [],
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
    telemetry: {
      initial: "prune old session logs",
      states: {
        "prune old session logs": {
          entry: [
            assign(({ context }) => ({
              sessions: context.sessions.filter((log) => log.startTime > Date.now() - MAX_SESSION_LOG_AGE),
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
              sessions: context.sessions.sort((a, b) => b.startTime - a.startTime).slice(-MAX_SESSION_LOG_COUNT),
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
              sessions: [
                {
                  id: context.sessionId,
                  endTime: Date.now(),
                  events: [],
                  metrics: {},
                  startTime: context.actorStartTime,
                },
                ...context.sessions,
              ],
            })),
          ],
          exit: ["logTimeToIdle"],
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
              sessions: context.sessions.map((log) =>
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
            REPORT_BLUR: {
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
            REPORT_FOCUS: {
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
    LOG_EVENT: {
      actions: [
        assign(({ context, event }) => ({
          sessions: context.sessions.map((log) =>
            log.id !== context.sessionId
              ? log
              : {
                  ...log,
                  events: [
                    ...log.events.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_SESSION_LOG_EVENTS),
                    {
                      timestamp: Date.now(),
                      loggedEvent: event.event,
                    },
                  ],
                },
          ),
        })),
      ],
    },
    REPORT_CLIENT_IDLE: {
      actions: [
        assign(({ context }) => ({
          sessions: context.sessions.map((log) =>
            log.id !== context.sessionId
              ? log
              : {
                  ...log,
                  metrics: {
                    ...log.metrics,
                    timeToFirstClientIdle: Date.now() - context.actorStartTime,
                  },
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
    REPORT_USER_ACTIVITY: {
      actions: ["reportUserActivityToChildMachines"],
    },
  },
});
