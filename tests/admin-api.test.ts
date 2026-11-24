import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { AdminApiError, requestAdmin, isAdminPostList } from "../src/lib/admin-api";

afterEach(() => { mock.restoreAll(); mock.timers.reset(); });
const summary = { id: "fixture", title: "Title", slug: "title", category: "QA", status: "PUBLISHED", publishedAt: null, createdAt: "2026-01-01", updatedAt: "2026-01-01", tags: [{ name: "Testing" }] };

test("a valid admin list is accepted without parsing an error object as posts", async () => {
  mock.method(globalThis, "fetch", async () => Response.json([summary]));
  assert.deepEqual(await requestAdmin("/api/posts?scope=admin", {}, isAdminPostList), [summary]);
});

test("expired sessions produce a login recovery message", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ error: "Unauthorized" }, { status: 401 }));
  await assert.rejects(requestAdmin("/api/posts?scope=admin", {}, isAdminPostList), (error: unknown) => error instanceof AdminApiError && error.status === 401 && error.message.includes("다시 로그인"));
});

test("server outages remain recoverable API errors", async () => {
  mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  await assert.rejects(requestAdmin("/api/posts", {}, isAdminPostList), (error: unknown) => error instanceof AdminApiError && error.status === 503);
});

test("invalid response bodies cannot reach the list renderer", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ error: "Unexpected response" }));
  await assert.rejects(requestAdmin("/api/posts", {}, isAdminPostList), (error: unknown) => error instanceof AdminApiError && error.status === 502);
});

test("malformed JSON produces a retryable response error", async () => {
  mock.method(globalThis, "fetch", async () => new Response("not JSON", { status: 200 }));
  await assert.rejects(requestAdmin("/api/posts"), (error: unknown) => error instanceof AdminApiError && error.status === 502);
});

test("a network failure can be retried successfully", async () => {
  let calls = 0;
  mock.method(globalThis, "fetch", async () => {
    if (++calls === 1) throw new TypeError("Offline");
    return Response.json([summary]);
  });
  await assert.rejects(requestAdmin("/api/posts", {}, isAdminPostList), (error: unknown) => error instanceof AdminApiError && error.message.includes("네트워크"));
  assert.deepEqual(await requestAdmin("/api/posts", {}, isAdminPostList), [summary]);
});

test("cancelling a stale page request aborts the actual fetch", async () => {
  mock.method(globalThis, "fetch", async (_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const controller = new AbortController();
  const pending = requestAdmin("/api/posts", { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("a stalled request times out with a retry message rather than loading forever", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  mock.method(globalThis, "fetch", async (_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const pending = requestAdmin("/api/posts");
  mock.timers.tick(20_000);
  await assert.rejects(pending, (error: unknown) => error instanceof AdminApiError && error.status === 408 && error.message.includes("다시 시도"));
});
