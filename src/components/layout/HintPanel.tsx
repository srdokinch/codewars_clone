"use client";

import { useState } from "react";
import type { Problem } from "@/types";

interface HintPanelProps {
  problem: Problem;
  isSolved: boolean;
}

export default function HintPanel({ problem, isSolved }: HintPanelProps) {
  const [revealedHints, setRevealedHints] = useState<number>(0);

  const revealNextHint = () => {
    if (revealedHints < problem.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-codewars-border bg-codewars-surface">
      <div className="border-b border-codewars-border p-4">
        <h2 className="text-sm font-semibold text-codewars-text">ヒント & 解説</h2>
      </div>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-codewars-warning">
            ヒント
          </h3>
          <div className="space-y-2">
            {problem.hints.slice(0, revealedHints).map((hint, i) => (
              <div
                key={i}
                className="rounded-md border border-codewars-border bg-codewars-bg/50 p-3 text-sm text-codewars-muted"
              >
                <span className="mr-2 font-mono text-xs text-codewars-warning">
                  #{i + 1}
                </span>
                {hint}
              </div>
            ))}

            {revealedHints < problem.hints.length && (
              <button
                onClick={revealNextHint}
                className="w-full rounded-md border border-dashed border-codewars-border px-3 py-2 text-sm text-codewars-muted transition-colors hover:border-codewars-warning hover:text-codewars-warning"
              >
                ヒントを表示 ({revealedHints}/{problem.hints.length})
              </button>
            )}
          </div>
        </section>

        {isSolved && (
          <>
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-codewars-success">
                模範回答
              </h3>
              <pre className="overflow-x-auto rounded-md border border-codewars-border bg-codewars-editor p-3 font-mono text-xs leading-relaxed text-codewars-success">
                {problem.answer}
              </pre>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-codewars-accent">
                解説
              </h3>
              <p className="text-sm leading-relaxed text-codewars-muted">
                {problem.explanation}
              </p>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-codewars-text">
                学習ポイント
              </h3>
              <ul className="space-y-2">
                {problem.learningPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-codewars-muted"
                  >
                    <span className="mt-1 text-codewars-success">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {!isSolved && (
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
              解説
            </h3>
            <p className="text-sm italic text-codewars-disabled">
              正解すると解説が表示されます
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}
