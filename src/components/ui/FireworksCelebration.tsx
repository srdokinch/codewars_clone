"use client";

import { useEffect, useRef } from "react";
import { Fireworks } from "@fireworks-js/react";
import type { FireworksHandlers } from "@fireworks-js/react";

const DURATION_MS = 5000;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface FireworksCelebrationProps {
  active: boolean;
}

export default function FireworksCelebration({
  active,
}: FireworksCelebrationProps) {
  const fireworksRef = useRef<FireworksHandlers>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;

    const stopTimer = setTimeout(() => {
      fireworksRef.current?.stop();
    }, DURATION_MS);

    return () => {
      clearTimeout(stopTimer);
      fireworksRef.current?.stop();
    };
  }, [active]);

  if (!active || prefersReducedMotion()) return null;

  return (
    <Fireworks
      ref={fireworksRef}
      className="pointer-events-none fixed inset-0 z-50"
      options={{
        hue: { min: 0, max: 360 },
        delay: { min: 15, max: 30 },
        rocketsPoint: { min: 50, max: 50 },
        intensity: 30,
        friction: 0.97,
        gravity: 1.5,
        particles: 90,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 6,
        brightness: { min: 50, max: 80 },
        decay: { min: 0.015, max: 0.03 },
      }}
    />
  );
}
