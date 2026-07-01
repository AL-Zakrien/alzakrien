import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Bell, BellOff, Clock, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationManager, getTodayPrayerTimes } from "@/utils/notifications";

interface NotificationSettings {
  enabled: boolean;
  minutesBeforeAdhan: number;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  iqamah: {
    enabled: boolean;
    selectedPrayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | null;
    minutesAfterAdhan: number;
  };
}

export function Notifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    minutesBeforeAdhan: 5,
    prayers: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
    iqamah: {
      enabled: false,
      selectedPrayer: null,
      minutesAfterAdhan: 10,
    },
  });

  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        iqamah: parsed.iqamah || {
          enabled: false,
          selectedPrayer: null,
          minutesAfterAdhan: 10,
        }
      });
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in your browser');
      return;
    }

    setIsRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        // Show a test notification
        new Notification('Athkari', {
          body: 'Notification permissions granted! You will receive prayer reminders.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // Show success feedback
    const button = document.querySelector('[data-testid="save-settings"]') as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'تم الحفظ ✓';
      button.classList.remove('outline');
      button.classList.add('bg-green-600', 'text-white', 'border-green-600');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.add('outline');
        button.classList.remove('bg-green-600', 'text-white', 'border-green-600');
      }, 2000);
    }
    
    // Trigger notification rescheduling if enabled
    if (settings.enabled && Notification.permission === 'granted') {
      const prayerTimes = getTodayPrayerTimes();
      if (prayerTimes) {
        notificationManager.scheduleNotifications(prayerTimes);
      }
    }
  };

  const prayerNames = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr', 
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };

  return (
    <div className="islamic-pattern min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-end gap-2 mb-8 slide-in-right">
          <Link href="/adhan">
            <span
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للأذان
            </span>
          </Link>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="text-sm font-semibold text-primary">الإشعارات</span>
        </div>

        {/* Hero Header */}
        <div className="relative mb-8 fade-in-up stagger-1">
          <div className="relative bg-linear-to-bl from-primary/8 via-card to-accent/5 border border-primary/15 rounded-3xl p-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-l from-primary via-accent to-primary opacity-60" />

            <div className="absolute top-4 left-4 text-accent/15 text-6xl font-serif leading-none select-none"> notifications </div>
            <div className="absolute bottom-4 right-4 text-accent/15 text-6xl font-serif leading-none select-none"> notifications </div>

            <div className="relative text-center">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2 fade-in-up stagger-2">
                إشعارات الصلاة
              </h1>
              <p className="text-muted-foreground text-sm fade-in-up stagger-3 max-w-sm mx-auto">
                تلقي تنبيهات قبل كل صلاة
              </p>
            </div>
          </div>
        </div>

        {/* Permission Status */}
        <div className="mb-6 fade-in-up stagger-4">
          {permission === 'default' && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  قم بتفعيل الإشعارات لتلقي تذكيرات الصلاة
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  اضغط على الزر بالأسفل للسماح بالإشعارات في متصفحك
                </p>
              </div>
            </div>
          )}

          {permission === 'granted' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  الإشعارات مفعلة
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  سوف تتلقى تذكيرات الصلاة
                </p>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <BellOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  الإشعارات محظورة
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  يرجى تفعيل الإشعارات في إعدادات المتصفح لتلقي تذكيرات الصلاة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 fade-in-up stagger-5">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">إعدادات الإشعارات</h2>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <label className="text-sm font-medium text-foreground">تفعيل الإشعارات</label>
              <p className="text-xs text-muted-foreground mt-1">
                تشغيل أو إيقاف تذكيرات الصلاة
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-250 ease-out ${
                settings.enabled 
                  ? 'bg-linear-to-r from-green-300 via-green-400 to-green-300 shadow-md shadow-green-200/40' 
                  : 'bg-linear-to-r from-slate-300 via-slate-400 to-slate-300 shadow-sm'
              }`}
            >
              <span
                className={`absolute h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-400 ease-in-out flex items-center justify-center ${
                  settings.enabled 
                    ? 'bottom-1.5 right-1.5' 
                    : 'bottom-0.5 left-0.5'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-250 ${
                  settings.enabled ? 'bg-green-600' : 'bg-slate-500'
                }`} />
              </span>
              {/* Very subtle glow */}
              {settings.enabled && (
                <span className="absolute -inset-0.5 rounded-full bg-green-200/20 blur-sm" />
              )}
            </button>
          </div>

          {/* Minutes Before Adhan */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              <Clock className="inline h-4 w-4 mr-1" />
              الدقائق قبل الأذان
            </label>
            <select
              value={settings.minutesBeforeAdhan}
              onChange={(e) => setSettings(prev => ({ ...prev, minutesBeforeAdhan: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value={5}>5 دقائق</option>
              <option value={10}>10 دقائق</option>
              <option value={15}>15 دقيقة</option>
              <option value={20}>20 دقيقة</option>
              <option value={30}>30 دقيقة</option>
            </select>
          </div>

          {/* Prayer Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              اختيار الصلوات
            </label>
            <div className="space-y-2">
              {Object.entries(prayerNames).map(([key, name]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{name}</span>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      prayers: { ...prev.prayers, [key]: !prev.prayers[key as keyof typeof prev.prayers] }
                    }))}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-250 ease-out ${
                      settings.prayers[key as keyof typeof settings.prayers] 
                        ? 'bg-linear-to-r from-green-300 via-green-400 to-green-300 shadow-md shadow-green-200/40' 
                        : 'bg-linear-to-r from-slate-300 via-slate-400 to-slate-300 shadow-sm'
                    }`}
                  >
                    <span
                      className={`absolute h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-400 ease-in-out flex items-center justify-center ${
                        settings.prayers[key as keyof typeof settings.prayers] 
                          ? 'bottom-1.5 right-1.5' 
                          : 'bottom-0.5 left-0.5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-250 ${
                        settings.prayers[key as keyof typeof settings.prayers] ? 'bg-green-600' : 'bg-slate-500'
                      }`} />
                    </span>
                    {/* Very subtle glow */}
                    {settings.prayers[key as keyof typeof settings.prayers] && (
                      <span className="absolute -inset-0.5 rounded-full bg-green-200/20 blur-sm" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Iqamah Notification Section */}
          <div className="mb-6 pt-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">إشعار إقامة الصلاة</h2>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4">
              اختر صلاة معينة لإشعارك بوقت إقامتها
            </p>

            {/* Enable Iqamah */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-foreground">تفعيل إشعار الإقامة</label>
                <p className="text-xs text-muted-foreground mt-1">
                  إشعار خاص لوقت إقامة صلاة محددة
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  iqamah: { ...prev.iqamah, enabled: !prev.iqamah.enabled }
                }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-250 ease-out ${
                  settings.iqamah.enabled 
                    ? 'bg-linear-to-r from-green-300 via-green-400 to-green-300 shadow-md shadow-green-200/40' 
                    : 'bg-linear-to-r from-slate-300 via-slate-400 to-slate-300 shadow-sm'
                }`}
              >
                <span
                  className={`absolute h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-400 ease-in-out flex items-center justify-center ${
                    settings.iqamah.enabled 
                      ? 'bottom-1.5 right-1.5' 
                      : 'bottom-0.5 left-0.5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-250 ${
                    settings.iqamah.enabled ? 'bg-green-600' : 'bg-slate-500'
                  }`} />
                </span>
                {/* Very subtle glow */}
                {settings.iqamah.enabled && (
                  <span className="absolute -inset-0.5 rounded-full bg-green-200/20 blur-sm" />
                )}
              </button>
            </div>

            {settings.iqamah.enabled && (
              <>
                {/* Prayer Selection for Iqamah */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    اختيار الصلاة للإقامة
                  </label>
                  <select
                    value={settings.iqamah.selectedPrayer || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      iqamah: { 
                        ...prev.iqamah, 
                        selectedPrayer: e.target.value as typeof settings.iqamah.selectedPrayer
                      }
                    }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">اختر صلاة...</option>
                    <option value="fajr">الفجر</option>
                    <option value="dhuhr">الظهر</option>
                    <option value="asr">العصر</option>
                    <option value="maghrib">المغرب</option>
                    <option value="isha">العشاء</option>
                  </select>
                </div>

                {/* Minutes After Adhan */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    <Clock className="inline h-4 w-4 mr-1" />
                    الدقائق بعد الأذان
                  </label>
                  <select
                    value={settings.iqamah.minutesAfterAdhan}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      iqamah: { 
                        ...prev.iqamah, 
                        minutesAfterAdhan: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={5}>5 دقائق</option>
                    <option value={10}>10 دقائق</option>
                    <option value={15}>15 دقيقة</option>
                    <option value={20}>20 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    وقت الإقامة بعد الأذان مباشرة
                  </p>
                </div>

                {settings.iqamah.selectedPrayer && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      اقترب وقت إقامة صلاة {prayerNames[settings.iqamah.selectedPrayer]} بعد {settings.iqamah.minutesAfterAdhan} دقائق من الأذان
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {permission === 'default' && (
              <Button
                onClick={requestNotificationPermission}
                disabled={isRequesting}
                className="flex-1"
              >
                {isRequesting ? 'جاري الطلب...' : 'تفعيل إشعارات المتصفح'}
              </Button>
            )}

            <Button
              onClick={saveSettings}
              variant="outline"
              className="flex-1"
              data-testid="save-settings"
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground fade-in-up stagger-6">
          <p>ستظهر الإشعارات في متصفحك عند اقتراب وقت الصلاة</p>
        </div>
      </div>
    </div>
  );
}
