import { Link } from "wouter";
import { useState } from "react";
import { ArrowRight, Bell, BellOff, Info } from "lucide-react";
import { PrayerTimes } from "@/components/PrayerTimes";
import { notificationManager, initializeNotifications } from "@/utils/notifications";
import { GlassCard } from "@/components/glass/GlassCard";

export function Adhan() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved).enabled : false;
  });

  const [preAdhanEnabled, setPreAdhanEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved).preAdhanEnabled : true;
  });

  const [notificationMinutes, setNotificationMinutes] = useState(() => {
    if (typeof window === "undefined") return 5;
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved).minutesBeforeAdhan || 5 : 5;
  });

  const updatePreAdhanToggle = (enabled: boolean) => {
    const saved = localStorage.getItem('notificationSettings');
    const current = saved ? JSON.parse(saved) : {
      enabled: false,
      minutesBeforeAdhan: 5,
      prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
      iqamah: { enabled: false, selectedPrayer: null, minutesAfterAdhan: 15 }
    };
    
    const newSettings = { ...current, preAdhanEnabled: enabled };
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    setPreAdhanEnabled(enabled);
    
    if (notificationsEnabled) {
      initializeNotifications();
    }
  };

  const updateNotificationMinutes = (mins: number) => {
    const saved = localStorage.getItem('notificationSettings');
    const current = saved ? JSON.parse(saved) : {
      enabled: false,
      preAdhanEnabled: true,
      prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
      iqamah: { enabled: false, selectedPrayer: null, minutesAfterAdhan: 15 }
    };
    
    const newSettings = { ...current, minutesBeforeAdhan: mins };
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    setNotificationMinutes(mins);
    
    if (notificationsEnabled) {
      initializeNotifications();
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const newSettings = {
            enabled: true,
            preAdhanEnabled: preAdhanEnabled,
            minutesBeforeAdhan: notificationMinutes,
            prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
            iqamah: { enabled: false, selectedPrayer: null, minutesAfterAdhan: 15 }
          };
          localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
          setNotificationsEnabled(true);
          initializeNotifications();
        } else {
          alert("يرجى تفعيل الإشعارات من إعدادات المتصفح.");
        }
      }
    } else {
      const saved = localStorage.getItem('notificationSettings');
      const current = saved ? JSON.parse(saved) : {};
      const newSettings = { ...current, enabled: false };
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setNotificationsEnabled(false);
      notificationManager.clearAllTimers();
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
            <h1 className="font-serif text-5xl font-bold text-white mb-1">
              الأذان
            </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          <GlassCard className="p-6 flex flex-col">
            <h3 className="text-lg font-bold text-amber-300 mb-3 text-right">ما هو الأذان؟</h3>
            <p className="text-sm text-gray-200 leading-relaxed text-right">
              الأذان هو النداء الذي يُرفع للإعلان عن دخول وقت الصلاة المفروضة، وهو شعيرة إسلامية عظيمة ومن أبرز معالم التوحيد.
            </p>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-amber-300 mb-3 text-right">صيغة الأذان</h3>
            <p className="text-xl md:text-2xl font-bold text-white leading-[1.8] text-center font-serif py-2">
              الله أكبر الله أكبر، أشهد أن لا إله إلا الله، أشهد أن لا إله إلا الله، أشهد أن محمداً رسول الله، أشهد أن محمداً رسول الله، حيّ على الصلاة، حيّ على الصلاة، حيّ على الفلاح، حيّ على الفلاح، الله أكبر الله أكبر، لا إله إلا الله
            </p>
          </GlassCard>
        </div>

        <GlassCard className="mb-8 p-4">
          <PrayerTimes />
        </GlassCard>
        
        <GlassCard className="mb-8 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${notificationsEnabled ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-gray-300"}`}>
                  {notificationsEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-white">إشعارات الصلاة</h3>
                    <p className="text-sm text-gray-400">تفعيل التنبيهات التلقائية لمواقيت الصلاة</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none ${notificationsEnabled ? "bg-amber-400" : "bg-white/20"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notificationsEnabled ? "-translate-x-8" : "-translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => updatePreAdhanToggle(!preAdhanEnabled)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 focus:outline-none ${preAdhanEnabled ? "bg-amber-400/60" : "bg-white/20"}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${preAdhanEnabled ? "-translate-x-5.5" : "-translate-x-1"}`}
                    />
                  </button>
                  <span className="text-sm font-bold text-white">تنبيه مسبق قبل الأذان</span>
                </div>

                {preAdhanEnabled && (
                  <div className="space-y-3 animate-slide-down">
                    <p className="text-xs text-gray-400 text-right">اختر وقت التنبيه المسبق:</p>
                    <div className="flex flex-wrap justify-end gap-2">
                      {[5, 10, 15, 20, 30].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => updateNotificationMinutes(mins)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            notificationMinutes === mins
                              ? "bg-amber-400 text-black shadow-md scale-105"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                        >
                          {mins} دقيقة
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {notificationsEnabled && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 bg-white/5 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-start gap-2 text-amber-300/80">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-right">
                      {preAdhanEnabled 
                        ? `سيصلك تنبيه عند دخول وقت الصلاة، بالإضافة إلى تنبيه مسبق بـ ${notificationMinutes} دقائق.`
                        : `سيصلك تنبيه عند دخول وقت الصلاة فقط.`}
                    </p>
                  </div>
                </div>
              )}
        </GlassCard>

        <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-amber-300 mb-6 text-right">عن النبي صلى الله عليه وسلم</h3>
            <div className="space-y-4 text-right">
                <p className="text-lg text-gray-200 leading-loose font-ui">
                  "لَو يَعلَمُ النّاسُ ما في النِّداءِ والصَّفِّ الأوَّلِ، ثُمَّ لَم يَجِدوا إلّا أن يَستَهِموا عليه لاستَهَموا، ولو يَعلَمونَ ما في التَّهجيرِ لاستَبَقوا إليه، ولو يَعلَمونَ ما في العَتَمةِ والصُّبحِ لَأتَوْهما ولو حَبوًا"
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="font-bold text-amber-300">الشرح:</span> الحديث يوضح فضل الأذان والصفوف الأولى في الصلاة، وفضل التبكير للصلاة المفروضة، خاصة صلاتي الفجر والعشاء. وأن الناس لو علموا ذاك الفضل لتسابقوا إليه، حتى لو كان عليهم عناء.
                  </p>
                </div>
                <p className="text-xs text-amber-200/70 mt-3">من درر السنية — شرح الأحاديث النبوية</p>
              </div>
        </GlassCard>
        
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-300/80 text-sm font-light leading-relaxed">
            "ارجِعوا إلى أهليكم فعلِّموهم ومُروهم، وصلُّوا كما رأيتُموني أصلِّي، فإذا حضرتِ الصلاةُ فلْيُؤذِّنْ لكم أحدُكم، ولْيؤمَّكم أكبرُكم"
          </p>
          <p className="text-gray-400/70 text-xs mt-4">عن عبد الله بن مسعود رضي الله عنه</p>
          <p className="text-gray-400/60 text-xs mt-2">— عن النبي صلى الله عليه وسلم</p>
        </div>
    </div>
  );
}
