import type { TBeamState } from "@/types/scene.t";
import styles from "./Scene.module.css";

export const turnClass = (beam: TBeamState): string => {
  switch (beam) {
    case "sweeping":
      return styles.turning;
    case "held":
    case "dark":
      return `${styles.turning} ${styles.held}`;
  }
};

export const lightClass = (beam: TBeamState): string => {
  switch (beam) {
    case "sweeping":
      return "";
    case "held":
      return styles.dimmed;
    case "dark":
      return styles.dark;
  }
};
