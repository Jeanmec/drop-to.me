import type { TDevice } from "@/types/peer.t";

export type TScenePhase = "sketched" | "washed" | "painted";

export type TBeamState = "sweeping" | "held" | "dark";

export type TBerth = "west" | "east" | "cove";

export type TBoatSignal = "idle" | "receiving" | "received";

export type TMooring = {
  peerId: string;
  device?: TDevice;
};

export type TQuestionBoat =
  | "cutter"
  | "periscope"
  | "galleon"
  | "airdrop"
  | "coins";
