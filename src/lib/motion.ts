import type { Transition, TargetAndTransition } from "framer-motion";

// -----------------------------------------------------------------------------
// Motion presets — Chunk 1 of the premium UX pass
//
// Usage:
//   import { spring_snappy, tap_button } from "@/lib/motion";
//   <motion.button transition={spring_snappy} whileTap={tap_button} />
// -----------------------------------------------------------------------------

/**
 * PRESET A — "Snappy"
 * Buttons, tab-pill indicators, nav active pill.
 * Fast, tight, tactile — feels like a physical button press.
 */
export const spring_snappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.8,
};

/**
 * PRESET B — "Smooth"
 * Page-level mounts, cards entering, content transitions.
 * Slower settle — content "arrives" naturally.
 */
export const spring_smooth: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 1,
};

/**
 * PRESET C — "Gentle"
 * Overlays, modals, bottom sheets sliding in.
 * Slow, intentional — matches iOS sheet physics.
 */
export const spring_gentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 28,
  mass: 1.1,
};

// -----------------------------------------------------------------------------
// Tap feedback values — spread into whileTap={}
// -----------------------------------------------------------------------------

/** Cards: subtle depression on tap. */
export const tap_card: TargetAndTransition = { scale: 0.975 };

/** Buttons: noticeable press feel. */
export const tap_button: TargetAndTransition = { scale: 0.93 };

/** Small icon buttons: tight tactile pop. */
export const tap_icon: TargetAndTransition = { scale: 0.88 };

// -----------------------------------------------------------------------------
// Hover values — spread into whileHover={}
// -----------------------------------------------------------------------------

/** Cards: lift slightly on hover. */
export const hover_card: TargetAndTransition = { y: -3, scale: 1.005 };
