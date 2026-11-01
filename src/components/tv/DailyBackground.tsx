"use client";

import { useState } from "react";
import { backgroundForDay, fallbackUrl } from "@/lib/backgrounds";

/**
 * Full-bleed dagelijkse achtergrondfoto (dashboard én welkomstscherm), met een
 * gradient-overlay voor leesbaarheid. Bij een laadfout: eerst de Picsum-terugval,
 * daarna gewoon de effen canvas (overlay blijft, tegels blijven leesbaar).
 * Plaats hem in een ouder met `relative isolate` zodat hij echt áchter de inhoud ligt.
 */
export function DailyBackground() {
  const bg = backgroundForDay();
  const [src, setSrc] = useState(bg.url);
  const [hidden, setHidden] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
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
      {/* Leesbaarheids-overlay: licht genoeg zodat de foto duidelijk zichtbaar
          blijft, onderaan iets donkerder voor de footer-tekst. */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/50 via-canvas/35 to-canvas/75" />
    </div>
  );
}
