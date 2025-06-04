import type { views } from "./views";

interface MainNavItem {
  view: keyof typeof views;
  label: string;
  href: string;
}

export const mainNav: MainNavItem[] = [
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
