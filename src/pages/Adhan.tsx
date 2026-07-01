import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ArrowRight, Bell, BellOff, Info } from "lucide-react";
import { PrayerTimes } from "@/components/PrayerTimes";
import { notificationManager, initializeNotifications } from "@/utils/notifications";

export function Adhan() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved).enabled : false;
  });

  const [preAdhanEnabled, setPreAdhanEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved).preAdhanEnabled : true;
  });

  const [notificationMinutes, setNotificationMinutes] = useState(() => {
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

    <div className="relative min-h-screen bg-gradient-to-b from-amber-50 dark:from-slate-900 via-yellow-50 dark:via-slate-800 to-white dark:to-slate-900 overflow-hidden py-8 px-4">

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 dark:bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-amber-300/10 dark:bg-orange-400/5 rounded-full blur-3xl" />
      </div>



      <div className="relative max-w-3xl mx-auto">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <Link href="/">

            <span className="inline-flex items-center gap-2 text-amber-700 dark:text-orange-400 hover:text-amber-600 dark:hover:text-orange-300 cursor-pointer transition-colors group">

              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />

              <span className="text-sm font-semibold">العودة</span>

            </span>

          </Link>

          <div className="text-center flex-1">

            <h1 className="font-serif text-5xl font-bold bg-gradient-to-l from-amber-700 dark:from-orange-500 via-amber-600 dark:via-amber-400 to-yellow-600 dark:to-yellow-400 bg-clip-text text-transparent mb-1">

              الأذان

            </h1>

          </div>

          <div className="w-12" />

        </div>



        {/* Current Time Card */}

        {/* Removed */}



        {/* Islamic Info Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">

          {/* What is Adhan */}

          <div className="relative group h-full">

            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 dark:from-orange-400 to-yellow-300 dark:to-amber-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />

            <div className="relative h-full bg-gradient-to-br from-white dark:from-slate-800/90 to-amber-50 dark:to-slate-700/90 border border-amber-200 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-300 dark:hover:border-orange-400/40 transition-colors flex flex-col">

              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 dark:from-orange-100/10 via-transparent to-yellow-100/30 dark:to-amber-100/10 rounded-2xl" />

              <div className="relative flex-1">

                <h3 className="text-lg font-bold text-amber-800 dark:text-orange-300 mb-3 text-right">ما هو الأذان؟</h3>

                <p className="text-sm text-amber-900 dark:text-orange-100/80 leading-relaxed text-right">

                  الأذان هو النداء الذي يُرفع للإعلان عن دخول وقت الصلاة المفروضة، وهو شعيرة إسلامية عظيمة ومن أبرز معالم التوحيد.

                </p>

              </div>

            </div>

          </div>



          {/* Adhan Text */}

          <div className="relative group h-full">

            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 dark:from-orange-400 to-yellow-300 dark:to-yellow-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />

            <div className="relative h-full bg-gradient-to-br from-white dark:from-slate-800/90 to-yellow-50 dark:to-slate-700/90 border border-amber-200 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-300 dark:hover:border-orange-400/40 transition-colors flex flex-col">

              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 dark:from-orange-100/10 via-transparent to-yellow-100/30 dark:to-yellow-100/10 rounded-2xl" />

              <div className="relative flex-1 flex flex-col justify-center">

                <h3 className="text-lg font-bold text-amber-800 dark:text-orange-300 mb-3 text-right">صيغة الأذان</h3>

                <p className="text-xl md:text-2xl font-bold text-amber-900 dark:text-orange-100 leading-[1.8] text-center font-serif py-2">
                  الله أكبر الله أكبر، أشهد أن لا إله إلا الله، أشهد أن لا إله إلا الله، أشهد أن محمداً رسول الله، أشهد أن محمداً رسول الله، حيّ على الصلاة، حيّ على الصلاة، حيّ على الفلاح، حيّ على الفلاح، الله أكبر الله أكبر، لا إله إلا الله
                </p>

              </div>

            </div>

          </div>

        </div>



        {/* Prayer Times Section */}

        <div className="mb-8">

          <PrayerTimes />

        </div>

        {/* Prayer Notifications Card */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-gradient-to-br from-white dark:from-slate-800/90 to-primary/5 dark:to-primary/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${notificationsEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {notificationsEnabled ? <Bell className="h-6 w-6 animate-ring" /> : <BellOff className="h-6 w-6" />}
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-foreground">إشعارات الصلاة</h3>
                    <p className="text-sm text-muted-foreground">تفعيل التنبيهات التلقائية لمواقيت الصلاة</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none ${notificationsEnabled ? "bg-primary shadow-lg shadow-primary/25" : "bg-muted-foreground/30"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notificationsEnabled ? "-translate-x-8" : "-translate-x-1"}`}
                  />
                </button>
              </div>

              {/* وقت التنبيه */}
              <div className="mt-5 pt-4 border-t border-primary/10 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => updatePreAdhanToggle(!preAdhanEnabled)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 focus:outline-none ${preAdhanEnabled ? "bg-primary/60" : "bg-muted-foreground/20"}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${preAdhanEnabled ? "-translate-x-5.5" : "-translate-x-1"}`}
                    />
                  </button>
                  <span className="text-sm font-bold text-foreground">تنبيه مسبق قبل الأذان</span>
                </div>

                {preAdhanEnabled && (
                  <div className="space-y-3 animate-slide-down">
                    <p className="text-xs text-muted-foreground text-right">اختر وقت التنبيه المسبق:</p>
                    <div className="flex flex-wrap justify-end gap-2">
                      {[5, 10, 15, 20, 30].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => updateNotificationMinutes(mins)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            notificationMinutes === mins
                              ? "bg-primary text-white shadow-md scale-105"
                              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                <div className="mt-4 pt-4 border-t border-primary/10 flex flex-col gap-2 bg-primary/5 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-start gap-2 text-primary/80">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-right">
                      {preAdhanEnabled 
                        ? `سيصلك تنبيه عند دخول وقت الصلاة، بالإضافة إلى تنبيه مسبق بـ ${notificationMinutes} دقائق.`
                        : `سيصلك تنبيه عند دخول وقت الصلاة فقط.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Benefits of Prayer Times */}

        <div className="relative group">

          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 dark:from-orange-500 via-yellow-400 dark:via-amber-400 to-amber-500 dark:to-red-400 rounded-2xl blur-xl opacity-25 group-hover:opacity-35 transition-opacity" />

          <div className="relative bg-gradient-to-br from-white dark:from-slate-800/95 to-amber-50 dark:to-orange-900/20 border border-amber-200 dark:border-orange-500/30 rounded-2xl p-8 backdrop-blur-sm">

            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 dark:from-yellow-100/10 via-transparent to-yellow-100/30 dark:to-red-100/10 rounded-2xl" />

            <div className="relative">

              <h3 className="text-2xl font-bold text-amber-800 dark:text-orange-400 mb-6 text-right">عن النبي صلى الله عليه وسلم</h3>

              <div className="space-y-4 text-right">

                <p className="text-lg text-amber-900 dark:text-orange-100/90 leading-relaxed font-arabic-modern" style={{ fontFamily: "'Cairo', 'Noto Sans Arabic', sans-serif" }}>

                  "لَو يَعلَمُ النّاسُ ما في النِّداءِ والصَّفِّ الأوَّلِ، ثُمَّ لَم يَجِدوا إلّا أن يَستَهِموا عليه لاستَهَموا، ولو يَعلَمونَ ما في التَّهجيرِ لاستَبَقوا إليه، ولو يَعلَمونَ ما في العَتَمةِ والصُّبحِ لَأتَوْهما ولو حَبوًا"

                </p>

                <div className="bg-amber-100/50 dark:bg-orange-100/10 border border-amber-200 dark:border-orange-500/20 rounded-lg p-4">

                  <p className="text-xs text-amber-900/80 dark:text-orange-100/70 leading-relaxed">

                    <span className="font-bold text-amber-800 dark:text-orange-300">الشرح:</span> الحديث يوضح فضل الأذان والصفوف الأولى في الصلاة، وفضل التبكير للصلاة المفروضة، خاصة صلاتي الفجر والعشاء. وأن الناس لو علموا ذاك الفضل لتسابقوا إليه، حتى لو كان عليهم عناء.

                  </p>

                </div>

                <p className="text-xs text-amber-700/70 dark:text-orange-200/50 mt-3">من درر السنية — شرح الأحاديث النبوية</p>

              </div>

            </div>

          </div>

        </div>



        {/* Footer */}

        <div className="text-center mt-12 pt-8 border-t border-amber-200 dark:border-orange-500/30">

          <p className="text-amber-800/80 dark:text-orange-200/70 text-sm font-light leading-relaxed">

            "ارجِعوا إلى أهليكم فعلِّموهم ومُروهم، وصلُّوا كما رأيتُموني أصلِّي، فإذا حضرتِ الصلاةُ فلْيُؤذِّنْ لكم أحدُكم، ولْيؤمَّكم أكبرُكم"

          </p>

          <p className="text-amber-700/70 dark:text-orange-200/60 text-xs mt-4">عن عبد الله بن مسعود رضي الله عنه</p>

          <p className="text-amber-600/60 dark:text-orange-200/50 text-xs mt-2">— عن النبي صلى الله عليه وسلم</p>

        </div>

      </div>

    </div>

  );

}

