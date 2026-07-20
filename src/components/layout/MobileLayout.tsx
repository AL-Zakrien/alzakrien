import MobileBottomNav from "@/components/MobileBottomNav";

/**
 * MobileLayout — full-width content + fixed glass bottom navigation.
 *
 * Mounted only when `useIsMobile()` is true (< 768px / `md`).
 *
 * Structure:
 *   <main>                           — no sidebar padding (sidebar is gone)
 *     <div max-w-7xl mx-auto pb-24>  — centers Bento grid + clears bottom nav
 *       {children}
 *   <MobileBottomNav />              — fixed glass pill (backdrop-blur-2xl)
 *
 * `pb-24` guarantees the fixed 64px bottom nav (plus its safe-area margin)
 * never overlaps the last row of the Bento grid.
 */
export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="flex min-h-screen w-full relative text-white bg-transparent">
      <main className="flex-1 w-full min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
