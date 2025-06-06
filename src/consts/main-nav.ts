import type { VIEWS } from "./views";

interface MainNavItem {
  id: string;
  view: keyof typeof VIEWS;
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    id: "intro",
    view: "intro",
    label: "Intro",
    href: "/",
  },
  {
    id: "experience",
    view: "experience",
    label: "Experience",
    href: "/experience",
  },
  {
    id: "architecture",
    view: "architecture",
    label: "Architecture",
    href: "/architecture",
  },
  {
    id: "contact",
    view: "contact",
    label: "Contact",
    href: "/contact",
  },
];
