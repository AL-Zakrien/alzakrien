import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Home, BookOpen } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

const siteTitleMain = "الذاكرين";
const siteTitleSub = "والذاكرات";

const desktopNavLinks = [
  { href: "/", label: "الرئيسية", icon: <Home className="h-4 w-4" /> },
  { href: "/adhan", label: "الأذان", icon: <span className="text-base">🕌</span> },
  { href: "/tasbih", label: "المسبحة", icon: <span className="text-base">📿</span> },
  { href: "/favorites", label: "المحفوظات", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/more", label: "المزيد", icon: <span className="text-base">📖</span> },
];

export function GlassHeader() {
  const [location] = useLocation();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-40 w-full",
        "pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-3",
      )}
    >
      <GlassCard
        variant="subtle"
        className={cn(
          "mx-auto max-w-4xl rounded-2xl px-4 py-3",
          "bg-white/10 dark:bg-black/25",
          "backdrop-blur-2xl",
          "border-white/20 dark:border-white/10",
          "shadow-[0_8px_32px_rgba(31,38,135,0.1)]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Brand — RTL: appears on the right */}
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-1 py-1 transition-opacity hover:opacity-90"
            onClick={() => setContactOpen((v) => !v)}
          >
            <div className="relative shrink-0">
              <img
                src={logo}
                alt="شعار الذاكرين والذاكرات"
                className="h-10 w-10 rounded-xl object-cover border border-white/30 shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white/80 bg-emerald-400 shadow-sm" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-arabic-modern text-lg font-bold leading-tight text-foreground drop-shadow-sm">
                {siteTitleMain}
              </div>
              <div className="text-[10px] font-semibold tracking-widest text-foreground/70">
                {siteTitleSub}
              </div>
            </div>
          </button>

          {/* Desktop navigation pill */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
            {desktopNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location === "/" || location === ""
                  : location.startsWith(link.href);

              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
                      "transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-white/20 text-foreground shadow-sm border border-white/20"
                        : "text-foreground/75 hover:bg-white/10 hover:text-foreground",
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {contactOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-3 rounded-xl p-4 text-right",
              "bg-white/10 dark:bg-black/20",
              "border border-white/15 backdrop-blur-lg",
            )}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              تواصل معنا
            </p>
            <a
              href="mailto:alzhkrin@gmail.com"
              className="text-sm font-bold text-foreground hover:underline"
            >
              alzhkrin@gmail.com
            </a>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/70">
              نسأل الله أن يجعلنا وإياكم من الذاكرين الشاكرين.
            </p>
          </motion.div>
        )}
      </GlassCard>
    </motion.header>
  );
}
