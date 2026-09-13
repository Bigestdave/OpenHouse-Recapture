import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "../../lib/motion";

interface MotionRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  /** viewport amount threshold (0-1) */
  amount?: number;
  /** delay in seconds */
  delay?: number;
  as?: "div" | "section" | "span" | "li" | "header";
}

/**
 * Reveals its children once as they scroll into view.
 * Respects prefers-reduced-motion by rendering statically.
 */
export function MotionReveal({
  children,
  variants = fadeUp,
  className,
  amount = 0.3,
  delay = 0,
  as = "div",
}: MotionRevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Comp>
  );
}
