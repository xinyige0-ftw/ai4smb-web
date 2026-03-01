import type { Metadata } from "next";
import SegmentWizard from "@/components/SegmentWizard";

export const metadata: Metadata = {
  title: "Audience Segmentation — AI4SMB Insights",
  description: "Upload your customer data and let AI find your most valuable audience segments.",
};

export default function SegmentPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <a href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            AI4SMB Insights
          </a>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Free
          </span>
        </div>
      </div>
      <SegmentWizard />
    </main>
  );
}
