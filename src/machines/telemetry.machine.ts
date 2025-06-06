import { MAX_SESSION_LOG_AGE, MAX_SESSION_LOG_COUNT, MAX_SESSION_LOG_EVENTS } from "../consts/limits";
import { assertEvent, assign, setup } from "xstate";
import { uuid } from "../utils/uuid";
import { TELEMETRY_CLICK_FREQUENCY } from "../consts/timings";

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
  };
  startTime: number;
}

export const telemetryMachine = setup({
  actions: {
    logEvent: assign(({ context, event }) => {
      assertEvent(event, "LOG_EVENT");
      return {
        sessions: context.sessions.map((session) =>
          session.id !== context.sessionId
            ? session
            : {
                ...session,
                events: [
                  ...session.events.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_SESSION_LOG_EVENTS),
                  {
                    timestamp: Date.now(),
                    loggedEvent: event.event,
                  },
                ],
              },
        ),
      };
    }),
    logMachineLoadedTime: assign(({ context }) => ({
      sessions: context.sessions.map((session) =>
        session.id !== context.sessionId
          ? session
          : {
              ...session,
              metrics: {
                ...session.metrics,
                machineLoadedTime: Date.now() - context.actorStartTime,
              },
            },
      ),
    })),
    logTimeToIdle: assign(({ context }) => ({
      sessions: context.sessions.map((session) =>
        session.id !== context.sessionId
          ? session
          : {
              ...session,
              metrics: {
                ...session.metrics,
                timeToIdle: Date.now() - context.actorStartTime,
              },
            },
      ),
    })),
  },
  types: {
    context: {} as {
      actorStartTime: number;
      sessionId: string;
      sessions: Session[];
    },
    events: {} as
      | { type: "LOG_EVENT"; event: any } //TODO: type logged events
      | { type: "REPORT_CLIENT_IDLE" },
    input: {} as {
      actorStartTime: number;
    },
  },
}).createMachine({
  id: "telemetry",
  context: ({ input }) => ({
    actorStartTime: input.actorStartTime,
    sessionId: uuid(),
    sessions: [],
  }),
  initial: "prune old sessions",
  states: {
    "prune old sessions": {
      entry: [
        assign(({ context }) => ({
          sessions: context.sessions.filter((log) => log.startTime > Date.now() - MAX_SESSION_LOG_AGE),
        })),
      ],
      always: [
        {
          target: "prune excessive sessions",
        },
      ],
    },
    "prune excessive sessions": {
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
      exit: ["logMachineLoadedTime"],
      always: [
        {
          target: "idle",
        },
      ],
    },
    idle: {
      after: {
        [TELEMETRY_CLICK_FREQUENCY]: {
          target: "updating session end time",
        },
      },
    },
    "updating session end time": {
      entry: [
        assign(({ context }) => ({
          sessions: context.sessions.map((session) =>
            session.id !== context.sessionId
              ? session
              : {
                  ...session,
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
  on: {
    LOG_EVENT: {
      actions: ["logEvent"],
    },
    REPORT_CLIENT_IDLE: {
      actions: ["logTimeToIdle"],
    },
  },
});
