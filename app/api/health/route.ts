import { checkSupabaseConnection } from "@/lib/supabase";

/**
 * GET /api/health — Check if Supabase is configured and reachable.
 * Use this to verify persistence is set up correctly.
 */
export async function GET() {
  try {
    const result = await checkSupabaseConnection();

    if (!result.ok) {
      return Response.json(
        {
          ok: false,
          error: result.error,
          hint: result.error === "Supabase not configured"
            ? "Add SUPABASE_URL and SUPABASE_SERVICE_KEY to .env.local"
            : undefined,
        },
        { status: 503 }
      );
    }

    return Response.json({
      ok: true,
      message: "Supabase connected",
      sessionsCount: result.sessionsCount ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { ok: false, error: "Unexpected error", detail: message },
      { status: 503 }
    );
  }
}
