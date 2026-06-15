"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="relative overflow-hidden rounded-md border border-codewars-border bg-[#0d1117]">
      <div className="flex items-center gap-1.5 border-b border-codewars-border px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-codewars-muted">solution.js</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        className="h-64 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-codewars-text outline-none scrollbar-thin"
        style={{ tabSize: 2 }}
      />
    </div>
  );
}
