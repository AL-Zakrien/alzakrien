import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * AuthenticityBand — Trust signal section on the home page.
 * Communicates that all azkar/hadith content is verified against
 * Hisn al-Muslim and Al-Durar al-Saniyyah.
 *
 * Design: glass panel, certificate-like, modest in size, Arabic RTL.
 */
export function AuthenticityBand() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      aria-label="مصادر المحتوى وأصالته"
      className="mb-10"
    >
      <div className="authenticity-band px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-4 flex-row-reverse">

          {/* Shield icon */}
          <div
            aria-hidden="true"
            className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
          </div>

          {/* Text content */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-white/90 leading-relaxed arabic-text mb-3">
              جميع الأذكار والأدعية المنشورة في هذا الموقع مُوثَّقة ومُراجَعة من مصادر إسلامية معتمدة —
              والله أعلم
            </p>

            {/* Source chips */}
            <div className="flex items-center gap-3 flex-row-reverse">
              <SourceChip label="حصن المسلم" />
              {/* subtle separator */}
              <span aria-hidden="true" className="text-white/25 text-xs">·</span>
              <SourceChip label="الدرر السنية" />
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300/90"
      style={{
        background: "rgba(245,158,11,0.10)",
        border: "1px solid rgba(245,158,11,0.18)",
      }}
    >
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full bg-amber-400/70 flex-shrink-0"
      />
      {label}
    </span>
  );
}
