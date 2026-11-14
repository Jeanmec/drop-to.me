import { Berth } from "@/types/scene.t";
import styles from "./Fleet.module.css";

export const berthClass = (berth: Berth): string => {
  switch (berth) {
    case Berth.WEST:
      return styles.west;
    case Berth.EAST:
      return styles.east;
    case Berth.COVE:
      return styles.cove;
  }
};
