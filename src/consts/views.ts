export const VIEWS = {
  intro: "/",
  architecture: "/architecture",
  contact: "/contact",
  experience: "/experience",
} as const;

export type View = keyof typeof VIEWS;
