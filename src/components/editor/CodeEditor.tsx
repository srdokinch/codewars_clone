"use client";

import { useLayoutEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const INDENT = "  ";

const OPENING_PAIRS: Record<string, string> = {
  "(": ")",
  "{": "}",
  "[": "]",
  '"': '"',
  "'": "'",
  "`": "`",
};

const CLOSING_CHARS = new Set(Object.values(OPENING_PAIRS));

interface CodeContext {
  inSingle: boolean;
  inDouble: boolean;
  inTemplate: boolean;
  inLineComment: boolean;
  inBlockComment: boolean;
}

function getCodeContext(value: string, cursor: number): CodeContext {
  const context: CodeContext = {
    inSingle: false,
    inDouble: false,
    inTemplate: false,
    inLineComment: false,
    inBlockComment: false,
  };
  let escaped = false;

  for (let i = 0; i < cursor; i++) {
    const char = value[i];
    const next = value[i + 1];

    if (context.inLineComment) {
      if (char === "\n") context.inLineComment = false;
      continue;
    }

    if (context.inBlockComment) {
      if (char === "*" && next === "/") {
        context.inBlockComment = false;
        i++;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (
      char === "\\" &&
      (context.inSingle || context.inDouble || context.inTemplate)
    ) {
      escaped = true;
      continue;
    }

    if (context.inSingle) {
      if (char === "'") context.inSingle = false;
      continue;
    }
    if (context.inDouble) {
      if (char === '"') context.inDouble = false;
      continue;
    }
    if (context.inTemplate) {
      if (char === "`") context.inTemplate = false;
      continue;
    }

    if (char === "/" && next === "/") {
      context.inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && next === "*") {
      context.inBlockComment = true;
      i++;
      continue;
    }

    if (char === "'") context.inSingle = true;
    else if (char === '"') context.inDouble = true;
    else if (char === "`") context.inTemplate = true;
  }

  return context;
}

function isInsideStringOrComment(value: string, cursor: number): boolean {
  const context = getCodeContext(value, cursor);
  return (
    context.inSingle ||
    context.inDouble ||
    context.inTemplate ||
    context.inLineComment ||
    context.inBlockComment
  );
}

function isInComment(context: CodeContext): boolean {
  return context.inLineComment || context.inBlockComment;
}

function isInString(context: CodeContext): boolean {
  return context.inSingle || context.inDouble || context.inTemplate;
}

function getLineContext(value: string, cursor: number) {
  const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
  const lineEnd = value.indexOf("\n", cursor);
  const currentLine = value.slice(
    lineStart,
    lineEnd === -1 ? value.length : lineEnd
  );
  const indent = currentLine.match(/^(\s*)/)?.[1] ?? "";

  return { lineStart, currentLine, indent };
}

function getNextIndentOnEnter(currentLine: string, indent: string): string {
  const trimmedLine = currentLine.trimEnd();

  if (trimmedLine.endsWith("{")) {
    return indent + INDENT;
  }

  if (indent.length >= INDENT.length) {
    return indent.slice(INDENT.length);
  }

  return indent;
}

function getEnterInsertion(
  value: string,
  selectionStart: number,
  selectionEnd: number
): { insertion: string; cursorPosition: number } {
  if (selectionStart !== selectionEnd) {
    const { indent } = getLineContext(value, selectionStart);
    const insertion = `\n${indent}`;
    return { insertion, cursorPosition: selectionStart + 1 + indent.length };
  }

  const { currentLine, indent, lineStart } = getLineContext(value, selectionStart);
  const cursorInLine = selectionStart - lineStart;
  const beforeCursor = currentLine.slice(0, cursorInLine);
  const afterCursor = currentLine.slice(cursorInLine);

  // { } の間（自動補完直後）で Enter → ブロックを展開してインデント
  if (beforeCursor.endsWith("{") && afterCursor.startsWith("}")) {
    const innerIndent = indent + INDENT;
    const insertion = `\n${innerIndent}\n${indent}`;
    return {
      insertion,
      cursorPosition: selectionStart + 1 + innerIndent.length,
    };
  }

  const nextIndent = getNextIndentOnEnter(currentLine, indent);
  const insertion = `\n${nextIndent}`;
  return {
    insertion,
    cursorPosition: selectionStart + 1 + nextIndent.length,
  };
}

function setSelection(
  textarea: HTMLTextAreaElement,
  position: number,
  pendingSelectionRef: React.MutableRefObject<number | null>
) {
  pendingSelectionRef.current = position;
  textarea.selectionStart = position;
  textarea.selectionEnd = position;
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectionRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current === null || !textareaRef.current) return;

    const position = pendingSelectionRef.current;
    textareaRef.current.selectionStart = position;
    textareaRef.current.selectionEnd = position;
    pendingSelectionRef.current = null;
  }, [value]);

  const insertText = (
    textarea: HTMLTextAreaElement,
    start: number,
    end: number,
    insertion: string,
    cursorPosition?: number
  ) => {
    const nextValue = value.slice(0, start) + insertion + value.slice(end);
    const nextCursor = cursorPosition ?? start + insertion.length;
    pendingSelectionRef.current = nextCursor;
    onChange(nextValue);
    setSelection(textarea, nextCursor, pendingSelectionRef);
  };

  const handleAutoPair = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    textarea: HTMLTextAreaElement,
    selectionStart: number,
    selectionEnd: number
  ): boolean => {
    if (e.nativeEvent.isComposing) return false;

    const closingChar = OPENING_PAIRS[e.key];
    if (!closingChar) return false;

    const context = getCodeContext(value, selectionStart);
    const hasSelection = selectionStart !== selectionEnd;

    if (e.key === '"' || e.key === "'" || e.key === "`") {
      if (isInComment(context)) return false;

      const inSameQuote =
        (e.key === '"' && context.inDouble) ||
        (e.key === "'" && context.inSingle) ||
        (e.key === "`" && context.inTemplate);

      if (inSameQuote) {
        if (!hasSelection && value[selectionStart] === e.key) {
          e.preventDefault();
          setSelection(textarea, selectionStart + 1, pendingSelectionRef);
        }
        return true;
      }

      e.preventDefault();
      if (hasSelection) {
        const selected = value.slice(selectionStart, selectionEnd);
        insertText(
          textarea,
          selectionStart,
          selectionEnd,
          e.key + selected + e.key,
          selectionStart + 1
        );
      } else {
        insertText(textarea, selectionStart, selectionEnd, e.key + e.key, selectionStart + 1);
      }
      return true;
    }

    if (isInString(context) || isInComment(context)) return false;

    e.preventDefault();
    if (hasSelection) {
      const selected = value.slice(selectionStart, selectionEnd);
      insertText(
        textarea,
        selectionStart,
        selectionEnd,
        e.key + selected + closingChar,
        selectionStart + 1
      );
    } else {
      insertText(
        textarea,
        selectionStart,
        selectionEnd,
        e.key + closingChar,
        selectionStart + 1
      );
    }
    return true;
  };

  const handleSkipClosing = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    textarea: HTMLTextAreaElement,
    selectionStart: number,
    selectionEnd: number
  ): boolean => {
    if (e.nativeEvent.isComposing) return false;
    if (selectionStart !== selectionEnd) return false;
    if (!CLOSING_CHARS.has(e.key)) return false;
    if (value[selectionStart] !== e.key) return false;

    e.preventDefault();
    setSelection(textarea, selectionStart + 1, pendingSelectionRef);
    return true;
  };

  const handleDeletePair = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    textarea: HTMLTextAreaElement,
    selectionStart: number,
    selectionEnd: number
  ): boolean => {
    if (selectionStart !== selectionEnd || selectionStart === 0) return false;

    const before = value[selectionStart - 1];
    const after = value[selectionStart];

    for (const [open, close] of Object.entries(OPENING_PAIRS)) {
      if (before === open && after === close) {
        e.preventDefault();
        const nextValue =
          value.slice(0, selectionStart - 1) + value.slice(selectionStart + 1);
        const nextCursor = selectionStart - 1;
        pendingSelectionRef.current = nextCursor;
        onChange(nextValue);
        setSelection(textarea, nextCursor, pendingSelectionRef);
        return true;
      }
    }

    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    if (handleSkipClosing(e, textarea, selectionStart, selectionEnd)) return;

    if (e.key === "Backspace") {
      if (handleDeletePair(e, textarea, selectionStart, selectionEnd)) return;
      return;
    }

    if (handleAutoPair(e, textarea, selectionStart, selectionEnd)) return;

    if (e.key === "Tab") {
      if (e.nativeEvent.isComposing) return;
      if (isInsideStringOrComment(value, selectionStart)) return;
      e.preventDefault();
      insertText(textarea, selectionStart, selectionEnd, INDENT);
      return;
    }

    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing) return;
    if (isInsideStringOrComment(value, selectionStart)) return;

    const { insertion, cursorPosition } = getEnterInsertion(
      value,
      selectionStart,
      selectionEnd
    );

    e.preventDefault();
    insertText(textarea, selectionStart, selectionEnd, insertion, cursorPosition);
  };

  return (
    <div className="relative overflow-hidden rounded-md border border-codewars-border bg-[#0d1117]">
      <div className="flex items-center gap-1.5 border-b border-codewars-border px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-codewars-muted">solution.js</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        className="h-64 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-codewars-text outline-none scrollbar-thin"
        style={{ tabSize: 2 }}
      />
    </div>
  );
}
