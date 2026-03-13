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

export function formatDateRange(start?: Date | string | null, end?: Date | string | null): string {
  if (!start) return "";
  const fmt = (d: Date | string) => {
    const date = new Date(d);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${m}/${day}`;
  };
  if (!end) return fmt(start);
  return `${fmt(start)} - ${fmt(end)}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
