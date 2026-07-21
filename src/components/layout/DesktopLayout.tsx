import Sidebar from "@/components/Sidebar";

/**
 * DesktopLayout — persistent right sidebar (RTL) + centered main content.
 *
 * Mounted only when `useIsMobile()` is false (≥ 768px / `md`).
 *
 * Structure:
 *   <Sidebar />                      — fixed right rail (prayer + nav)
 *   <main md:pr-72>                  — reserves space for the fixed sidebar
 *     <div max-w-7xl mx-auto>        — centers + constrains the Bento grid
 *       {children}                   — header, router, overlays
 *
 * No bottom navigation on desktop. Glass aesthetic lives in <Sidebar>.
 */
export function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="flex min-h-screen w-full relative text-white bg-transparent">
      <Sidebar />
      <main className="flex-1 w-full md:pr-72 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
