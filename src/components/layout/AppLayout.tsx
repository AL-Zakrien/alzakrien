import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";

/**
 * AppLayout — the single adaptive entry point for the app shell.
 *
 * Architecture contract:
 *  - One `useIsMobile()` call here decides which shell renders.
 *  - We render *either* <DesktopLayout> *or* <MobileLayout> — never both.
 *    This keeps the DOM clean (no `md:hidden` / `md:block` toggling on the
 *    page structure itself) and prevents the desktop/mobile "drift" caused
 *    by mismatched breakpoints between sidebar, bottom nav, and content padding.
 *
 * The breakpoint is `md` (768px) — matching the existing `useIsMobile` hook —
 * so the sidebar, content padding, and nav presence all flip on the same line.
 *
 * Hydration guard: `useIsMobile` returns `undefined` on the very first render
 * (before the matchMedia effect runs). We render nothing in that frame to
 * avoid a flash of the wrong shell, then commit once the breakpoint resolves.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    // useIsMobile is sync-stable after first effect run; mark ready.
    setResolved(true);
  }, []);

  if (!resolved) return null;

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
}
