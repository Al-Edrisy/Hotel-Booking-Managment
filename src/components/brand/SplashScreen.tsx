import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { LuxuryHotelCrest } from "@/components/brand/LuxuryHotelCrest";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  onComplete: () => void;
  hotelName?: string;
  autoDismissMs?: number;
}

export function SplashScreen({
  onComplete,
  hotelName = "22 Boutique Hotel",
  autoDismissMs = 1600,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  // Allow Escape key to dismiss instantly
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleExit]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / autoDismissMs) * 100));
      setProgress(pct);

      if (elapsed >= autoDismissMs) {
        clearInterval(interval);
        handleExit();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [autoDismissMs, handleExit]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to 22 Boutique Hotel"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-[#0A0D0C] text-[#F3EFE6] transition-opacity duration-300 ease-out py-6 sm:py-10 px-4 sm:px-6 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient background gold glow & subtle radial lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(201,155,61,0.18)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,155,61,0.12)_0%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* Top Bar with instant Skip control */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C99B3D]/80 font-medium">
          <Sparkles className="size-3.5 text-[#C99B3D]" />
          <span>Curated Hospitality</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="text-xs text-[#E6C875]/80 hover:text-[#FFF2D6] hover:bg-white/5 border border-[#C99B3D]/20 gap-1.5 rounded-full px-3.5 py-1.5 transition-colors"
        >
          <span>Skip</span>
          <X className="size-3.5 opacity-70" />
        </Button>
      </div>

      {/* Main Center Prestige Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg my-auto animate-in fade-in zoom-in-95 duration-500">
        {/* Grand Hotel Crest */}
        <div className="relative mb-5 sm:mb-6">
          <div className="absolute inset-0 rounded-full bg-[#C99B3D]/25 blur-xl scale-125" />
          <LuxuryHotelCrest size={80} className="relative shadow-2xl" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C99B3D]">
            Welcome to
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FFF8EB] drop-shadow-sm">
            {hotelName}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#D1C7B7] max-w-md mx-auto pt-1 font-light leading-relaxed">
            Where timeless grandeur meets contemporary serenity. Everyday luxury redefined.
          </p>
        </div>

        {/* Enter Action Button */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleExit}
            className="bg-gradient-to-r from-[#C99B3D] via-[#E4C572] to-[#C99B3D] text-[#0B0E0D] font-semibold text-xs tracking-wide px-6 py-2.5 rounded-full shadow-lg shadow-[#C99B3D]/20 hover:brightness-110 active:scale-95 transition-all gap-2"
          >
            <span>Enter Front Desk</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="relative z-10 w-full max-w-md pb-2 text-center space-y-2">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C99B3D] to-[#FDE6B0] transition-all duration-75 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#A89D8B]">
          <span>Loading 22 Boutique Hotel</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
