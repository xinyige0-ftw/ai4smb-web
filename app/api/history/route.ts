import { getHistory } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const anonId = searchParams.get("anonId") || "";

  if (!anonId || anonId === "unknown") {
    return Response.json({ campaigns: [], segments: [] });
  }

  try {
    const history = await getHistory(anonId);
    return Response.json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    return Response.json({ campaigns: [], segments: [] });
  }
}
