"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Bediening", icon: "▶" },
  { href: "/app/week", label: "Week", icon: "▦" },
  { href: "/app/instellingen", label: "Instellingen", icon: "⚙" },
  { href: "/app/test", label: "Test", icon: "✓" },
];

export function AppTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-stretch justify-around border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {TABS.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-label-md font-medium ${
              active ? "text-amber" : "text-text-mid"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
