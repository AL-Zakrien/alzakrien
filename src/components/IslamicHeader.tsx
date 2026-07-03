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
    <header className="sticky top-4 z-50 max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg flex items-center justify-between p-3 mx-4">

        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
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
                    ? "bg-white/20 text-white shadow-md"
                    : "text-gray-200 hover:bg-white/10"
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
            className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-white/10 transition-all"
            onClick={() => setContactOpen((v) => !v)}
          >
            <div className="text-right hidden sm:block">
              <div className="font-serif text-xl font-bold text-white leading-tight">{siteTitleMain}</div>
              <div className="text-[10px] font-bold text-gray-300 tracking-widest">{siteTitleSub}</div>
            </div>
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-11 w-11 rounded-xl object-cover border-2 border-white/20 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-sm" />
            </div>
          </button>

          {contactOpen && (
            <div className="absolute left-0 mt-3 w-64 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/20 p-4 shadow-xl fade-in-up z-[60]">
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">تواصل معنا</p>
                  <a href="mailto:alzhkrin@gmail.com" className="text-sm font-bold text-white hover:text-gray-200 transition-colors">
                    alzhkrin@gmail.com
                  </a>
                </div>
                <div className="h-px bg-white/20" />
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  نسأل الله أن يجعلنا وإياكم من الذاكرين الشاكرين.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-4 bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-4 fade-in-up shadow-lg">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location === link.href
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-gray-200 active:bg-white/10"
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
