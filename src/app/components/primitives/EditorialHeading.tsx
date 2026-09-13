import type { ReactNode } from "react";

interface EditorialHeadingProps {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "sub";
}

const SIZES = {
  hero: "text-[clamp(2.75rem,6vw,5.25rem)] leading-[1.02] tracking-[-0.03em] font-semibold",
  section: "text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.025em] font-semibold",
  sub: "text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.1] tracking-[-0.02em] font-semibold",
};

/**
 * Large editorial headline with optional accent eyebrow label.
 */
export function EditorialHeading({
  eyebrow,
  children,
  className,
  as: Tag = "h2",
  size = "section",
}: EditorialHeadingProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <div className="mb-6 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-ink-3">
          <span className="h-px w-8 bg-accent" />
          <span className="text-ink-2">{eyebrow}</span>
        </div>
      )}
      <Tag className={`${SIZES[size]} text-ink`}>{children}</Tag>
    </div>
  );
}
