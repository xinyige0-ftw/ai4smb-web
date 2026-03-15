"use client";

import { useTranslations } from "next-intl";
import AuthButton from "./AuthButtonWrapper";
import LanguageToggle from "./LanguageToggle";

export default function NavBar() {
  const t = useTranslations("common");

  return (
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <a href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          AI4SMB Insights
        </a>
        <div className="flex items-center gap-3">
          <a href="/segment" className="hidden text-xs text-zinc-400 hover:text-zinc-700 sm:inline dark:hover:text-zinc-200">{t("segments")}</a>
          <a href="/generate" className="hidden text-xs text-zinc-400 hover:text-zinc-700 sm:inline dark:hover:text-zinc-200">{t("campaigns")}</a>
          <a href="/history" className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">{t("history")}</a>
          <LanguageToggle />
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
