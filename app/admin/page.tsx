import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Admin — AI4SMB" };

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            AI4SMB Admin
          </Link>
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            ← Back to site
          </Link>
        </div>
      </div>
      <AdminDashboard />
    </main>
  );
}
