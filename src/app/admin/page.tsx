import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllProblems } from "@/lib/problems";
import { createClient } from "@/lib/supabase/server";

interface DashboardMember {
  id: string;
  display_name: string;
  role: string;
  created_at: string;
  total_attempts: number;
  total_successes: number;
  solved_count: number;
  last_activity_at: string | null;
}

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
              メンバーの学習進捗と正誤率の一覧です。
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

      <div className="overflow-x-auto p-8">
        {members.length === 0 ? (
          <p className="text-codewars-muted">まだメンバーのデータがありません。</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-codewars-border text-codewars-muted">
                <th className="px-4 py-3 font-medium">表示名</th>
                <th className="px-4 py-3 font-medium">クリア数</th>
                <th className="px-4 py-3 font-medium">正誤率</th>
                <th className="px-4 py-3 font-medium">試行回数</th>
                <th className="px-4 py-3 font-medium">最終活動</th>
                <th className="px-4 py-3 font-medium">ロール</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const accuracy =
                  m.total_attempts > 0
                    ? Math.round((m.total_successes / m.total_attempts) * 100)
                    : null;

                return (
                  <tr
                    key={m.id}
                    className="border-b border-codewars-border/50 hover:bg-codewars-surface/50"
                  >
                    <td className="px-4 py-3 font-medium">{m.display_name}</td>
                    <td className="px-4 py-3 font-mono">
                      {m.solved_count} / {totalProblems}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {accuracy !== null ? `${accuracy}%` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono">{m.total_attempts}</td>
                    <td className="px-4 py-3 text-codewars-muted">
                      {m.last_activity_at
                        ? new Date(m.last_activity_at).toLocaleString("ja-JP")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          m.role === "admin"
                            ? "bg-codewars-accent/20 text-codewars-accent"
                            : "bg-codewars-border text-codewars-muted"
                        }`}
                      >
                        {m.role === "admin" ? "管理者" : "メンバー"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
