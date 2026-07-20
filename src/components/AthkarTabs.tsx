import { useState } from "react";
import { athkarCategories, type AthkarCategory } from "@/data/athkar";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./glass/GlassCard";
import { spring_snappy, spring_smooth } from "@/lib/motion";

interface AthkarTabsProps {
  categories: AthkarCategory[];
}

export function AthkarTabs({ categories }: AthkarTabsProps) {
  const [selectedTab, setSelectedTab] = useState(categories[0]);

  return (
    <div className="w-full">
      <nav className="flex flex-wrap justify-center items-center gap-2 p-2 mb-6 bg-black/20 backdrop-blur-sm rounded-full">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedTab(item)}
            className={`relative px-4 py-2 text-sm font-bold rounded-full transition-colors ${
              selectedTab.id === item.id ? "text-white" : "text-gray-300 hover:bg-white/10"
            }`}
          >
            {selectedTab.id === item.id && (
              <motion.div
                layoutId="pill-background"
                className="absolute inset-0 bg-white/20 rounded-full"
                transition={spring_snappy}
              />
            )}
            <span className="relative z-10">{item.title}</span>
          </button>
        ))}
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={spring_smooth}
          className="space-y-4"
        >
          {selectedTab.athkar.slice(0, 5).map((dhikr) => ( // Limiting to 5 for preview on home page
            <GlassCard key={dhikr.id} className="p-4 text-right">
              <p className="text-lg text-white font-kufi leading-loose">{dhikr.text}</p>
              {dhikr.count && dhikr.count > 1 && (
                 <div className="flex justify-start items-center mt-4">
                    <span className="px-3 py-1 text-xs font-bold text-black bg-amber-400 rounded-full">
                      يُقرأ {dhikr.count} مرات
                    </span>
                 </div>
              )}
            </GlassCard>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
