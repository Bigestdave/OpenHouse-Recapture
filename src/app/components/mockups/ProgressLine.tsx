import { motion, useReducedMotion } from "motion/react";

interface ProgressLineProps {
  value: number; // 0-100
  className?: string;
  height?: string;
}

/**
 * Lime production progress line that animates left → right on view.
 */
export function ProgressLine({ value, className, height = "h-[3px]" }: ProgressLineProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-[#242424] ${height} ${className ?? ""}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-accent"
        style={{ boxShadow: "0 0 12px rgba(163,230,53,0.45)" }}
        initial={reduce ? { width: `${value}%` } : { width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
