import { NextResponse } from "next/server";
import { createAuthClient, mergeGuestToUser } from "@/lib/auth";

/**
 * OAuth and Magic Link callback handler.
 * Supabase redirects here after a successful sign-in.
 * We exchange the code for a session, merge any guest data, then redirect home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const anonId = searchParams.get("anon_id") || "";
  const next = searchParams.get("next") || "/history";

  if (code) {
    const supabase = await createAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Merge guest activity into the authenticated account
      if (anonId && anonId !== "unknown") {
        await mergeGuestToUser(anonId, data.user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // On failure, redirect to home with an error param
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
