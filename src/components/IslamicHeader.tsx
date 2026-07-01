import { Link, useLocation } from "wouter";
import { Home, BookOpen, AlignJustify, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.jpg";

export function IslamicHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const siteTitleMain = "الذاكرين";
  const siteTitleSub = "والذاكرات";

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: <Home className="h-4 w-4" /> },
    { href: "/adhan", label: "الأذان", icon: <span className="text-base">📢</span> },
    { href: "/tasbih", label: "المسبحة", icon: <span className="text-base">📿</span> },
    { href: "/favorites", label: "المحفوظات", icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-md border-b border-border/60 shadow-sm transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="القائمة"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  location === link.href
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </span>
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-muted/50 transition-all"
            onClick={() => setContactOpen((v) => !v)}
          >
            <div className="text-right hidden sm:block">
              <div className="font-serif text-xl font-bold text-primary leading-tight">{siteTitleMain}</div>
              <div className="text-[10px] font-bold text-muted-foreground tracking-widest">{siteTitleSub}</div>
            </div>
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-11 w-11 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
          </button>

          {contactOpen && (
            <div className="absolute left-0 mt-3 w-64 rounded-2xl border border-border bg-white dark:bg-card p-4 shadow-xl fade-in-up z-[60]">
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">تواصل معنا</p>
                  <a href="mailto:alzhkrin@gmail.com" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                    alzhkrin@gmail.com
                  </a>
                </div>
                <div className="h-px bg-border/50" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  نسأل الله أن يجعلنا وإياكم من الذاكرين الشاكرين.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-card px-4 py-4 fade-in-up shadow-inner">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location === link.href
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-muted/30 text-muted-foreground active:bg-muted"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
