import Groq from "groq-sdk";
import { POST_AGENT_SYSTEM_PROMPT, buildFormatPrompt } from "@/lib/post-agent-prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

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

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: POST_AGENT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
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
