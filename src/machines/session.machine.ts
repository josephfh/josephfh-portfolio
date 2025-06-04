import { setup } from "xstate";
import type { View } from "../consts/views";

export const sessionMachine = setup({
  // actions: {
  //   assignCurrentView: assign(({ event }) => ({ currentView: event.view })),
  // },
  types: {
    events: {} as { type: "NAVIGATE"; view: View },
  },
}).createMachine({
  id: "session",
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
    network: {
      initial: "initializing",
      states: {
        initializing: {},
        offline: {},
        online: {},
      },
    },
  },
});
