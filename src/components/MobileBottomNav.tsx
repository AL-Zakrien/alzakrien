import { Link, useLocation } from "wouter";
import { Home, BookOpen, Volume2, Target } from "lucide-react";

export function MobileBottomNav() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: <Home className="h-5 w-5 mb-1" /> },
    { href: "/adhan", label: "الأذان", icon: <Volume2 className="h-5 w-5 mb-1" /> },
    { href: "/tasbih", label: "المسبحة", icon: <Target className="h-5 w-5 mb-1" /> },
    { href: "/favorites", label: "محفوظات", icon: <BookOpen className="h-5 w-5 mb-1" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 fade-in-up flex justify-center pointer-events-none">
      <div className="bg-black/75 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full p-2 flex items-center justify-center gap-6 pointer-events-auto w-fit px-6">
        {navLinks.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className="relative group">
              <div
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all duration-300 ${
                  isActive
                    ? "text-amber-400"
                    : "text-white/60 hover:text-white/90 active:scale-95"
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  {link.icon}
                </div>
                <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {link.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
