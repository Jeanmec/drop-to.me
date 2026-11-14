import clsx from "clsx";
import { BeamState } from "@/types/scene.t";
import styles from "./Scene.module.css";

export const turnClass = (beam: BeamState): string => {
  switch (beam) {
    case BeamState.SWEEPING:
      return styles.turning;
    case BeamState.HELD:
    case BeamState.DARK:
      return clsx(styles.turning, styles.held);
  }
};

export const lightClass = (beam: BeamState): string | undefined => {
  switch (beam) {
    case BeamState.SWEEPING:
      return undefined;
    case BeamState.HELD:
      return styles.dimmed;
    case BeamState.DARK:
      return styles.dark;
  }
};
