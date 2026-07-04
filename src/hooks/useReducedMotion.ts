import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}

export function useStarCount(): number {
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return 15;
    return window.innerWidth < 768 ? 18 : 55;
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setCount(media.matches ? 18 : 55);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return count;
}
