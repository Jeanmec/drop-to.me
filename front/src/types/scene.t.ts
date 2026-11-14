import type { TDevice } from "@/schemas/device.schema";

export enum ScenePhase {
  SKETCHED = "SKETCHED",
  WASHED = "WASHED",
  PAINTED = "PAINTED",
}

export enum BeamState {
  SWEEPING = "SWEEPING",
  HELD = "HELD",
  DARK = "DARK",
}

export enum Berth {
  WEST = "WEST",
  EAST = "EAST",
  COVE = "COVE",
}

export enum BoatSignal {
  IDLE = "IDLE",
  RECEIVING = "RECEIVING",
  RECEIVED = "RECEIVED",
}

export enum QuestionBoatKind {
  CUTTER = "CUTTER",
  PERISCOPE = "PERISCOPE",
  GALLEON = "GALLEON",
  AIRDROP = "AIRDROP",
  COINS = "COINS",
}

export enum CloudSize {
  WIDE = "WIDE",
  MID = "MID",
  SMALL = "SMALL",
}

// the values are the ids of the SVG patterns
export enum Hatch {
  VEIL = "hatch-veil",
  ROSE = "hatch-rose",
  SEA = "hatch-sea",
  FAR = "hatch-far",
  LIT = "hatch-lit",
  LIT_FAR = "hatch-lit-far",
  MOON = "hatch-moon",
  ASHEN = "hatch-ashen",
  ROCK = "hatch-rock",
  WOOD = "hatch-wood",
  GOLD = "hatch-gold",
  GRASS = "hatch-grass",
  CORAL = "hatch-coral",
  LAMP = "hatch-lamp",
  HULL = "hatch-hull",
  SAIL_BLUSH = "hatch-sail-blush",
  SAIL_LILAC = "hatch-sail-lilac",
  SAIL_MOON = "hatch-sail-moon",
  GLINT = "hatch-glint",
  GLINT_FAR = "hatch-glint-far",
}

export type TMooring = {
  peerId: string;
  device?: TDevice;
};
