import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** vertical padding size */
  spacing?: "default" | "large" | "none";
}

const PAD = {
  default: "py-28 md:py-36",
  large: "py-36 md:py-48",
  none: "",
};

/**
 * Section wrapper enforcing consistent vertical rhythm and a 1280px content container.
 */
export function Section({ children, className, id, spacing = "default" }: SectionProps) {
  return (
    <section id={id} className={`${PAD[spacing]} ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">{children}</div>
    </section>
  );
}
