"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useMemberAuth } from "@/hooks/useMemberAuth";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { isLoggedIn, isAdmin, isLoading, logout, refresh } = useMemberAuth();

  const [code, setCode] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          displayName: needsDisplayName ? displayNameInput : undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        needsDisplayName?: boolean;
      };

      if (!response.ok) {
        if (data.needsDisplayName) {
          setNeedsDisplayName(true);
        }
        setError(data.error ?? "ログインに失敗しました");
        return;
      }

      await refresh();
      window.location.assign(redirect);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    await logout();
    router.push("/");
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader compact>
          <h1 className="text-lg font-semibold">ログイン</h1>
        </PageHeader>
        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center text-codewars-muted">
          読み込み中...
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen">
        <PageHeader compact>
          <h1 className="text-lg font-semibold">ログアウト</h1>
        </PageHeader>
        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-codewars-border bg-codewars-surface p-8 shadow-sm">
            <h1 className="text-2xl font-bold">ログアウト</h1>
            <p className="mt-2 text-sm text-codewars-muted">ログイン中です。</p>

            <div className="mt-6 space-y-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block w-full rounded-md border border-codewars-border bg-codewars-bg px-4 py-2 text-center text-sm text-codewars-muted transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
                >
                  管理者ダッシュボードへ
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
                className="w-full rounded-md bg-codewars-accent px-4 py-2 font-semibold text-white [html.dark_&]:text-codewars-bg transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "ログアウト中..." : "ログアウト"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-codewars-muted">
              <Link href="/" className="hover:text-codewars-text">
                ← ホームに戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader compact>
        <h1 className="text-lg font-semibold">ログイン</h1>
      </PageHeader>
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-codewars-border bg-codewars-surface p-8 shadow-sm">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="mt-2 text-sm text-codewars-muted">
            管理者から配布された招待コードを入力してください。
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="code" className="mb-1 block text-sm font-medium">
                招待コード
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="DOJO-XXXX-XXXX-XXXX"
                className="w-full rounded-md border border-codewars-border bg-codewars-bg px-3 py-2 font-mono text-sm text-codewars-text placeholder:text-codewars-muted focus:border-codewars-accent focus:outline-none"
                required
                autoComplete="off"
              />
            </div>

            {needsDisplayName && (
              <div>
                <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
                  表示名（初回のみ）
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="たろう"
                  maxLength={32}
                  className="w-full rounded-md border border-codewars-border bg-codewars-bg px-3 py-2 text-sm text-codewars-text placeholder:text-codewars-muted focus:border-codewars-accent focus:outline-none"
                  required
                />
                <p className="mt-1 text-xs text-codewars-muted">
                  ダッシュボードに表示される仮名です。本名の入力は不要です。
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-md border border-codewars-accent/50 bg-codewars-accent/10 px-3 py-2 text-sm text-codewars-accent">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-codewars-accent px-4 py-2 font-semibold text-white [html.dark_&]:text-codewars-bg transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "確認中..." : needsDisplayName ? "登録してログイン" : "ログイン"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-codewars-muted">
            <Link href="/" className="hover:text-codewars-text">
              ← ホームに戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <PageHeader compact>
            <h1 className="text-lg font-semibold">ログイン</h1>
          </PageHeader>
          <div className="flex min-h-[calc(100vh-57px)] items-center justify-center text-codewars-muted">
            読み込み中...
          </div>
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
