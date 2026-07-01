import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isDark) {
      html.classList.add("dark");
      html.style.backgroundColor = "#0d1117";
      body.style.backgroundColor = "#0d1117";
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      // فرض اللون الأبيض الناصع بقوة
      html.style.setProperty("background-color", "#ffffff", "important");
      body.style.setProperty("background-color", "#ffffff", "important");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="rounded-full hover:bg-muted/50 transition-colors"
      data-testid="button-theme-toggle"
      aria-label="تبديل الوضع الليلي"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  );
}
