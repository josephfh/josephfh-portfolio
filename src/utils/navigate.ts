import { views } from "../consts/views";
import { session } from "../stores/session.svelte";

export const navigate = (view: keyof typeof views, href: string) => {
  if (Object.keys(views).includes(view)) {
    session.send({ type: "NAVIGATE", view: view as keyof typeof views });
    history.pushState(null, "", href);
  }
};
