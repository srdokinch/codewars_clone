"use client";

import Link from "next/link";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useMemberAuth } from "@/hooks/useMemberAuth";

const navButtonClassName =
  "rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text";

export default function AuthNav() {
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

  if (isLoading) return null;

  if (!isLoggedIn) {
    return (
      <Link href="/join" className={navButtonClassName}>
        ログイン
      </Link>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        {isAdmin && (
          <Link href="/admin" className={navButtonClassName}>
            管理者ダッシュボード
          </Link>
        )}
        <button
          type="button"
          onClick={() => setIsLogoutDialogOpen(true)}
          className={navButtonClassName}
        >
          ログアウト
        </button>
      </div>
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
