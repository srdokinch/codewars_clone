"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMemberAuth } from "@/hooks/useMemberAuth";
import {
  fetchProblemMemo,
  PROBLEM_MEMO_MAX_LENGTH,
  saveProblemMemo,
} from "@/lib/problem-memo";
import { getProblemProgress, PROGRESS_CLEARED_EVENT, saveProblemProgress } from "@/lib/progress";

interface ProblemMemoSectionProps {
  problemId: string;
}

export default function ProblemMemoSection({
  problemId,
}: ProblemMemoSectionProps) {
  const { isLoggedIn, isLoading: isAuthLoading } = useMemberAuth();
  const [memo, setMemo] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const localMemo = getProblemProgress(problemId)?.memo ?? "";
      if (!cancelled) {
        setMemo(localMemo);
      }

      if (isAuthLoading) {
        return;
      }

      if (!isLoggedIn) {
        if (!cancelled) {
          setIsLoaded(true);
        }
        return;
      }

      const remote = await fetchProblemMemo(problemId);
      if (cancelled || !remote) {
        if (!cancelled) {
          setIsLoaded(true);
        }
        return;
      }

      skipNextSaveRef.current = true;
      if (remote.memo || !localMemo) {
        setMemo(remote.memo);
        saveProblemProgress(problemId, { memo: remote.memo });
      } else {
        void saveProblemMemo(problemId, localMemo);
      }
      setIsLoaded(true);
    };

    setIsLoaded(false);
    setSaveStatus("idle");
    setSaveError(null);
    void load();

    return () => {
      cancelled = true;
    };
  }, [problemId, isLoggedIn, isAuthLoading]);

  useEffect(() => {
    const handleProgressCleared = () => {
      skipNextSaveRef.current = true;
      setMemo("");
      setSaveStatus("idle");
      setSaveError(null);
    };

    window.addEventListener(PROGRESS_CLEARED_EVENT, handleProgressCleared);
    return () =>
      window.removeEventListener(PROGRESS_CLEARED_EVENT, handleProgressCleared);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    saveProblemProgress(problemId, { memo });

    if (!isLoggedIn) {
      setSaveStatus("idle");
      setSaveError(null);
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    const timer = setTimeout(async () => {
      const result = await saveProblemMemo(problemId, memo);
      if (!result.success) {
        setSaveStatus("error");
        setSaveError(result.error ?? "保存に失敗しました");
        return;
      }
      setSaveStatus("saved");
    }, 300);

    return () => {
      clearTimeout(timer);
      if (isLoggedIn) {
        void saveProblemMemo(problemId, memo);
      }
    };
  }, [memo, problemId, isLoaded, isLoggedIn]);

  const statusLabel = (() => {
    if (!isLoaded || isAuthLoading) return null;
    if (!isLoggedIn) return "端末に保存（クラウド保存はログイン後）";
    if (saveStatus === "saving") return "保存中…";
    if (saveStatus === "saved") return "保存済み";
    if (saveStatus === "error") return saveError ?? "保存に失敗しました";
    return null;
  })();

  return (
    <section className="border-b border-codewars-border pb-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-codewars-accent">
          メモ
        </h3>
        {statusLabel && (
          <span
            className={`text-right text-xs ${
              saveStatus === "error"
                ? "text-codewars-warning"
                : "text-codewars-muted"
            }`}
          >
            {statusLabel}
          </span>
        )}
      </div>
      <textarea
        value={memo}
        onChange={(e) => {
          setMemo(e.target.value.slice(0, PROBLEM_MEMO_MAX_LENGTH));
          setSaveStatus("idle");
        }}
        placeholder="この問題で学んだこと、気づいたことなどを自由に書いてください"
        rows={5}
        className="w-full resize-y rounded-md border border-codewars-border bg-codewars-bg/50 p-3 text-sm leading-relaxed text-codewars-text outline-none transition-colors placeholder:text-codewars-disabled focus:border-codewars-accent/50"
      />
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-codewars-muted">
        <span>
          {memo.length}/{PROBLEM_MEMO_MAX_LENGTH}
        </span>
        {!isAuthLoading && !isLoggedIn && (
          <Link href="/join" className="text-codewars-accent hover:underline">
            ログインしてクラウドに保存
          </Link>
        )}
      </div>
    </section>
  );
}
