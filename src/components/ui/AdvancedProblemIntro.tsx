"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { getAdvancedSplashMessage } from "@/data/advancedSplashMessages";

const AUTO_DISMISS_MS = 14000;
const FADE_OUT_MS = 300;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface AdvancedProblemIntroProps {
  problemId: string;
  week: number;
  active: boolean;
}

export default function AdvancedProblemIntro({
  problemId,
  week,
  active,
}: AdvancedProblemIntroProps) {
  const titleId = useId();
  const bodyId = useId();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setDismissed(true), prefersReducedMotion() ? 0 : FADE_OUT_MS);
  }, []);

  useEffect(() => {
    setDismissed(false);
    setVisible(false);

    if (!active) return;

    if (prefersReducedMotion()) {
      setVisible(true);
      const dismissTimer = setTimeout(dismiss, AUTO_DISMISS_MS);
      return () => clearTimeout(dismissTimer);
    }

    const showTimer = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = setTimeout(dismiss, AUTO_DISMISS_MS);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [problemId, active, dismiss]);

  useEffect(() => {
    if (!active || dismissed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, dismissed, dismiss]);

  if (!active || dismissed) return null;

  const { title, body } = getAdvancedSplashMessage(week);
  const reducedMotion = prefersReducedMotion();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="閉じる"
        className={`absolute inset-0 bg-black/60 ${
          reducedMotion
            ? "opacity-100"
            : `transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`
        }`}
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={`relative w-full max-w-md rounded-lg border border-codewars-accent/40 bg-codewars-surface p-8 text-center shadow-lg ${
          reducedMotion
            ? "opacity-100"
            : `transition-all duration-300 ${
                visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`
        }`}
      >
        <p id={titleId} className="text-2xl font-bold text-codewars-accent">
          {title}
        </p>
        <p
          id={bodyId}
          className="mt-4 whitespace-pre-line text-sm leading-relaxed text-codewars-muted"
        >
          {body}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 rounded-md bg-codewars-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95 [html.dark_&]:text-codewars-bg"
        >
          いくぞ！
        </button>
      </div>
    </div>
  );
}
