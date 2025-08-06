import useCSSVariable from "@/library/CSSVariable";
import { cn } from "@/library/utils";

export default function AnimatedBorder({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const primaryBlue = useCSSVariable("--color-primary-blue");

  const background = `
    linear-gradient(45deg, black, black) padding-box,
    conic-gradient(
      from var(--border-angle),
      rgba(71,85,105,0.5) 80%,
      ${primaryBlue} 85%,
      rgba(203,213,225,1) 90%, 
      ${primaryBlue} 95%,              
      rgba(71,85,105,0.5)
    ) border-box
  `;

  return (
    <div
      className={cn("animate-border border-2 border-transparent", className)}
      style={{ background }}
    >
      {children}
    </div>
  );
}
