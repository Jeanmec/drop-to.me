export const COMPLETE_PERCENT = 100;

export const toWholePercent = (part: number, whole: number): number =>
  Math.floor((part / whole) * COMPLETE_PERCENT);
