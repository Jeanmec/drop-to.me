import type { TBerth } from "@/types/scene.t";
import styles from "./Fleet.module.css";

export const berthClass = (berth: TBerth): string => {
  switch (berth) {
    case "west":
      return styles.west;
    case "east":
      return styles.east;
    case "cove":
      return styles.cove;
  }
};
