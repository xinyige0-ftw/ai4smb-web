import type { Metadata } from "next";
import SegmentRouter from "@/components/SegmentRouter";
import SignInGate from "@/components/SignInGate";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Customer Segments — AI4SMB Insights",
  description: "Understand your customers with AI. Upload data, answer questions, analyze reviews, or get instant industry benchmarks.",
};

export default function SegmentPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <NavBar />
      <SignInGate />
      <SegmentRouter />
    </main>
  );
}
