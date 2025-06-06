export const msToReadableDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  const yearsStr = years > 0 ? `${years}y ` : "";
  const daysStr = days % 365 > 0 ? `${days % 365}d ` : "";
  const hoursStr = hours % 24 > 0 ? `${hours % 24}h ` : "";
  const minutesStr = minutes % 60 > 0 ? `${minutes % 60}m ` : "";
  const secondsStr = seconds % 60 > 0 ? `${seconds % 60}s ` : "";

  return `${yearsStr}${daysStr}${hoursStr}${minutesStr}${secondsStr}`;
};
