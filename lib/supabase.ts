import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

// ─── SESSION HELPERS ──────────────────────────────────────────────

export async function getOrCreateSession(anonId: string, userId?: string): Promise<string | null> {
  const db = getClient();
  if (!db || !anonId || anonId === "unknown") return null;

  const upsertData: Record<string, string> = {
    anon_id: anonId,
    last_seen_at: new Date().toISOString(),
  };
  if (userId) {
    upsertData.user_id = userId;
  }

  const { data, error } = await db
    .from("sessions")
    .upsert(upsertData, { onConflict: "anon_id" })
    .select("id")
    .single();

  if (error) {
    console.error("Session upsert error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

// ─── CAMPAIGN HELPERS ─────────────────────────────────────────────

export interface CampaignRecord {
  session_id: string | null;
  business_type?: string;
  business_name?: string;
  goal?: string;
  budget?: string;
  channels?: string[];
  result: object;
  name?: string;
}

export async function saveCampaign(record: CampaignRecord): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("campaigns")
    .insert(record)
    .select("id")
    .single();

  if (error) {
    console.error("Save campaign error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// ─── SEGMENT HELPERS ──────────────────────────────────────────────

export interface SegmentRecord {
  session_id: string | null;
  mode: string;
  result: object;
  meta_label?: string;
  name?: string;
}

export async function saveSegment(record: SegmentRecord): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("segments")
    .insert(record)
    .select("id")
    .single();

  if (error) {
    console.error("Save segment error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// ─── HISTORY HELPERS ──────────────────────────────────────────────

export async function getHistory(anonId: string) {
  const db = getClient();
  if (!db || !anonId || anonId === "unknown") return { campaigns: [], segments: [] };

  const { data: session } = await db
    .from("sessions")
    .select("id")
    .eq("anon_id", anonId)
    .single();

  if (!session) return { campaigns: [], segments: [] };

  const sessionId = session.id;

  const [{ data: campaigns }, { data: segments }] = await Promise.all([
    db
      .from("campaigns")
      .select("id, name, business_type, business_name, goal, created_at, result")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("segments")
      .select("id, name, mode, meta_label, created_at, result")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return { campaigns: campaigns ?? [], segments: segments ?? [] };
}

// ─── HISTORY BY USER ─────────────────────────────────────────────────

export async function getHistoryByUserId(userId: string) {
  const db = getClient();
  if (!db || !userId) return { campaigns: [], segments: [] };

  const { data: sessions } = await db
    .from("sessions")
    .select("id")
    .eq("user_id", userId);

  if (!sessions || sessions.length === 0) return { campaigns: [], segments: [] };

  const sessionIds = sessions.map((s) => s.id);

  const [{ data: campaigns }, { data: segments }] = await Promise.all([
    db
      .from("campaigns")
      .select("id, name, business_type, business_name, goal, created_at, result")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("segments")
      .select("id, name, mode, meta_label, created_at, result")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return { campaigns: campaigns ?? [], segments: segments ?? [] };
}

// ─── HEALTH CHECK (for /api/health) ─────────────────────────────────

export async function checkSupabaseConnection(): Promise<{
  ok: boolean;
  error?: string;
  sessionsCount?: number;
}> {
  const db = getClient();
  if (!db) return { ok: false, error: "Supabase not configured" };

  const { count, error } = await db.from("sessions").select("id", { count: "exact", head: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, sessionsCount: count ?? 0 };
}
