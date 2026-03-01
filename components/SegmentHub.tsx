"use client";

type Mode = "csv" | "interview" | "benchmark" | "reviews" | "pos" | "social" | "teachme";

interface ModeCard {
  id: Mode;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

const MODES: ModeCard[] = [
  {
    id: "interview",
    icon: "💬",
    title: "Answer questions",
    description: "Tell us what you know about your customers — takes 60 seconds.",
    badge: "Easiest",
  },
  {
    id: "benchmark",
    icon: "📈",
    title: "Industry benchmarks",
    description: "See typical segments for your business type. Zero input needed.",
    badge: "Instant",
  },
  {
    id: "csv",
    icon: "📊",
    title: "Upload data",
    description: "Import a CSV from your POS, CRM, email platform, or spreadsheet.",
  },
  {
    id: "reviews",
    icon: "⭐",
    title: "Analyze reviews",
    description: "Paste your Google or Yelp reviews to understand who's talking about you.",
  },
  {
    id: "pos",
    icon: "🧾",
    title: "Paste transactions",
    description: "Copy-paste sales data from Square, Clover, Toast, or any POS system.",
  },
  {
    id: "social",
    icon: "📱",
    title: "Social audience",
    description: "Paste your bio, recent posts, and comments to understand your following.",
  },
  {
    id: "teachme",
    icon: "🤖",
    title: "Guide me",
    description: "Answer 5 AI-guided questions one at a time. Like a mini consulting session.",
  },
];

interface SegmentHubProps {
  onSelect: (mode: Mode) => void;
}

export default function SegmentHub({ onSelect }: SegmentHubProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Understand Your Customers
      </h1>
      <p className="mb-8 text-center text-zinc-500 dark:text-zinc-400">
        Choose how you want to analyze your customer base
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="group flex items-start gap-4 rounded-xl border-2 border-zinc-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-md active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <span className="mt-0.5 text-2xl">{mode.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {mode.title}
                </span>
                {mode.badge && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {mode.badge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {mode.description}
              </p>
            </div>
            <span className="mt-1 text-zinc-300 group-hover:text-blue-500 dark:text-zinc-600 dark:group-hover:text-blue-400">
              →
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-950">
        <span className="mt-0.5 text-sm">🔒</span>
        <p className="text-xs leading-relaxed text-green-800 dark:text-green-200">
          <strong>Your data stays private.</strong> Any files or text you provide are processed in your browser or anonymized before analysis. Nothing is stored.
        </p>
      </div>
    </div>
  );
}
