import type { Problem, Week } from "@/types";
import weeksData from "@/data/weeks.json";
import week1Problems from "@/data/problems/week1.json";
import week2Problems from "@/data/problems/week2.json";
import week3Problems from "@/data/problems/week3.json";
import week4Problems from "@/data/problems/week4.json";
import week5Problems from "@/data/problems/week5.json";
import week6Problems from "@/data/problems/week6.json";
import week7Problems from "@/data/problems/week7.json";
import week8Problems from "@/data/problems/week8.json";
import week9Problems from "@/data/problems/week9.json";

const problemsByWeek: Record<number, Problem[]> = {
  1: week1Problems as Problem[],
  2: week2Problems as Problem[],
  3: week3Problems as Problem[],
  4: week4Problems as Problem[],
  5: week5Problems as Problem[],
  6: week6Problems as Problem[],
  7: week7Problems as Problem[],
  8: week8Problems as Problem[],
  9: week9Problems as Problem[],
};

export function getWeeks(): Week[] {
  return weeksData as Week[];
}

export function getWeek(weekId: number): Week | undefined {
  return getWeeks().find((w) => w.id === weekId);
}

export function getProblemsByWeek(weekId: number): Problem[] {
  return problemsByWeek[weekId] ?? [];
}

export function getAllProblems(): Problem[] {
  return Object.values(problemsByWeek).flat();
}

export function getProblem(problemId: string): Problem | undefined {
  return getAllProblems().find((p) => p.id === problemId);
}

export function getAvailableWeeks(): number[] {
  return Object.keys(problemsByWeek)
    .map(Number)
    .sort((a, b) => a - b);
}

export function hasProblems(weekId: number): boolean {
  return weekId in problemsByWeek && problemsByWeek[weekId].length > 0;
}

export function groupProblemsBySection(
  problems: Problem[]
): { label: string; problems: Problem[] }[] {
  const groups: { label: string; problems: Problem[] }[] = [];
  const indexByLabel = new Map<string, number>();

  for (const problem of problems) {
    const label = problem.section ?? "基本問題";
    if (!indexByLabel.has(label)) {
      indexByLabel.set(label, groups.length);
      groups.push({ label, problems: [] });
    }
    groups[indexByLabel.get(label)!].problems.push(problem);
  }

  return groups;
}
