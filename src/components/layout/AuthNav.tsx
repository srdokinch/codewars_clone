"use client";

import Link from "next/link";
import { useMemberAuth } from "@/hooks/useMemberAuth";

export default function AuthNav() {
  const { isLoggedIn, isAdmin, isLoading } = useMemberAuth();

  if (isLoading) return null;

  if (!isLoggedIn) {
    return (
      <Link
        href="/join"
        className="rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
      >
        ログイン
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {isAdmin && (
        <Link
          href="/admin"
          className="rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
        >
          管理者ダッシュボード
        </Link>
      )}
      <Link
        href="/join"
        className="rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
      >
        ログアウト
      </Link>
    </div>
  );
}
