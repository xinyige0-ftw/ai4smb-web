const POLLINATIONS_URL = "https://image.pollinations.ai/prompt";

export async function POST(req: Request) {
  try {
    const { prompt, width = 1080, height = 1080 } = (await req.json()) as {
      prompt: string;
      width?: number;
      height?: number;
    };

    if (!prompt) {
      return Response.json({ error: "Prompt required" }, { status: 400 });
    }

    const safePrompt = prompt.slice(0, 500);
    const enhanced = `${safePrompt}, professional marketing photo, high quality, clean composition, commercial photography`;

    const params = new URLSearchParams({
      width: String(Math.min(width, 1280)),
      height: String(Math.min(height, 1280)),
      seed: String(Math.floor(Math.random() * 100000)),
      nologo: "true",
      model: "flux",
    });

    const url = `${POLLINATIONS_URL}/${encodeURIComponent(enhanced)}?${params}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });

    if (!res.ok) {
      return Response.json(
        { error: "Image generation failed" },
        { status: 502 },
      );
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return Response.json({
      image: `data:image/jpeg;base64,${base64}`,
      prompt: safePrompt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Imagine error:", msg);
    return Response.json({ error: "Image generation failed" }, { status: 500 });
  }
}
