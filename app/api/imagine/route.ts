const TOGETHER_URL = "https://api.together.xyz/v1/images/generations";
const TOGETHER_KEY = process.env.TOGETHER_API_KEY;

export async function POST(req: Request) {
  if (!TOGETHER_KEY) {
    return Response.json(
      { error: "Image generation not configured" },
      { status: 503 },
    );
  }

  try {
    const { prompt, width = 1024, height = 1024 } = (await req.json()) as {
      prompt: string;
      width?: number;
      height?: number;
    };

    if (!prompt) {
      return Response.json({ error: "Prompt required" }, { status: 400 });
    }

    const enhanced = `${prompt.slice(0, 500)}, professional marketing photo, high quality, clean composition`;

    const res = await fetch(TOGETHER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: enhanced,
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
        steps: 4,
        n: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Together image error:", res.status, err);
      return Response.json(
        { error: "Image generation failed" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return Response.json(
        { error: "No image returned" },
        { status: 502 },
      );
    }

    return Response.json({ image: imageUrl, prompt: prompt.slice(0, 500) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Imagine error:", msg);
    return Response.json(
      { error: "Image generation failed" },
      { status: 500 },
    );
  }
}
