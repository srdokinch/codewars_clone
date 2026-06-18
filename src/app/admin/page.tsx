import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAllProblems } from "@/lib/problems";
import { createClient } from "@/lib/supabase/server";
import type { DashboardMember } from "@/types/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join?redirect=/admin");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/");
  }

  const { data: dashboardData, error } = await supabase.rpc("get_admin_dashboard");

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-codewars-accent">
          ダッシュボードの読み込みに失敗しました: {error.message}
        </p>
      </div>
    );
  }

  const members = (dashboardData ?? []) as DashboardMember[];
  const totalProblems = getAllProblems().length;

  return (
    <div className="min-h-screen">
      <div className="border-b border-codewars-border bg-codewars-surface px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
            <p className="mt-2 text-sm text-codewars-muted">
              メンバーの学習進捗と正誤率の一覧です。行を展開すると問題別の詳細が表示されます。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-codewars-border px-4 py-2 text-sm text-codewars-muted transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
          >
            ホームに戻る
          </Link>
        </div>
      </div>

      <AdminDashboard members={members} totalProblems={totalProblems} />
    </div>
  );
}
