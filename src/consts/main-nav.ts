import type { VIEWS } from "./views";

interface MainNavItem {
  view: keyof typeof VIEWS;
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    view: "intro",
    label: "Intro",
    href: "/",
  },
  {
    view: "experience",
    label: "Experience",
    href: "/experience",
  },
  {
    view: "architecture",
    label: "Architecture",
    href: "/architecture",
  },
  {
    view: "contact",
    label: "Contact",
    href: "/contact",
  },
];
