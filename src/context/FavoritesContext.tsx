import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { athkarCategories, type Dhikr } from "@/data/athkar";

const storageNamespace = import.meta.env.VITE_STORAGE_NAMESPACE || "public";
const STORAGE_KEY = `athkari-favorites-${storageNamespace}`;

interface FavoriteDhikrItem extends Dhikr {
  categoryId: string;
  categoryTitle: string;
}

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  favorites: FavoriteDhikrItem[];
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const allAthkarWithCategory = athkarCategories.flatMap((category) =>
  category.athkar.map((dhikr) => ({
    ...dhikr,
    categoryId: category.id,
    categoryTitle: category.title,
  })),
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((item) => typeof item === "string"));
      }
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const value = useMemo<FavoritesContextValue>(() => {
    const lookup = new Set(favoriteIds);

    return {
      favoriteIds,
      isFavorite: (id) => lookup.has(id),
      toggleFavorite: (id) => {
        setFavoriteIds((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
      },
      favorites: allAthkarWithCategory.filter((item) => lookup.has(item.id)),
    };
  }, [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
