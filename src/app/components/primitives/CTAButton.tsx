import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface CTAButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  href?: string;
  className?: string;
  onClick?: () => void;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app cursor-pointer select-none";

const VARIANTS = {
  primary:
    "bg-ink text-[#0a0a0a] hover:bg-white shadow-[0_1px_0_rgba(255,255,255,0.1)]",
  secondary:
    "border border-line text-ink hover:border-[#3a3a3a] hover:bg-white/[0.03]",
  ghost: "text-ink-2 hover:text-ink",
};

const SIZES = {
  md: "h-10 px-5 text-[0.9rem]",
  lg: "h-12 px-6 text-[0.95rem]",
};

export function CTAButton({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  onClick,
}: CTAButtonProps) {
  const reduce = useReducedMotion();
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`;
  const hover = reduce ? {} : { y: -2 };
  const tap = reduce ? {} : { y: 0 };

  if (href) {
    return (
      <motion.a href={href} className={cls} whileHover={hover} whileTap={tap} onClick={onClick}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" className={cls} whileHover={hover} whileTap={tap} onClick={onClick}>
      {children}
    </motion.button>
  );
}
