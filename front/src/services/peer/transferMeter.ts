import { MILLISECONDS_PER_SECOND } from "@/utils/time.utils";

const SPEED_WINDOW_MS = 3000;
const SAMPLE_INTERVAL_MS = 100;
const MIN_MEASURED_SPAN_MS = 300;

interface ProgressSample {
  at: number;
  bytes: number;
}

export interface TransferMeter {
  record: (bytes: number) => void;
  // null until enough of the transfer has been observed
  bytesPerSecond: () => number | null;
}

export const createTransferMeter = (): TransferMeter => {
  let samples: ProgressSample[] = [{ at: performance.now(), bytes: 0 }];

  return {
    record: (bytes) => {
      const at = performance.now();
      const latest = samples[samples.length - 1];
      if (at - latest.at < SAMPLE_INTERVAL_MS) {
        return;
      }
      const recent = samples.filter(
        (sample) => at - sample.at <= SPEED_WINDOW_MS,
      );
      samples = [...(recent.length > 0 ? recent : [latest]), { at, bytes }];
    },

    bytesPerSecond: () => {
      const oldest = samples[0];
      const latest = samples[samples.length - 1];
      const spanMs = latest.at - oldest.at;

      if (spanMs < MIN_MEASURED_SPAN_MS) {
        return null;
      }
      return ((latest.bytes - oldest.bytes) / spanMs) * MILLISECONDS_PER_SECOND;
    },
  };
};
