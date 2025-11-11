import { cn } from "@/library/utils";

export default function GradientTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-t from-zinc-700 via-white to-white bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl",
        className,
      )}
    >
      {children}
    </span>
  );
}
