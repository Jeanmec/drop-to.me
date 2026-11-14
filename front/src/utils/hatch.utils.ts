import type { Hatch } from "@/types/scene.t";

export const hatchFill = (hatch: Hatch): string => `url(#${hatch})`;
