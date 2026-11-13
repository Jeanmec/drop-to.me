import { cn } from "@/library/utils";
import styles from "./Scene.module.css";

type GlintKind = "scattered" | "lit";

interface SeaGlintsProps {
  kind: GlintKind;
  className: string;
}

interface GlintFills {
  far: string;
  near: string;
}

const fillsOf = (kind: GlintKind): GlintFills => {
  switch (kind) {
    case "scattered":
      return { far: "url(#hatch-glint-far)", near: "url(#hatch-glint)" };
    case "lit":
      return { far: "url(#hatch-lit-far)", near: "url(#hatch-lit)" };
  }
};

export default function SeaGlints({ kind, className }: SeaGlintsProps) {
  const fills = fillsOf(kind);

  return (
    <div className={cn(styles.glints, className)}>
      <svg className={styles.glintsDrift}>
        <rect width="100%" height="24%" fill={fills.far} />
        <rect y="24%" width="100%" height="76%" fill={fills.near} />
      </svg>
    </div>
  );
}
