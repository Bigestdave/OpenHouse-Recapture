import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { revealImage } from "../../lib/motion";

interface ProductFrameProps {
  children: ReactNode;
  className?: string;
  /** reveal on scroll into view */
  reveal?: boolean;
  /** Linear-style bottom fade-out */
  fadeBottom?: boolean;
  /** Height limitation class */
  maxHeight?: string;
}

/**
 * A framed product surface — treated like a photographed product.
 * Subtle border, elevated surface, soft ambient shadow. Reveals with scale/translate.
 */
export function ProductFrame({
  children,
  className,
  reveal = true,
  fadeBottom = false,
  maxHeight = "",
}: ProductFrameProps) {
  const reduce = useReducedMotion();

  const shell = (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] ${maxHeight}`}
      style={
        fadeBottom
          ? {
              maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            }
          : {}
      }
    >
      {children}
    </div>
  );

  if (!reveal || reduce) {
    return <div className={className}>{shell}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={revealImage}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {shell}
    </motion.div>
  );
}
