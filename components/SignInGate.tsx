"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import SignInModal from "./SignInModal";

export default function SignInGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShow(true);
    });
  }, []);

  if (!show) return null;
  return <SignInModal onClose={() => setShow(false)} />;
}
