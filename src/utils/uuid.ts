/*
 * Generate a UUID v4 string, in a performant way that doesn't need crypto
 * @returns {string} A UUID v4 string.
 */
export const uuid = () => {
  return "00-0-4-1-000".replace(/[^-]/g, (s) =>
    (((Math.random() + ~~s) * 0x10000) >> parseInt(s)).toString(16).padStart(4, "0"),
  );
};
