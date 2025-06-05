import type { Actor, AnyStateMachine, StateFrom } from "xstate";

export const runifyActor = <T extends AnyStateMachine>(actor: Actor<T>) => {
  // Extra check as immediately invoked XState actors should not be undefined
  if (!actor?.getSnapshot())
    throw new Error("Actor snapshot is not available. It is likely that the actor was not spawned.");

  let state = $state.raw<StateFrom<T>>(actor.getSnapshot());
  actor.subscribe((s) => (state = s));
  actor.start();
  return {
    get state() {
      return state;
    },
    send: actor.send,
  };
};
