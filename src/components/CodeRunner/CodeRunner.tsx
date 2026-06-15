"use client";

import { useState } from "react";
import type { Problem, RunResult } from "@/types";
import { runCode } from "./runner";

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
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setResult(null);

    // UIの応答性のためわずかに遅延
    setTimeout(() => {
      const runResult = runCode(code, problem);
      setResult(runResult);
      setIsRunning(false);

      if (runResult.success) {
        onSuccess?.();
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="w-full rounded-md bg-codewars-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning ? "実行中..." : "実行する"}
      </button>

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
