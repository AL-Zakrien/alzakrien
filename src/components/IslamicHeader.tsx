import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";

export function IslamicHeader() {
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const siteTitleMain = "الذاكرين";
  const siteTitleSub = "والذاكرات";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!contactOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-logo-btn]")) {
        setContactOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [contactOpen]);

  return (
    /* ── Outer positioner: sticky strip at top, full-width, items centered ── */
    <header
      className="sticky top-5 z-50 hidden md:flex justify-center w-full pointer-events-none"
      aria-label="التنقل الرئيسي"
    >
      {/*
        ── Floating pill container ──
        Width = fit-content so it hugs its content (no stretching).
        border-radius: 9999px = perfect pill regardless of height.
        Height controlled by py-2 on the inner content.
      */}
      <div
        className="pointer-events-auto flex items-center gap-3 px-3 py-2 transition-all duration-400"
        style={{
          borderRadius: "9999px",
          background: isScrolled
            ? "rgba(5,5,15,0.88)"
            : "rgba(8,8,20,0.72)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: isScrolled
            ? "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)"
            : "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
          transition: "background 400ms ease, box-shadow 400ms ease",
        }}
      >

        {/* ── Logo + site name ── */}
        <div className="relative" data-logo-btn>
          <button
            type="button"
            onClick={() => setContactOpen((v) => !v)}
            className="flex items-center gap-2.5 cursor-pointer rounded-full pl-1 pr-3 py-1 transition-all duration-200 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            aria-expanded={contactOpen}
            aria-haspopup="true"
            aria-label="معلومات التواصل"
          >
            <div className="text-right hidden sm:block">
              <div className="font-athkar text-base font-bold text-white leading-tight">{siteTitleMain}</div>
              <div className="text-[9px] font-bold text-white/50 tracking-widest">{siteTitleSub}</div>
            </div>
            <div className="relative">
              <img
                src={logo}
                alt="شعار الذاكرين والذاكرات"
                className="h-9 w-9 rounded-full object-cover"
                style={{ border: "1.5px solid rgba(255,255,255,0.18)" }}
              />
              {/* Online indicator dot */}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-green-500 rounded-full"
                style={{ border: "2px solid rgba(5,5,15,0.9)" }}
              />
            </div>
          </button>

          {/* ── Contact popover ── */}
          {contactOpen && (
            <div
              role="dialog"
              aria-label="تواصل معنا"
              className="absolute right-0 mt-3 w-64 rounded-3xl p-5 shadow-2xl fade-in-up z-[60]"
              style={{
                background: "rgba(6,6,18,0.92)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="flex flex-col gap-4 text-right">
                <div>
                  <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider mb-1.5">
                    تواصل معنا
                  </p>
                  <a
                    href="mailto:alzhkrin@gmail.com"
                    className="text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    alzhkrin@gmail.com
                  </a>
                </div>
                <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <p className="text-[11px] text-white/65 leading-relaxed">
                  نسأل الله أن يجعلنا وإياكم من الذاكرين الشاكرين.
                </p>
              </div>
            </div>
          )}
        </div>

        {/*
          Nav links have moved into the right-side <Sidebar> (desktop).
          This top pill now carries only brand identity + contact.
        */}
      </div>
    </header>
  );
}
