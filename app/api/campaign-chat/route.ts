import { getChatSystemPrompt } from "@/lib/campaign-chat-prompts";
import { getUser } from "@/lib/auth";
import { getOrCreateSession, extractSessionMeta } from "@/lib/supabase";
import { generateChat, getDefaultProvider } from "@/lib/ai-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, anonId, locale } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      anonId?: string;
      locale?: string;
    };

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    let userId: string | undefined;
    try {
      const user = await getUser();
      if (user) userId = user.id;
    } catch {}

    if (anonId && anonId !== "unknown") {
      const meta = extractSessionMeta(req, "chat", locale);
      getOrCreateSession(anonId, userId, meta).catch(() => {});
    }

    const response = await generateChat(
      getChatSystemPrompt(locale),
      messages,
      { temperature: 0.8, maxTokens: 3000 },
      getDefaultProvider()
    );
    const text = response.text || "";

    return Response.json({ message: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Campaign chat error:", message);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
