import type { Problem, Week } from "@/types";
import weeksData from "@/data/weeks.json";
import week1Problems from "@/data/problems/week1.json";
import week2Problems from "@/data/problems/week2.json";
import week3Problems from "@/data/problems/week3.json";
import week4Problems from "@/data/problems/week4.json";

const problemsByWeek: Record<number, Problem[]> = {
  1: week1Problems as Problem[],
  2: week2Problems as Problem[],
  3: week3Problems as Problem[],
  4: week4Problems as Problem[],
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
