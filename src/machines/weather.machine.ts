import { assign, fromPromise, setup } from "xstate";
import { GEO_LOCATIONS } from "../consts/geo-locations";
import { WEATHER_WORDS_FROM_CODE_4677 } from "../consts/weather-words";
import { MAX_WEATHER_FETCH_RETRIES } from "../consts/limits";
import {
  USER_CONSIDERED_INACTIVE_TIMEOUT,
  WEATHER_FETCH_DELAY_AFTER_FAILURE,
  WEATHER_FETCH_INTERVAL,
  WEATHER_FETCH_RETRY_DELAY,
} from "../consts/timings";

interface WeatherResponse {
  current: {
    weather_code: number;
  };
}

export const weatherMachine = setup({
  actions: {
    incrementWeatherFetchRetries: assign(({ context }) => ({ weatherFetchRetries: context.weatherFetchRetries + 1 })),
    resetWeatherFetchRetries: assign({ weatherFetchRetries: 0 }),
  },
  actors: {
    fetchWeatherForStockholm: fromPromise(async () => {
      const { stockholm } = GEO_LOCATIONS;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${stockholm.lat}&longitude=${stockholm.lon}&current=weather_code`,
      );
      const data = (await response.json()) as WeatherResponse;
      const weatherWord = WEATHER_WORDS_FROM_CODE_4677.find(
        (item) => item.code === data.current.weather_code.toString(),
      );
      if (!weatherWord?.label) {
        throw new Error("Weather word not found");
      }
      return weatherWord.label;
    }),
  },
  guards: {
    isAppOnline: ({ context }) => context.isAppOnline,
    weatherFetchRetriesExceeded: ({ context }) => context.weatherFetchRetries >= MAX_WEATHER_FETCH_RETRIES,
  },
  types: {
    context: {} as {
      isAppOnline: boolean;
      weatherFetchRetries: number;
      weatherForStockholm?: string;
    },
    events: {} as
      | { type: "REPORT_APP_BLUR" }
      | { type: "REPORT_APP_FOCUS" }
      | { type: "REPORT_APP_OFFLINE" }
      | { type: "REPORT_APP_ONLINE" }
      | { type: "REPORT_USER_ACTIVITY" },
  },
}).createMachine({
  id: "weather",
  context: {
    isAppOnline: true,
    weatherFetchRetries: 0,
    weatherForStockholm: undefined,
  },
  initial: "active",
  states: {
    active: {
      type: "parallel",
      states: {
        "fetching weather every so often": {
          initial: "checking connectivity before fetching",
          states: {
            "checking connectivity before fetching": {
              always: [
                {
                  guard: "isAppOnline",
                  target: "fetching weather",
                },
                {
                  target: "waiting for online connection",
                },
              ],
            },
            "waiting for online connection": {
              on: {
                REPORT_APP_ONLINE: {
                  target: "checking connectivity before fetching",
                },
              },
            },
            "fetching weather": {
              invoke: {
                src: "fetchWeatherForStockholm",
                id: "fetchWeatherForStockholm",
                onDone: {
                  target: "idle",
                  actions: [assign(({ event }) => ({ weatherForStockholm: event.output }))],
                },
                onError: {
                  target: "waiting before retry",
                  actions: ["incrementWeatherFetchRetries"],
                },
              },
            },
            "waiting before retry": {
              always: [
                {
                  guard: "weatherFetchRetriesExceeded",
                  actions: ["resetWeatherFetchRetries"],
                  target: "unknown",
                },
              ],
              after: {
                [WEATHER_FETCH_RETRY_DELAY]: {
                  target: "checking connectivity before fetching",
                },
              },
            },
            idle: {
              after: {
                [WEATHER_FETCH_INTERVAL]: {
                  target: "checking connectivity before fetching",
                },
              },
            },
            unknown: {
              after: {
                [WEATHER_FETCH_DELAY_AFTER_FAILURE]: {
                  target: "checking connectivity before fetching",
                },
              },
            },
          },
          on: {
            REPORT_APP_BLUR: {
              target: "#weather.paused",
            },
          },
        },
        "watching user activity": {
          after: {
            [USER_CONSIDERED_INACTIVE_TIMEOUT]: {
              target: "#weather.paused",
            },
          },
          on: {
            REPORT_APP_FOCUS: {
              target: "watching user activity",
              reenter: true,
            },
            REPORT_USER_ACTIVITY: {
              target: "watching user activity",
              reenter: true,
            },
          },
        },
      },
    },
    paused: {
      on: {
        REPORT_USER_ACTIVITY: {
          target: "active",
        },
        REPORT_APP_FOCUS: {
          target: "active",
        },
      },
    },
  },
  on: {
    REPORT_APP_OFFLINE: {
      actions: [assign({ isAppOnline: false })],
    },
    REPORT_APP_ONLINE: {
      actions: [assign({ isAppOnline: true })],
    },
  },
});
