import type { CatalogFilters, Course } from "./types";

/**
 * Pure filter + sort, matching the POC behaviour.
 * Step 2 replaces this with database queries; keep the same CatalogFilters shape.
 */
export function filterCourses(courses: Course[], f: CatalogFilters, saved: number[]): Course[] {
  const q = f.query.toLowerCase().trim();

  const list = courses.filter((c) => {
    if (f.savedOnly && !saved.includes(c.id)) return false;
    if (f.category !== "All topics" && c.category !== f.category) return false;
    if (q && ![c.title, c.category, c.trainer, ...c.tags].join(" ").toLowerCase().includes(q)) return false;
    if (f.formats.length && !f.formats.includes(c.format)) return false;
    if (f.grade && !c.grades.includes(f.grade)) return false;
    if (f.duration === "short" && c.hours > 2) return false;
    if (f.duration === "long" && c.hours <= 2) return false;
    if (f.maxPrice !== null && c.price >= f.maxPrice) return false;
    return true;
  });

  if (f.sort === "low") list.sort((a, b) => a.price - b.price);
  if (f.sort === "high") list.sort((a, b) => b.price - a.price);
  if (f.sort === "duration") list.sort((a, b) => a.hours - b.hours);
  return list;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}
