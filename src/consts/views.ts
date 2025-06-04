export const views = {
  intro: "/",
  contact: "/contact",
  experience: "/experience",
} as const;

export type View = keyof typeof views;
