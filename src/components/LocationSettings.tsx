import { useState, useEffect } from "react";
import { MapPin, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocationSettings() {
  const [latitude, setLatitude] = useState(localStorage.getItem("latitude") || "24.7136");
  const [longitude, setLongitude] = useState(localStorage.getItem("longitude") || "46.6753");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toString());
            setLongitude(position.coords.longitude.toString());
            localStorage.setItem("latitude", position.coords.latitude.toString());
            localStorage.setItem("longitude", position.coords.longitude.toString());
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            setLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLoading(false);
          }
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleSaveLocation = () => {
    localStorage.setItem("latitude", latitude);
    localStorage.setItem("longitude", longitude);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        إعدادات الموقع
      </h3>

      <div className="space-y-4">
        {/* Latitude */}
        <div>
          <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            خط العرض (Latitude)
          </label>
          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md dark:bg-blue-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            خط الطول (Longitude)
          </label>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md dark:bg-blue-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                الموقع الحالي
              </>
            )}
          </Button>

          <Button
            onClick={handleSaveLocation}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                تم الحفظ
              </>
            ) : (
              "حفظ الموقع"
            )}
          </Button>
        </div>

        <p className="text-sm text-blue-700 dark:text-blue-300">
          ℹ️ سيتم استخدام الموقع للحصول على أوقات الصلاة الدقيقة في منطقتك
        </p>
      </div>
    </div>
  );
}
