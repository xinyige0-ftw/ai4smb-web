"use client";

export type Mode =
  | "ask"
  | "data"
  | "text"
  | "teachme"
  | "csv"
  | "interview"
  | "benchmark"
  | "reviews"
  | "pos"
  | "social";

interface ModeCard {
  id: Mode;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

const MODES: ModeCard[] = [
  {
    id: "ask",
    icon: "💬",
    title: "Just ask me",
    description:
      "Answer a few quick questions about your business — or see instant benchmarks for your industry.",
    badge: "Easiest",
  },
  {
    id: "data",
    icon: "📊",
    title: "I have data",
    description:
      "Upload a spreadsheet or paste sales data from Square, Clover, Toast, or any POS system.",
    badge: "CSV, POS, CRM",
  },
  {
    id: "text",
    icon: "⭐",
    title: "I have reviews or posts",
    description:
      "Paste your Google, Yelp, or social media content to understand who's talking about you.",
    badge: "Google, Yelp, social",
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

      <div className="grid gap-3">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="group flex items-start gap-4 rounded-xl border-2 border-zinc-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-md active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <span className="mt-0.5 text-2xl">{mode.icon}</span>
            <div className="min-w-0 flex-1">
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

      <p className="mt-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
        Not sure?{" "}
        <button
          onClick={() => onSelect("teachme")}
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Let our AI guide you
        </button>
      </p>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-950">
        <span className="mt-0.5 text-sm">🔒</span>
        <p className="text-xs leading-relaxed text-green-800 dark:text-green-200">
          <strong>Your data stays private.</strong> Any files or text you
          provide are processed in your browser or anonymized before analysis.
          Nothing is stored.
        </p>
      </div>
    </div>
  );
}
