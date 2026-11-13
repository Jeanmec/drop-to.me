import type { ReactNode } from "react";

interface StatusLineProps {
  title: ReactNode;
  detail?: ReactNode;
}

export default function StatusLine({ title, detail }: StatusLineProps) {
  return (
    <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5">
      <b className="text-xl font-semibold italic">{title}</b>
      {detail && <span className="text-ash font-mono text-xs">{detail}</span>}
    </p>
  );
}
