import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Home, BookOpen, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  match?: (path: string) => boolean;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "الرئيسية",
    icon: <Home className="h-5 w-5" strokeWidth={2} />,
    match: (path) => path === "/" || path === "",
  },
  {
    href: "/adhan",
    label: "الأذان",
    icon: <span className="text-lg leading-none">🕌</span>,
    match: (path) => path.startsWith("/adhan"),
  },
  {
    href: "/tasbih",
    label: "المسبحة",
    icon: <span className="text-lg leading-none">📿</span>,
    match: (path) => path.startsWith("/tasbih"),
  },
  {
    href: "/favorites",
    label: "المحفوظات",
    icon: <BookOpen className="h-5 w-5" strokeWidth={2} />,
    match: (path) => path.startsWith("/favorites"),
  },
  {
    href: "/more",
    label: "المزيد",
    icon: <LayoutGrid className="h-5 w-5" strokeWidth={2} />,
    match: (path) => path.startsWith("/more"),
  },
];

export function GlassBottomNav() {
  const [location] = useLocation();

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 md:hidden",
        "px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2",
        "pointer-events-none",
      )}
      aria-label="التنقل الرئيسي"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-md",
          "rounded-[1.75rem] px-2 py-2",
          "bg-white/12 dark:bg-black/30",
          "backdrop-blur-2xl backdrop-saturate-150",
          "border border-white/25 dark:border-white/12",
          "shadow-[0_-4px_32px_rgba(99,102,241,0.15),0_8px_32px_rgba(0,0,0,0.12)]",
          "dark:shadow-[0_-4px_32px_rgba(139,92,246,0.12),0_8px_32px_rgba(0,0,0,0.45)]",
        )}
      >
        <ul className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const isActive = item.match
              ? item.match(location)
              : location === item.href;

            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href}>
                  <motion.span
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5",
                      "rounded-2xl px-2 py-2 text-[10px] font-bold",
                      "transition-colors duration-200 cursor-pointer",
                      isActive
                        ? "text-white"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                    whileTap={{ scale: 0.92 }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="glass-nav-indicator"
                        className={cn(
                          "absolute inset-0 rounded-2xl",
                          "bg-gradient-to-br from-primary/80 to-violet-500/70",
                          "shadow-[0_4px_16px_rgba(99,102,241,0.4)]",
                          "border border-white/20",
                        )}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-[1]">{item.icon}</span>
                    <span className="relative z-[1] leading-tight">{item.label}</span>
                  </motion.span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}
