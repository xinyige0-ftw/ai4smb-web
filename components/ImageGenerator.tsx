"use client";

import { useState } from "react";

interface ImageGeneratorProps {
  prompt: string;
  width?: number;
  height?: number;
  label?: string;
}

function buildImageUrl(prompt: string, width: number, height: number, seed: number): string {
  const enhanced = `${prompt.slice(0, 500)}, professional marketing photo, high quality, clean composition`;
  const params = new URLSearchParams({
    width: String(Math.min(width, 1280)),
    height: String(Math.min(height, 1280)),
    seed: String(seed),
    nologo: "true",
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?${params}`;
}

export default function ImageGenerator({
  prompt,
  width = 1080,
  height = 1080,
  label = "Generate image",
}: ImageGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));

  function generate() {
    setLoading(true);
    setError(null);
    const newSeed = Math.floor(Math.random() * 100000);
    setSeed(newSeed);
    setImageUrl(buildImageUrl(prompt, width, height, newSeed));
  }

  function handleLoad() {
    setLoading(false);
  }

  function handleError() {
    setLoading(false);
    setError("Image generation failed — try again");
    setImageUrl(null);
  }

  function download() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.target = "_blank";
    a.download = `ai4smb-${seed}.jpg`;
    a.click();
  }

  if (imageUrl) {
    return (
      <div className="mt-3">
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {loading && (
            <div className="flex h-48 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <div className="flex flex-col items-center gap-2">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <span className="text-xs text-zinc-500">Generating...</span>
              </div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI-generated"
            className={`w-full ${loading ? "hidden" : ""}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
        {!loading && (
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
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
        🎨 {label}
      </button>
    </div>
  );
}
