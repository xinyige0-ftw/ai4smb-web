export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI4SMB Insights
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Free AI-powered marketing for small businesses.
          No experience needed — just pick a tool and go.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Campaign Generator */}
          <a
            href="/generate"
            className="group flex flex-col items-start rounded-2xl border-2 border-zinc-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <span className="mb-3 text-3xl">📣</span>
            <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Campaign Generator
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Create a personalized marketing campaign in seconds — email, social, ads, all ready to post.
            </p>
            <span className="mt-auto text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              Create my campaign →
            </span>
          </a>

          {/* Audience Segmentation */}
          <a
            href="/segment"
            className="group flex flex-col items-start rounded-2xl border-2 border-zinc-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <span className="mb-3 text-3xl">📊</span>
            <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Audience Segments
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Upload your customer data and AI finds your best segments — with actions for each one.
            </p>
            <span className="mt-auto text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              Analyze my customers →
            </span>
          </a>
        </div>

        <p className="mt-8 text-sm text-zinc-400 dark:text-zinc-500">
          No signup required · 100% free · Powered by AI
        </p>
      </div>
    </main>
  );
}
