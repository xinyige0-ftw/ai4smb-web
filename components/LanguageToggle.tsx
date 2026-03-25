"use client";

import { useState, useCallback } from "react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

function readLocaleCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
  return match ? match[1] : "en";
}

export default function LanguageToggle() {
  const [current] = useState(readLocaleCookie);

  const switchLocale = useCallback(
    (locale: string) => {
      if (locale === current) return;
      globalThis.document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
      window.location.reload();
    },
    [current]
  );

  return (
    <div className="flex items-center gap-0.5 text-xs">
      {LOCALES.map((l, i) => (
        <span key={l.code}>
          {i > 0 && (
            <span className="mx-0.5 text-zinc-300 dark:text-zinc-600">|</span>
          )}
          <button
            onClick={() => switchLocale(l.code)}
            className={`px-0.5 transition-colors ${
              current === l.code
                ? "font-semibold text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
