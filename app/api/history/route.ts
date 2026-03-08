import { getHistory, getHistoryByUserId } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const anonId = searchParams.get("anonId") || "";

  try {
    const user = await getUser();
    if (user) {
      const history = await getHistoryByUserId(user.id);
      return Response.json(history);
    }

    if (!anonId || anonId === "unknown") {
      return Response.json({ campaigns: [], segments: [] });
    }

    const history = await getHistory(anonId);
    return Response.json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    return Response.json({ campaigns: [], segments: [] });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) {
    return Response.json({ error: "Missing id or type" }, { status: 400 });
  }

  try {
    const user = await getUser();
    const db = getServiceClient();
    if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });

    const table = type === "campaign" ? "campaigns" : "segments";
    const { error } = await db.from(table).delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return Response.json({ error: "Failed to delete" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
