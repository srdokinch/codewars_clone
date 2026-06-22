"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useMemberAuth } from "@/hooks/useMemberAuth";

function navItemClass(active: boolean): string {
  return `flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
    active
      ? "bg-codewars-panel text-codewars-accent"
      : "text-codewars-muted hover:bg-codewars-panel/50 hover:text-codewars-text"
  }`;
}

export default function SidebarFooter() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, isLoading, logout } = useMemberAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutDialogOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <footer className="shrink-0 border-t border-codewars-border p-2">
        <p className="px-3 py-2 text-sm text-codewars-muted">読み込み中...</p>
      </footer>
    );
  }

  return (
    <>
      <footer className="shrink-0 border-t border-codewars-border p-2">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
          Menu
        </p>
        <ul className="space-y-0.5">
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={navItemClass(pathname === "/admin")}
              >
                管理者ダッシュボード
              </Link>
            </li>
          )}
          <li>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(true)}
                className={navItemClass(false)}
              >
                ログアウト
              </button>
            ) : (
              <Link href="/join" className={navItemClass(pathname === "/join")}>
                ログイン
              </Link>
            )}
          </li>
          <li>
            <Link
              href="/settings"
              className={navItemClass(pathname === "/settings")}
            >
              設定
            </Link>
          </li>
        </ul>
      </footer>
      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="ログアウト"
        message="ログアウトしますか？"
        confirmLabel={isLoggingOut ? "ログアウト中..." : "ログアウト"}
        cancelLabel="キャンセル"
        isConfirming={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
