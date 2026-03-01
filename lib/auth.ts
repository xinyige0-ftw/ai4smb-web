import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client using the anon key + cookies for auth.
 * Used in Server Components and Route Handlers.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from Server Component — cookies will be set by middleware
        }
      },
    },
  });
}

/**
 * Get the currently signed-in user (or null for guests).
 */
export async function getUser() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Merge a guest anonymous session into the authenticated user's session.
 * Called after sign-in when the user had prior guest activity.
 */
export async function mergeGuestToUser(anonId: string, userId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  const { error } = await db.rpc("merge_guest_to_user", {
    p_anon_id: anonId,
    p_user_id: userId,
  });

  if (error) console.error("Guest merge error:", error.message);
}
