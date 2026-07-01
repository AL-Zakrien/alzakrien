import { motion } from "framer-motion";

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
      onAnimationComplete={() => {
        // يمكننا استخدام هذا لإخبار الأب بأن الحركية انتهت، 
        // لكننا سنعتمد على التوقيت في App.tsx لسهولة الإدارة.
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-900 text-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-100/20 shadow-2xl">
          <img 
            src="/logo.jpg" 
            alt="الذاكرين" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // إذا لم يجد الصورة في المسار الجذر، نحاول المسارات المتوقعة في الإنتاج
              const target = e.target as HTMLImageElement;
              if (target.src.includes("/logo.jpg")) {
                 // لا نغير شيئاً هنا حالياً لنرى النتيجة
              }
            }}
          />
        </div>
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-4xl font-bold font-islamic tracking-wider mb-2"
      >
        الذاكرين
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-emerald-100 text-lg"
      >
        أذكار المسلم اليومية
      </motion.p>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="h-1 bg-emerald-400 mt-6 rounded-full overflow-hidden"
      >
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-full h-full bg-white opacity-50"
        />
      </motion.div>
    </motion.div>
  );
};
