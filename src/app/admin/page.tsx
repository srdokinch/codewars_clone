import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import PageHeader from "@/components/layout/PageHeader";
import WeekSidebar from "@/components/layout/WeekSidebar";
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
    <div className="flex min-h-screen">
      <WeekSidebar />

      <main className="flex-1 overflow-y-auto">
        <PageHeader
          actions={
            <Link
              href="/"
              className="rounded-md border border-codewars-border px-4 py-2 text-sm text-codewars-muted transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
            >
              ホームに戻る
            </Link>
          }
        >
          <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
          <p className="mt-2 text-sm text-codewars-muted">
            メンバーの学習進捗と正誤率の一覧です。行を展開すると問題別の詳細が表示されます。
          </p>
        </PageHeader>

        <AdminDashboard members={members} totalProblems={totalProblems} />
      </main>
    </div>
  );
}
