import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Home, BookOpen, Volume2, Target } from "lucide-react";
import { spring_snappy, tap_button } from "@/lib/motion";

export function MobileBottomNav() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: <Home className="h-5 w-5" /> },
    { href: "/adhan", label: "الأذان", icon: <Volume2 className="h-5 w-5" /> },
    { href: "/tasbih", label: "المسبحة", icon: <Target className="h-5 w-5" /> },
    { href: "/favorites", label: "محفوظات", icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    /*
      Outer positioner: fixed bottom strip, full-width, centered.
      Content (the pill) is width = fit-content so it never stretches.
      pointer-events-none on the outer div so the aurora background
      remains clickable in the margins around the pill.
    */
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom, 16px))" }}
      aria-label="التنقل السفلي"
    >
      {/*
        ── The pill ──
        height = 64px → border-radius = 32px = exact half = true pill.
        gap-6 is fixed — items cluster, never stretch to edges.
        width = fit-content (from w-fit + px-6) so pill hugs its content.
      */}
      <nav
        role="navigation"
        aria-label="روابط التنقل السريع"
        className="pointer-events-auto flex items-center gap-6 px-6"
        style={{
          height: "64px",
          borderRadius: "32px",        /* exact half of 64px = true pill */
          background: "rgba(6,6,18,0.82)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        {navLinks.map((link) => {
          const isActive = location === link.href;

          return (
            <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
              {/* motion.div wraps the tappable item — gives whileTap scale feedback */}
              <motion.div
                className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-2xl min-w-[48px] px-2.5 py-2.5"
                role="link"
                tabIndex={0}
                whileTap={tap_button}
                whileHover={{ scale: 1.06 }}
                transition={spring_snappy}
              >
                {/* Active background highlight — layoutId drives spring slide */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="mob-nav-indicator"
                      layoutId="mob-nav-indicator"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.25)",
                      }}
                      transition={spring_snappy}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <span
                  aria-hidden="true"
                  className="relative z-10"
                  style={{
                    color: isActive ? "#f59e0b" : "rgba(255,255,255,0.78)",
                    transform: isActive ? "scale(1.12)" : "scale(1)",
                    transition: "color 0.2s ease, transform 0.2s ease",
                  }}
                >
                  {link.icon}
                </span>

                {/* Label */}
                <span
                  className="relative z-10 text-[10px] font-bold leading-none"
                  style={{
                    color: isActive ? "#fbbf24" : "rgba(255,255,255,0.65)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </span>

                {/* Active dot indicator — layoutId drives spring slide */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="mob-nav-dot"
                      layoutId="mob-nav-dot"
                      aria-hidden="true"
                      className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#f59e0b",
                        boxShadow: "0 0 8px rgba(245,158,11,0.9)",
                      }}
                      transition={spring_snappy}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
