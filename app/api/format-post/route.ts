import { POST_AGENT_SYSTEM_PROMPT, buildFormatPrompt } from "@/lib/post-agent-prompts";
import { generateJSON, getDefaultProvider } from "@/lib/ai-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelContent, platform, businessContext, locale } = body as {
      channelContent: { channel: string; why: string; content: Record<string, unknown> };
      platform: string;
      businessContext?: string;
      locale?: string;
    };

    if (!channelContent || !platform) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = buildFormatPrompt(channelContent, platform, businessContext, locale);

    const response = await generateJSON(
      POST_AGENT_SYSTEM_PROMPT,
      prompt,
      { temperature: 0.7, maxTokens: 2000 },
      getDefaultProvider()
    );
    const text = response.text || "{}";
    const result = JSON.parse(text);

    return Response.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Format post error:", message);
    return Response.json(
      { error: "Something went wrong formatting your post." },
      { status: 500 }
    );
  }
}
