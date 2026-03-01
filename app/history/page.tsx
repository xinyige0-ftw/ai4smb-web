import type { Metadata } from "next";
import HistoryView from "@/components/HistoryView";

export const metadata: Metadata = {
  title: "Your History — AI4SMB Insights",
  description: "Review your past campaigns and customer segment analyses.",
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <a href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            AI4SMB Insights
          </a>
          <div className="flex items-center gap-4">
            <a href="/segment" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Segments</a>
            <a href="/generate" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Campaigns</a>
          </div>
        </div>
      </div>
      <HistoryView />
    </main>
  );
}
