import type { Metadata } from "next";
import HistoryView from "@/components/HistoryView";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Your History — AI4SMB Insights",
  description: "Review your past campaigns and customer segment analyses.",
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <NavBar />
      <HistoryView />
    </main>
  );
}
