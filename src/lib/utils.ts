import { clsx, type ClassValue } from "clsx";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateSlug(title: string): string {
  const slug = slugify(title, { lower: true, strict: true, locale: "ko" });
  // slugify strips CJK characters — fallback to timestamp-based slug
  if (!slug) {
    return `post-${Date.now().toString(36)}`;
  }
  return slug;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
