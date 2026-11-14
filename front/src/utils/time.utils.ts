import { format, formatDistanceStrict } from "date-fns";

const FILE_TIMESTAMP_FORMAT = "yyyy-MM-dd-HH-mm-ss";
export const MILLISECONDS_PER_SECOND = 1000;

const clockFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatFileTimestamp = (date: Date): string =>
  format(date, FILE_TIMESTAMP_FORMAT);

export const formatClockTime = (date: Date): string =>
  clockFormatter.format(date);

// 12 -> "12 seconds", 200 -> "3 minutes"
export const formatRemainingTime = (seconds: number): string =>
  formatDistanceStrict(0, Math.max(1, seconds) * MILLISECONDS_PER_SECOND);
