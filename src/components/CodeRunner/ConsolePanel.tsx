import type { PreviewResult } from "@/types";

interface ConsolePanelProps {
  preview: PreviewResult | null;
}

export default function ConsolePanel({ preview }: ConsolePanelProps) {
  const hasOutput = preview && preview.consoleOutput.length > 0;
  const hasError = preview?.error;

  return (
    <div className="rounded-md border border-codewars-border bg-codewars-editor">
      <div className="border-b border-codewars-border px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-codewars-muted">
          Console
        </span>
      </div>
      <div className="min-h-[4.5rem] p-4 font-mono text-sm leading-relaxed">
        {!preview && (
          <p className="text-codewars-muted">
            「確認実行」で console.log の出力をここに表示できます
          </p>
        )}
        {preview && !hasOutput && !hasError && (
          <p className="text-codewars-muted">（出力なし）</p>
        )}
        {hasOutput && (
          <ul className="space-y-1 text-codewars-text">
            {preview.consoleOutput.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
        {hasError && (
          <p className={hasOutput ? "mt-2 text-codewars-accent" : "text-codewars-accent"}>
            {preview.error}
          </p>
        )}
      </div>
    </div>
  );
}
