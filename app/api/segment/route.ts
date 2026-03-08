import Groq from "groq-sdk";
import { buildSegmentPrompt, getSegmentSystemPrompt, type CsvSummary } from "@/lib/segment-prompts";
import { getOrCreateSession, saveSegment } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  buildInterviewPrompt,
  buildBenchmarkPrompt,
  buildReviewPrompt,
  buildSocialPrompt,
  buildTeachMePrompt,
  getInsightSystemPrompt,
  type InterviewAnswers,
  type BenchmarkInput,
  type TeachMeConversation,
} from "@/lib/insight-prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anonId, mode = "csv", locale } = body as { anonId?: string; mode?: string; locale?: string };

    let userId: string | undefined;
    try {
      const user = await getUser();
      if (user) userId = user.id;
    } catch {}

    if (anonId && !checkRateLimit(anonId)) {
      return Response.json(
        { error: "You've reached the limit of 10 analyses per hour. Please try again later." },
        { status: 429 }
      );
    }

    let prompt: string;
    let systemPrompt: string;
    let metaRowCount = 0;
    let metaColCount = 0;

    switch (mode) {
      case "csv": {
        const { summary, businessContext } = body as {
          summary?: CsvSummary;
          businessContext?: string;
        };
        if (!summary?.columns?.length || !summary?.rowCount) {
          return Response.json({ error: "No data summary provided" }, { status: 400 });
        }
        prompt = buildSegmentPrompt(summary, businessContext, locale);
        systemPrompt = getSegmentSystemPrompt(locale);
        metaRowCount = summary.rowCount;
        metaColCount = summary.columns.length;
        break;
      }
      case "interview": {
        const { answers } = body as { answers?: InterviewAnswers };
        if (!answers?.businessType) {
          return Response.json({ error: "Missing interview answers" }, { status: 400 });
        }
        prompt = buildInterviewPrompt(answers, locale);
        systemPrompt = getInsightSystemPrompt(locale);
        break;
      }
      case "benchmark": {
        const { input } = body as { input?: BenchmarkInput };
        if (!input?.businessType) {
          return Response.json({ error: "Missing business type" }, { status: 400 });
        }
        prompt = buildBenchmarkPrompt(input, locale);
        systemPrompt = getInsightSystemPrompt(locale);
        break;
      }
      case "reviews": {
        const { reviewText, businessType } = body as {
          reviewText?: string;
          businessType?: string;
        };
        if (!reviewText?.trim()) {
          return Response.json({ error: "No review text provided" }, { status: 400 });
        }
        prompt = buildReviewPrompt(reviewText, businessType, locale);
        systemPrompt = getInsightSystemPrompt(locale);
        break;
      }
      case "social": {
        const { socialContent, businessType } = body as {
          socialContent?: string;
          businessType?: string;
        };
        if (!socialContent?.trim()) {
          return Response.json({ error: "No social content provided" }, { status: 400 });
        }
        prompt = buildSocialPrompt(socialContent, businessType, locale);
        systemPrompt = getInsightSystemPrompt(locale);
        break;
      }
      case "teachme": {
        const { conversation } = body as { conversation?: TeachMeConversation };
        if (!conversation?.qas?.length) {
          return Response.json({ error: "No conversation data provided" }, { status: 400 });
        }
        prompt = buildTeachMePrompt(conversation, locale);
        systemPrompt = getInsightSystemPrompt(locale);
        break;
      }
      default:
        return Response.json({ error: "Unknown mode" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(text);

    console.log("SEGMENT:", {
      anonId: anonId || "unknown",
      mode,
      segmentCount: result.segments?.length,
    });

    let savedId: string | null = null;
    if (anonId && anonId !== "unknown") {
      const metaLabel = body.metaLabel as string | undefined;
      try {
        const sessionId = await getOrCreateSession(anonId, userId);
        savedId = await saveSegment({
          session_id: sessionId,
          mode,
          result,
          meta_label: metaLabel,
        });
      } catch {}
    }

    return Response.json({
      result,
      id: savedId,
      meta: { rowCount: metaRowCount, columnCount: metaColCount, mode },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Segment error:", message);
    return Response.json(
      { error: "Something went wrong analyzing your data. Please try again.", debug: message },
      { status: 500 }
    );
  }
}
