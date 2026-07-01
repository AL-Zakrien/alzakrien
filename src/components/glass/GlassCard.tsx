import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlassCardVariant = "default" | "elevated" | "subtle" | "interactive";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: GlassCardVariant;
  /** Enable gentle floating entrance animation */
  animate?: boolean;
  /** Stagger delay in seconds for list animations */
  delay?: number;
}

const variantStyles: Record<GlassCardVariant, string> = {
  default: cn(
    "bg-white/10 dark:bg-black/20",
    "border border-white/25 dark:border-white/10",
    "shadow-[0_8px_32px_rgba(31,38,135,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
  ),
  elevated: cn(
    "bg-white/15 dark:bg-white/5",
    "border border-white/30 dark:border-white/15",
    "shadow-[0_12px_40px_rgba(99,102,241,0.18)] dark:shadow-[0_12px_40px_rgba(139,92,246,0.15)]",
  ),
  subtle: cn(
    "bg-white/5 dark:bg-black/10",
    "border border-white/15 dark:border-white/8",
    "shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
  ),
  interactive: cn(
    "bg-white/12 dark:bg-black/25",
    "border border-white/25 dark:border-white/12",
    "shadow-[0_8px_32px_rgba(31,38,135,0.14)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
    "cursor-pointer",
    "hover:bg-white/18 dark:hover:bg-white/8",
    "hover:border-white/35 dark:hover:border-white/20",
    "hover:shadow-[0_16px_48px_rgba(99,102,241,0.22)]",
    "active:scale-[0.98]",
  ),
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = "default",
      animate = false,
      delay = 0,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={animate ? { opacity: 0, y: 16 } : false}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: 0.45,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={
          variant === "interactive"
            ? { y: -2, transition: { duration: 0.2 } }
            : undefined
        }
        className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
          "before:opacity-60 dark:before:from-white/10",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <div className="relative z-[1]">{children}</div>
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
