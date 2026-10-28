import React from "react";
import { cn } from "@/lib/utils";

interface LuxuryHotelCrestProps {
  size?: number;
  className?: string;
  variant?: "badge" | "emblem-only";
}

export function LuxuryHotelCrest({
  size = 38,
  className,
  variant = "badge",
}: LuxuryHotelCrestProps) {
  const gradientId = "luxury-22-crest";

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-transform hover:scale-105",
        className,
      )}
      aria-label="22 Boutique Hotel Crest"
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full drop-shadow-[0_2px_8px_rgba(198,157,70,0.25)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradientId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="25%" stopColor="#E6C875" />
            <stop offset="50%" stopColor="#C99B3D" />
            <stop offset="75%" stopColor="#E4C572" />
            <stop offset="100%" stopColor="#8A651E" />
          </linearGradient>

          <linearGradient id={`${gradientId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C2120" />
            <stop offset="100%" stopColor="#0B0E0D" />
          </linearGradient>

          <linearGradient id={`${gradientId}-rim`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FDE6B0" />
            <stop offset="50%" stopColor="#B3862D" />
            <stop offset="100%" stopColor="#F8DF9E" />
          </linearGradient>
        </defs>

        {variant === "badge" && (
          <>
            {/* Outer soft shadow backing circle */}
            <circle
              cx="50"
              cy="50"
              r="47"
              fill={`url(#${gradientId}-bg)`}
              stroke={`url(#${gradientId}-rim)`}
              strokeWidth="2"
            />
            {/* Inner beaded dotted ring */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke={`url(#${gradientId}-gold)`}
              strokeWidth="0.8"
              strokeDasharray="1.5 2"
              fill="none"
            />
            {/* Delicate inner border */}
            <circle
              cx="50"
              cy="50"
              r="39.5"
              stroke={`url(#${gradientId}-gold)`}
              strokeWidth="1"
              strokeOpacity="0.85"
              fill="none"
            />
          </>
        )}

        {/* Crown finial at the top */}
        <g transform="translate(50, 19) scale(0.65)">
          <path
            d="M-12 5 L-14 -4 L-5 1 L0 -7 L5 1 L14 -4 L12 5 Z"
            fill={`url(#${gradientId}-gold)`}
          />
          <circle cx="0" cy="-8.5" r="1.5" fill={`url(#${gradientId}-gold)`} />
          <circle cx="-14" cy="-5" r="1.2" fill={`url(#${gradientId}-gold)`} />
          <circle cx="14" cy="-5" r="1.2" fill={`url(#${gradientId}-gold)`} />
        </g>

        {/* Laurel branches - Left */}
        <g stroke={`url(#${gradientId}-gold)`} strokeWidth="1" fill={`url(#${gradientId}-gold)`}>
          <path d="M22 66 C 18 52 21 38 27 30" fill="none" strokeWidth="1.2" />
          <path d="M 23 34 Q 18 31 22 28 Q 26 31 23 34 Z" />
          <path d="M 21 44 Q 15 42 18 38 Q 23 41 21 44 Z" />
          <path d="M 20 54 Q 14 53 17 48 Q 22 50 20 54 Z" />
          <path d="M 22 64 Q 16 64 18 59 Q 23 61 22 64 Z" />
        </g>

        {/* Laurel branches - Right */}
        <g stroke={`url(#${gradientId}-gold)`} strokeWidth="1" fill={`url(#${gradientId}-gold)`}>
          <path d="M78 66 C 82 52 79 38 73 30" fill="none" strokeWidth="1.2" />
          <path d="M 77 34 Q 82 31 78 28 Q 74 31 77 34 Z" />
          <path d="M 79 44 Q 85 42 82 38 Q 77 41 79 44 Z" />
          <path d="M 80 54 Q 86 53 83 48 Q 78 50 80 54 Z" />
          <path d="M 78 64 Q 84 64 82 59 Q 77 61 78 64 Z" />
        </g>

        {/* Central Monogram: Serif "22" */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="24"
          fontFamily="'Playfair Display', 'Cinzel', 'Baskerville', 'Times New Roman', serif"
          fontWeight="700"
          letterSpacing="0.04em"
          fill={`url(#${gradientId}-gold)`}
          className="select-none"
        >
          22
        </text>

        {/* Subtitle ribbon arch: "HOTEL" */}
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontSize="5.2"
          fontFamily="'Instrument Sans', sans-serif"
          fontWeight="600"
          letterSpacing="0.32em"
          fill={`url(#${gradientId}-gold)`}
          fillOpacity="0.95"
          className="select-none"
        >
          BOUTIQUE
        </text>

        {/* Lower flourish / star */}
        <g transform="translate(50, 78) scale(0.7)">
          <polygon
            points="0,-3 1,-1 3,0 1,1 0,3 -1,1 -3,0 -1,-1"
            fill={`url(#${gradientId}-gold)`}
          />
        </g>
      </svg>
    </div>
  );
}
