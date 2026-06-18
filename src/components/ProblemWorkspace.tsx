"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Problem } from "@/types";
import CodeEditor from "@/components/editor/CodeEditor";
import CodeRunner from "@/components/CodeRunner/CodeRunner";
import HintPanel from "@/components/layout/HintPanel";
import PageHeader from "@/components/layout/PageHeader";
import LevelBadge from "@/components/ui/LevelBadge";
import {
  getProblemProgress,
  PROGRESS_CLEARED_EVENT,
  saveProblemProgress,
} from "@/lib/progress";

interface ProblemWorkspaceProps {
  problem: Problem;
  problems: Problem[];
}

export default function ProblemWorkspace({
  problem,
  problems,
}: ProblemWorkspaceProps) {
  const [code, setCode] = useState(problem.starterCode);
  const [isSolved, setIsSolved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentIndex = problems.findIndex((p) => p.id === problem.id);
  const nextProblem = problems[currentIndex + 1];

  useEffect(() => {
    const saved = getProblemProgress(problem.id);
    setCode(saved?.code ?? problem.starterCode);
    setIsSolved(saved?.isSolved ?? false);
    setIsLoaded(true);
  }, [problem.id, problem.starterCode]);

  useEffect(() => {
    if (!isLoaded) return;
    if (code === problem.starterCode && !isSolved) return;

    const timer = setTimeout(() => {
      saveProblemProgress(problem.id, { code });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (code !== problem.starterCode || isSolved) {
        saveProblemProgress(problem.id, {
          code,
          ...(isSolved ? { isSolved: true } : {}),
        });
      }
    };
  }, [code, problem.id, problem.starterCode, isSolved, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSolved) return;
    saveProblemProgress(problem.id, { isSolved: true, code });
  }, [isSolved, problem.id, isLoaded, code]);

  useEffect(() => {
    const handleProgressCleared = () => {
      setCode(problem.starterCode);
      setIsSolved(false);
    };

    window.addEventListener(PROGRESS_CLEARED_EVENT, handleProgressCleared);
    return () =>
      window.removeEventListener(PROGRESS_CLEARED_EVENT, handleProgressCleared);
  }, [problem.id, problem.starterCode]);

  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden">
        <PageHeader compact>
          <div className="flex items-center gap-3">
            <Link
              href={`/week/${problem.week}#${problem.id}`}
              scroll={false}
              className="text-sm text-codewars-muted hover:text-codewars-accent"
            >
              ← Week {problem.week}
            </Link>
            <span className="text-codewars-muted">/</span>
            <LevelBadge level={problem.level} />
            <h1 className="text-lg font-semibold">{problem.title}</h1>
          </div>
        </PageHeader>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
          <div className="mb-6 rounded-md border border-codewars-border bg-codewars-surface p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
              問題
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {problem.question}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-codewars-bg px-2 py-0.5 font-mono text-xs text-codewars-muted">
                {problem.type === "execution" ? "execution" : "test"}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
              コードエディタ
            </h2>
            <CodeEditor value={code} onChange={setCode} />
          </div>

          <CodeRunner
            problem={problem}
            code={code}
            onSuccess={() => setIsSolved(true)}
          />

          {isSolved && nextProblem && (
            <div className="mt-6 rounded-md border border-codewars-success/30 bg-codewars-success/5 p-4">
              <p className="mb-3 text-sm text-codewars-success">
                おめでとうございます！ 次の問題に進みましょう。
              </p>
              <Link
                href={`/week/${problem.week}/${nextProblem.id}`}
                className="inline-block rounded-md bg-codewars-success px-4 py-2 text-sm font-semibold text-codewars-bg transition-colors hover:brightness-95"
              >
                次の問題: {nextProblem.title} →
              </Link>
            </div>
          )}

          {isSolved && !nextProblem && (
            <div className="mt-6 rounded-md border border-codewars-success/30 bg-codewars-success/5 p-4">
              <p className="text-sm text-codewars-success">
                Week {problem.week} の全問題をクリアしました！
              </p>
              <Link
                href={`/week/${problem.week}`}
                className="mt-3 inline-block text-sm text-codewars-accent hover:underline"
              >
                Week {problem.week} に戻る
              </Link>
            </div>
          )}
        </div>
      </main>

      <HintPanel problem={problem} isSolved={isSolved} />
    </>
  );
}
