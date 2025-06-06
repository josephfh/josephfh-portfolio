export const msToHhmmss = (ms: number): string => new Date(ms).toISOString().slice(11, 19);
