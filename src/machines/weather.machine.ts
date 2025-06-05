import { assign, fromPromise, setup } from "xstate";
import { GEO_LOCATIONS } from "../consts/geo-locations";
import { WEATHER_WORDS_FROM_CODE_4677 } from "../consts/weather-words";
import { MAX_WEATHER_FETCH_RETRIES } from "../consts/limits";
import { WEATHER_FETCH_INTERVAL, WEATHER_FETCH_RETRY_DELAY } from "../consts/timings";

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
    weatherFetchRetriesExceeded: ({ context }) => context.weatherFetchRetries >= MAX_WEATHER_FETCH_RETRIES,
  },
  types: {
    context: {} as {
      weatherFetchRetries: number;
      weatherForStockholm?: string;
    },
    events: {} as
      | { type: "REPORT_BLUR" }
      | { type: "REPORT_FOCUS" }
      | { type: "REPORT_OFFLINE" }
      | { type: "REPORT_ONLINE" },
  },
}).createMachine({
  id: "weather",
  context: {
    weatherFetchRetries: 0,
    weatherForStockholm: undefined,
  },
  initial: "active",
  states: {
    active: {
      initial: "fetching weather",
      states: {
        "fetching weather": {
          invoke: {
            src: "fetchWeatherForStockholm",
            onDone: {
              target: "idle",
              actions: [assign(({ event }) => ({ weatherForStockholm: event.output }))],
            },
            onError: {
              target: "waiting before retry",
              actions: ["incrementWeatherFetchRetries", () => console.log("Weather fetch failed")],
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
              target: "fetching weather",
            },
          },
        },
        idle: {
          after: {
            [WEATHER_FETCH_INTERVAL]: {
              target: "fetching weather",
            },
          },
        },
        unknown: {
          after: {
            [WEATHER_FETCH_INTERVAL]: {
              target: "fetching weather",
            },
          },
        },
      },
      on: {
        REPORT_BLUR: {
          target: "unfocused",
        },
        REPORT_OFFLINE: {
          target: "offline and focused",
        },
      },
    },
    unfocused: {
      on: {
        REPORT_FOCUS: {
          target: "active",
        },
        REPORT_OFFLINE: {
          target: "offline and unfocused",
        },
      },
    },
    "offline and focused": {
      on: {
        REPORT_BLUR: {
          target: "offline and unfocused",
        },
        REPORT_ONLINE: {
          target: "active",
        },
      },
    },
    "offline and unfocused": {
      on: {
        REPORT_FOCUS: {
          target: "offline and focused",
        },
        REPORT_ONLINE: {
          target: "unfocused",
        },
      },
    },
  },
});
