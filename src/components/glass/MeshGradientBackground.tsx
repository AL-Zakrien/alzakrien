import { motion } from "framer-motion";

/**
 * Temporary vibrant mesh gradient backdrop to showcase glassmorphism.
 * Replace with dynamic time-based backgrounds later.
 */
export function MeshGradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
        }}
      />

      {/* Animated mesh orbs */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, #ff6b9d 0%, transparent 70%)" }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-1/4 h-[60vh] w-[60vh] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
        animate={{
          x: [0, -25, 35, 0],
          y: [0, 30, -25, 0],
          scale: [1, 0.9, 1.08, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute -bottom-1/4 right-1/4 h-[55vh] w-[55vh] rounded-full opacity-55 blur-3xl"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -20, 35, 0],
          scale: [1, 1.05, 0.92, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-[45vh] w-[45vh] rounded-full opacity-45 blur-3xl"
        style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 25, -30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Dark mode overlay for contrast */}
      <div className="absolute inset-0 bg-black/0 dark:bg-black/40 transition-colors duration-500" />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
