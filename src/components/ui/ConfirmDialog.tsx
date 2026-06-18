"use client";

import { useEffect, useId } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isConfirming, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-black/50"
        onClick={isConfirming ? undefined : onCancel}
        disabled={isConfirming}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative w-full max-w-md rounded-lg border border-codewars-border bg-codewars-surface p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold text-codewars-text">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-codewars-muted">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-md border border-codewars-border bg-codewars-bg px-4 py-2 text-sm text-codewars-muted transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="rounded-md bg-codewars-accent px-4 py-2 text-sm font-semibold text-white [html.dark_&]:text-codewars-bg transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
