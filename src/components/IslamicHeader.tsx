import { Link, useLocation } from "wouter";
import { Home, BookOpen, Volume2, Target } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";

export function IslamicHeader() {
  const [location] = useLocation();
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const siteTitleMain = "الذاكرين";
  const siteTitleSub = "والذاكرات";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: <Home className="h-4 w-4" /> },
    { href: "/adhan", label: "الأذان", icon: <Volume2 className="h-4 w-4" /> },
    { href: "/tasbih", label: "المسبحة", icon: <Target className="h-4 w-4" /> },
    { href: "/favorites", label: "المحفوظات", icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-6 z-50 flex justify-center hidden md:flex w-full pointer-events-none">
      <div className={`pointer-events-auto transition-all duration-500 border rounded-full flex items-center justify-center p-2 gap-4 w-fit px-4 ${
        isScrolled 
          ? "bg-black/75 backdrop-blur-2xl border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
          : "bg-white/15 backdrop-blur-xl border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
      }`}>

        <nav className="flex items-center gap-2 pr-2">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="relative border-r border-white/20 pr-4">
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition-all"
            onClick={() => setContactOpen((v) => !v)}
          >
            <div className="text-right hidden sm:block">
              <div className="font-serif text-lg font-bold text-white leading-tight">{siteTitleMain}</div>
              <div className="text-[9px] font-bold text-white/60 tracking-widest">{siteTitleSub}</div>
            </div>
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 rounded-full object-cover border border-white/20 shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black/50 rounded-full shadow-sm" />
            </div>
          </button>

          {contactOpen && (
            <div className="absolute left-0 mt-4 w-64 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl fade-in-up z-[60]">
              <div className="flex flex-col gap-4 text-right">
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">تواصل معنا</p>
                  <a href="mailto:alzhkrin@gmail.com" className="text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors">
                    alzhkrin@gmail.com
                  </a>
                </div>
                <div className="h-px bg-white/10" />
                <p className="text-[11px] text-white/70 leading-relaxed">
                  نسأل الله أن يجعلنا وإياكم من الذاكرين الشاكرين.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
