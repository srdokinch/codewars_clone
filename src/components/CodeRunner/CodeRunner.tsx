"use client";

import { useState } from "react";
import type { PreviewResult, Problem, RunResult } from "@/types";
import { getProblemProgress, saveProblemProgress } from "@/lib/progress";
import { recordRunResult } from "@/lib/progress-sync";
import ConsolePanel from "./ConsolePanel";
import { runCode, runPreviewCode } from "./runner";

interface CodeRunnerProps {
  problem: Problem;
  code: string;
  onSuccess?: () => void;
}

export default function CodeRunner({
  problem,
  code,
  onSuccess,
}: CodeRunnerProps) {
  const [result, setResult] = useState<RunResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = () => {
    setIsPreviewing(true);
    setPreview(null);

    setTimeout(() => {
      const previewResult = runPreviewCode(code, problem);
      setPreview(previewResult);
      setIsPreviewing(false);
    }, 100);
  };

  const handleRun = () => {
    setIsRunning(true);
    setResult(null);

    setTimeout(async () => {
      const runResult = await runCode(code, problem);
      setResult(runResult);
      setIsRunning(false);

      const hintsRevealed =
        getProblemProgress(problem.id)?.hintsRevealed ?? 0;
      saveProblemProgress(problem.id, { hasAttempted: true });
      void recordRunResult(problem.id, runResult, hintsRevealed);

      if (runResult.success) {
        onSuccess?.();
      }
    }, 100);
  };

  const isBusy = isRunning || isPreviewing;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isBusy}
          className="flex-1 rounded-md border border-codewars-border bg-codewars-surface px-6 py-3 font-semibold text-codewars-text transition-colors hover:bg-codewars-panel/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPreviewing ? "確認中..." : "確認実行"}
        </button>
        <button
          type="button"
          onClick={handleRun}
          disabled={isBusy}
          className="flex-1 rounded-md bg-codewars-accent px-6 py-3 font-semibold text-white [html.dark_&]:text-codewars-bg transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "実行中..." : "実行する"}
        </button>
      </div>

      <ConsolePanel preview={preview} />

      {result && (
        <div
          className={`rounded-md border p-4 ${
            result.success
              ? "border-codewars-success/50 bg-codewars-success/10"
              : "border-codewars-accent/50 bg-codewars-accent/10"
          }`}
        >
          <p
            className={`text-lg font-bold ${
              result.success ? "text-codewars-success" : "text-codewars-accent"
            }`}
          >
            {result.message}
          </p>

          {result.error && (
            <p className="mt-2 font-mono text-sm text-codewars-accent">
              {result.error}
            </p>
          )}

          {result.details && result.details.length > 0 && (
            <ul className="mt-3 space-y-1">
              {result.details.map((detail, i) => (
                <li
                  key={i}
                  className="font-mono text-sm text-codewars-muted"
                >
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
