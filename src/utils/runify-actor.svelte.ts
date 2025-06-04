import type { Actor, AnyStateMachine, StateFrom } from "xstate";

export const runifyActor = <T extends AnyStateMachine>(actor: Actor<T>) => {
  let state = $state.raw<StateFrom<T>>(actor.getSnapshot());
  actor.subscribe((s) => {
    state = s;
  });
  actor.start();
  return {
    get state() {
      return state;
    },
    send: actor.send,
  };
};
