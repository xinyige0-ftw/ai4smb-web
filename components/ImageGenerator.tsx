"use client";

import { useState } from "react";

interface ImageGeneratorProps {
  prompt: string;
  width?: number;
  height?: number;
  label?: string;
}

export default function ImageGenerator({
  prompt,
  width = 1080,
  height = 1080,
  label = "Generate image",
}: ImageGeneratorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/imagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width, height }),
      });
      const data = await res.json();
      if (data.image) {
        setImage(data.image);
      } else {
        setError(data.error || "Failed to generate image");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `ai4smb-${Date.now()}.jpg`;
    a.click();
  }

  if (image) {
    return (
      <div className="mt-3">
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="AI-generated" className="w-full" />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={download}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            ⬇ Download
          </button>
          <button
            onClick={generate}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-300"
          >
            🔄 Regenerate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            Generating...
          </>
        ) : (
          <>🎨 {label}</>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
