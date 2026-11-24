import type { JSONContent } from "@tiptap/core";

export interface AdminPostSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { name: string }[];
}

export interface AdminPostData extends AdminPostSummary {
  excerpt: string;
  contentJson: JSONContent;
  coverUrl: string | null;
  images: string[];
  startDate: string | null;
  endDate: string | null;
}

export class AdminApiError extends Error {
  constructor(message: string, readonly status = 0) {
    super(message);
    this.name = "AdminApiError";
  }
}

export async function requestAdmin<T>(
  url: string,
  options: RequestInit = {},
  validate?: (value: unknown) => value is T
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 20_000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (response.status === 401) {
      throw new AdminApiError("로그인이 만료되었습니다. 다시 로그인해주세요.", 401);
    }
    if (response.status === 404) {
      throw new AdminApiError("게시글을 찾을 수 없습니다.", 404);
    }
    if (!response.ok) {
      throw new AdminApiError("요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.", response.status);
    }
    let data: unknown;
    try { data = await response.json(); }
    catch { throw new AdminApiError("서버 응답을 읽을 수 없습니다. 다시 시도해주세요.", 502); }
    if (validate && !validate(data)) {
      throw new AdminApiError("게시글 응답이 올바르지 않습니다. 다시 시도해주세요.", 502);
    }
    return data as T;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (timedOut) throw new AdminApiError("응답이 지연되고 있습니다. 다시 시도해주세요.", 408);
    if (error instanceof AdminApiError) throw error;
    throw new AdminApiError("네트워크 연결을 확인하고 다시 시도해주세요.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSummary(value: unknown): value is AdminPostSummary {
  if (!record(value)) return false;
  return ["id", "title", "slug", "category", "createdAt", "updatedAt"].every((key) => typeof value[key] === "string")
    && (value.status === "DRAFT" || value.status === "PUBLISHED")
    && (value.publishedAt === null || typeof value.publishedAt === "string")
    && Array.isArray(value.tags)
    && value.tags.every((tag: unknown) => record(tag) && typeof tag.name === "string");
}

export function isAdminPostList(value: unknown): value is AdminPostSummary[] {
  return Array.isArray(value) && value.every(isSummary);
}

export function isAdminPostData(value: unknown): value is AdminPostData {
  return isSummary(value) && record(value)
    && typeof value.excerpt === "string" && record(value.contentJson)
    && (value.coverUrl === null || typeof value.coverUrl === "string")
    && Array.isArray(value.images) && value.images.every((image: unknown) => typeof image === "string")
    && (value.startDate === null || typeof value.startDate === "string")
    && (value.endDate === null || typeof value.endDate === "string");
}
