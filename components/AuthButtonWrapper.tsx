"use client";

import dynamic from "next/dynamic";

// Load AuthButton only on the client — it requires browser APIs and Supabase env vars
const AuthButton = dynamic(() => import("./AuthButton"), { ssr: false });

export default function AuthButtonWrapper() {
  return <AuthButton />;
}
