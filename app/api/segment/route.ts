import Groq from "groq-sdk";
import {
  buildSegmentPrompt,
  SEGMENT_SYSTEM_PROMPT,
  type CsvSummary,
} from "@/lib/segment-prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 5;

function checkRateLimit(anonId: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(anonId);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(anonId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anonId, summary, businessContext } = body as {
      anonId?: string;
      summary?: CsvSummary;
      businessContext?: string;
    };

    if (!summary?.columns?.length || !summary?.rowCount) {
      return Response.json({ error: "No data summary provided" }, { status: 400 });
    }

    if (anonId && !checkRateLimit(anonId)) {
      return Response.json(
        { error: "You've reached the limit of 5 analyses per hour. Please try again later." },
        { status: 429 }
      );
    }

    const prompt = buildSegmentPrompt(summary, businessContext);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SEGMENT_SYSTEM_PROMPT },
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
      rowCount: summary.rowCount,
      columnCount: summary.columns.length,
      segmentCount: result.segments?.length,
    });

    return Response.json({ result, meta: { rowCount: summary.rowCount, columnCount: summary.columns.length } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Segment error:", message);
    return Response.json(
      { error: "Something went wrong analyzing your data. Please try again.", debug: message },
      { status: 500 }
    );
  }
}
