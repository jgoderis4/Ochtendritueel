"use client";

import { useState } from "react";
import { backgroundForDay, fallbackUrl } from "@/lib/backgrounds";

/**
 * Full-bleed dagelijkse achtergrondfoto achter het dashboard, met een donkere
 * gradient-overlay voor leesbaarheid. Bij een laadfout: eerst de Picsum-terugval,
 * daarna gewoon de effen canvas (overlay blijft, tegels blijven leesbaar).
 */
export function DashboardBackground() {
  const bg = backgroundForDay();
  const [src, setSrc] = useState(bg.url);
  const [hidden, setHidden] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {!hidden && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => {
            const fb = fallbackUrl();
            if (src !== fb) setSrc(fb);
            else setHidden(true);
          }}
        />
      )}
      {/* Leesbaarheids-overlay: donker genoeg voor witte tekst, foto blijft zichtbaar. */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/80 via-canvas/70 to-canvas/90" />
    </div>
  );
}
