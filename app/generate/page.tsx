import type { Metadata } from "next";
import GeneratePageClient from "@/components/GeneratePageClient";
import SignInGate from "@/components/SignInGate";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "AI Campaign Generator — AI4SMB Insights",
  description: "Create a personalized marketing campaign for your small business in seconds with AI.",
};

export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <NavBar />
      <SignInGate />
      <GeneratePageClient />
    </main>
  );
}
