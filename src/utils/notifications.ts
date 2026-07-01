import { toast } from "sonner";

interface NotificationSettings {
  enabled: boolean;
  preAdhanEnabled: boolean;
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

interface PrayerTimes {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

class NotificationManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Request notification permission on init
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't request automatically, let user do it from settings
    }
  }

  getSettings(): NotificationSettings | null {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : null;
  }

  scheduleNotifications(prayerTimes: PrayerTimes) {
    // Clear existing timers
    this.clearAllTimers();

    const settings = this.getSettings();
    if (!settings || !settings.enabled) return;

    const prayerNames = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr', 
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    };

    // Schedule notifications for each enabled prayer
    Object.entries(prayerNames).forEach(([key, name]) => {
      if (settings.prayers[key as keyof typeof settings.prayers]) {
        const prayerTime = prayerTimes[key as keyof PrayerTimes];
        
        // 1. Schedule notification at exact prayer time
        this.scheduleSingleNotification(`${key}-at`, name, prayerTime, 0, false);
        
        // 2. Optionally schedule pre-adhan reminder
        if (settings.preAdhanEnabled) {
          this.scheduleSingleNotification(`${key}-before`, name, prayerTime, settings.minutesBeforeAdhan, true);
        }
      }
    });

    // Schedule Iqamah notification if enabled
    if (settings.iqamah?.enabled && settings.iqamah.selectedPrayer) {
      const iqamahPrayerTime = prayerTimes[settings.iqamah.selectedPrayer];
      const iqamahTime = new Date(iqamahPrayerTime.getTime() + settings.iqamah.minutesAfterAdhan * 60000);

      const now = new Date();
      if (iqamahTime > now) {
        const iqamahTimer = setTimeout(() => {
          this.showNotification(settings.iqamah.selectedPrayer!, iqamahTime, false, true);
        }, iqamahTime.getTime() - now.getTime());

        this.timers.set(`iqamah-${settings.iqamah.selectedPrayer}`, iqamahTimer);
      }
    }
  }

  private scheduleSingleNotification(id: string, name: string, prayerTime: Date, minutesBefore: number, isReminder: boolean) {
    const notificationTime = new Date(prayerTime.getTime() - minutesBefore * 60000);
    const now = new Date();

    // Only schedule if the notification time is in the future
    if (notificationTime > now) {
      const timer = setTimeout(() => {
        this.showNotification(name, prayerTime, isReminder);
      }, notificationTime.getTime() - now.getTime());

      this.timers.set(id, timer);
      console.log(`Scheduled ${name} notification (isReminder: ${isReminder}) for ${notificationTime.toLocaleTimeString()}`);
    }
  }

  private showNotification(prayerName: string, prayerTime: Date, isReminder: boolean, isIqamah = false) {
    const settings = this.getSettings();
    if (!settings || !settings.enabled) return;

    // Get Arabic prayer name
    const prayerNames: { [key: string]: string } = {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    };
    
    const arabicPrayerName = prayerNames[prayerName.toLowerCase()] || prayerName;
    const timeStr = prayerTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const title = isReminder 
      ? `تذكير صلاة ${arabicPrayerName}` 
      : isIqamah ? `تذكير إقامة صلاة ${arabicPrayerName}` : `حان الآن موعد صلاة ${arabicPrayerName}`;
    
    const body = isReminder 
      ? `متبقي على أذان ${arabicPrayerName} ${settings.minutesBeforeAdhan} دقائق\nالوقت: ${timeStr}`
      : isIqamah ? `حان وقت الإقامة لصلاة ${arabicPrayerName}\nالوقت: ${timeStr}` : `حان الآن موعد صلاة ${arabicPrayerName}\nالوقت: ${timeStr}`;

    // Trigger Interactive Adhan overlay if it's the exact Adhan time (not reminder, not iqamah)
    if (!isReminder && !isIqamah) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('play-adhan', {
          detail: { prayerName: arabicPrayerName }
        }));
      }, 0);
    }

    // 1. Show In-Browser Toast (Always show if app is open)
    toast(title, {
      duration: 10000,
      position: "top-center",
      style: {
        direction: 'rtl',
        fontFamily: 'Amiri, serif',
        backgroundColor: '#1a1a1a',
        color: '#fbbf24',
        border: '1px solid #333',
      }
    });

    // 2. Show System Notification (If permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(`الذاكرين والذاكرات`, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: isReminder ? `reminder-${prayerName}` : `adhan-${prayerName}`,
          requireInteraction: true,
          silent: false
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) {
        console.error('System notification error:', e);
      }
    }
  }

  clearAllTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  // Check if it's time to reschedule (called when prayer times update)
  rescheduleIfNeeded(prayerTimes: PrayerTimes) {
    this.scheduleNotifications(prayerTimes);
  }

  sendTestNotification() {
    const testTime = new Date();
    this.showNotification('Fajr', testTime, false, false);
  }

  sendTestReminder() {
    const testTime = new Date();
    this.showNotification('Fajr', testTime, true, false);
  }
}

export const notificationManager = new NotificationManager();

export function getTodayPrayerTimes(): PrayerTimes | null {
  try {
    const savedTimes = localStorage.getItem('prayerTimes');
    if (savedTimes) {
      const times = JSON.parse(savedTimes);
      const today = new Date();
      
      return {
        fajr: new Date(`${today.toDateString()} ${times.fajr}`),
        dhuhr: new Date(`${today.toDateString()} ${times.dhuhr}`),
        asr: new Date(`${today.toDateString()} ${times.asr}`),
        maghrib: new Date(`${today.toDateString()} ${times.maghrib}`),
        isha: new Date(`${today.toDateString()} ${times.isha}`)
      };
    }
  } catch (error) {
    console.error('Error parsing prayer times:', error);
  }
  
  return null;
}

// Initialize notifications when page loads
export function initializeNotifications() {
  const prayerTimes = getTodayPrayerTimes();
  if (prayerTimes) {
    notificationManager.scheduleNotifications(prayerTimes);
  }
}
