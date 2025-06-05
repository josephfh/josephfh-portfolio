import { VIEWS, type View } from "../consts/views";
import { session } from "../stores/actors.svelte.ts";

export const navigate = (view: View, href: string) => {
  if (Object.keys(VIEWS).includes(view)) {
    session.send({ type: "NAVIGATE", view: view as View });
    history.pushState(null, "", href);
  }
};
