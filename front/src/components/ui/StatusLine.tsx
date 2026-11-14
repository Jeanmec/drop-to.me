import type { ReactNode } from "react";

interface StatusLineProps {
  title: ReactNode;
  detail?: ReactNode;
}

export default function StatusLine({ title, detail }: StatusLineProps) {
  return (
    <p className="grid justify-items-center gap-0.5">
      <b className="text-xl font-semibold italic">{title}</b>
      {detail && <span className="text-ash font-mono text-xs">{detail}</span>}
    </p>
  );
}
