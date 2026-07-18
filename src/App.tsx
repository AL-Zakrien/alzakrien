import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IslamicHeader } from "@/components/IslamicHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/CategoryPage";
import { Tasbih } from "@/pages/Tasbih";
import { Adhan } from "@/pages/Adhan";
import { Notifications } from "@/pages/Notifications";
import { Favorites } from "@/pages/Favorites";
import { MoreAthkar } from "@/pages/MoreAthkar";
import { HisnMorePage } from "@/pages/HisnMorePage"
import { FavoritesProvider } from "@/context/FavoritesContext";
import { TashkeelProvider } from "@/context/TashkeelContext";
import { ActiveAdhan } from "@/components/ActiveAdhan";
import { SplashScreen } from "@/components/SplashScreen";
import { DynamicBackground } from "@/components/DynamicBackground";
import { PrayerPeriodProvider } from "@/context/PrayerPeriodContext";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/adhan" component={Adhan} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/tasbih" component={Tasbih} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/more" component={MoreAthkar} />
      <Route path="/more/hisn/:chapter" component={HisnMorePage} />
    </Switch>
  );
}

function ScrollToTopOnRouteChange() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Force Arabic language and RTL direction programmatically
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PrayerPeriodProvider>
      <DynamicBackground>
        <QueryClientProvider client={queryClient}>
          <FavoritesProvider>
            <TashkeelProvider>
              <TooltipProvider>
                {showSplash && <SplashScreen />}
                <div className="relative z-10 p-4 pb-32 md:pb-8">
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <IslamicHeader />
                    <ScrollToTopOnRouteChange />
                    <Router />
                    <MobileBottomNav />
                    <ActiveAdhan />
                    <Toaster />
                    <SonnerToaster />
                  </WouterRouter>
                </div>
              </TooltipProvider>
            </TashkeelProvider>
          </FavoritesProvider>
        </QueryClientProvider>
      </DynamicBackground>
    </PrayerPeriodProvider>
  );
}

export default App;
