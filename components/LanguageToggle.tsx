"use client";

import { useTransition } from "react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export default function LanguageToggle() {
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    startTransition(() => {
      document.cookie = `locale=${locale};path=/;max-age=31536000`;
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {LOCALES.map((l, i) => (
        <span key={l.code}>
          {i > 0 && (
            <span className="text-zinc-300 dark:text-zinc-600 mx-1">|</span>
          )}
          <button
            onClick={() => switchLocale(l.code)}
            disabled={isPending}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-50"
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
