import "./dom-setup";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import type { NextRouter } from "next/router";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { ThemeProvider } from "../src/components/ui/theme-provider";
import { ToastProvider } from "../src/components/ui/toast";
import { NavigationGuardProvider, GuardedLink } from "../src/components/ui/navigation-guard";
import PostForm from "../src/components/editor/post-form";
import AdminPostsPage from "../src/app/admin/posts/page";
import EditPostPage from "../src/app/admin/posts/[id]/edit/page";
import AdminNav from "../src/components/ui/admin-nav";

afterEach(() => { cleanup(); mock.restoreAll(); window.localStorage.clear(); });

const fixture = {
  id: "fixture", title: "Original title", slug: "permanent-url", excerpt: "Saved summary",
  contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Saved body" }] }] },
  coverUrl: null, images: [], category: "QA", status: "PUBLISHED" as const,
  tags: [], startDate: null, endDate: null, publishedAt: "2026-01-01T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};

function mount(children: ReactNode) {
  const router = { push: mock.fn(async () => true), replace: mock.fn(async () => true), refresh: mock.fn(), prefetch: async () => {}, back() {}, forward() {}, pathname: "/admin/posts/fixture/edit", asPath: "/admin/posts/fixture/edit", route: "/admin/posts/[id]/edit", query: {}, isReady: true, isFallback: false };
  render(<AppRouterContext.Provider value={router as unknown as AppRouterInstance}><RouterContext.Provider value={router as unknown as NextRouter}>
    <ThemeProvider><ToastProvider><NavigationGuardProvider>{children}</NavigationGuardProvider></ToastProvider></ThemeProvider>
  </RouterContext.Provider></AppRouterContext.Provider>);
  return router;
}

function reloadEvent() {
  const event = new window.Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

test("a dirty form blocks internal navigation, cancellation preserves input, and clean forms can leave", async () => {
  const confirm = mock.method(window, "confirm", () => false);
  const router = mount(<><GuardedLink prefetch={false} href="/admin/posts">Leave editor</GuardedLink><PostForm initialData={fixture} /></>);
  const title = screen.getByPlaceholderText("게시글 제목을 입력하세요");
  assert.equal(reloadEvent().defaultPrevented, false);
  fireEvent.change(title, { target: { value: "Unsaved title" } });
  assert.equal(reloadEvent().defaultPrevented, true);
  fireEvent.click(screen.getByRole("link", { name: "Leave editor" }));
  assert.equal(confirm.mock.callCount(), 1);
  assert.equal(router.push.mock.callCount(), 0);
  assert.equal((title as HTMLInputElement).value, "Unsaved title");
  confirm.mock.mockImplementation(() => true);
  fireEvent.click(screen.getByRole("link", { name: "Leave editor" }));
  await waitFor(() => assert.equal(router.push.mock.callCount(), 1));
  assert.equal(confirm.mock.callCount(), 2);
  fireEvent.change(title, { target: { value: fixture.title } });
  assert.equal(reloadEvent().defaultPrevented, false);
  fireEvent.click(screen.getByRole("link", { name: "Leave editor" }));
  assert.equal(confirm.mock.callCount(), 2);
  await waitFor(() => assert.equal(router.push.mock.callCount(), 2));
});

test("cancelling logout leaves the session and unsaved form untouched", async () => {
  mock.method(window, "confirm", () => false);
  const fetch = mock.method(globalThis, "fetch", async () => Response.json({ success: true }));
  mount(<><AdminNav /><PostForm initialData={fixture} /></>);
  const title = screen.getByPlaceholderText("게시글 제목을 입력하세요");
  fireEvent.change(title, { target: { value: "Keep my work" } });
  fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal((title as HTMLInputElement).value, "Keep my work");
});

test("edits made during a save remain dirty after the earlier save completes", async () => {
  let finish!: (response: Response) => void;
  mock.method(globalThis, "fetch", async () => new Promise<Response>((resolve) => { finish = resolve; }));
  const router = mount(<PostForm initialData={fixture} />);
  const title = screen.getByPlaceholderText("게시글 제목을 입력하세요");
  fireEvent.change(title, { target: { value: "Submitted title" } });
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  fireEvent.change(title, { target: { value: "Newer unsaved title" } });
  await act(async () => finish(Response.json({ ...fixture, title: "Submitted title" })));
  assert.ok(screen.getByText("변경사항 있음"));
  assert.equal(reloadEvent().defaultPrevented, true);
  assert.equal((title as HTMLInputElement).value, "Newer unsaved title");
  assert.equal(router.push.mock.callCount(), 0);
  assert.ok(screen.getByText(/방금 추가한 변경사항/));
});

test("successful saves clear the warning only for the content that was saved", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => Response.json(fixture));
  mount(<PostForm initialData={fixture} />);
  fireEvent.change(screen.getByPlaceholderText("게시글 제목을 입력하세요"), { target: { value: "Changed title" } });
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  await screen.findByText("저장되었습니다.");
  assert.equal(reloadEvent().defaultPrevented, false);
  assert.equal(screen.queryByText("변경사항 있음"), null);
  const body = JSON.parse(String((fetch.mock.calls[0].arguments[1] as RequestInit).body));
  assert.equal(body.title, "Changed title");
  assert.equal(body.status, undefined);
});

test("a failed admin list stops loading, shows recovery UI, and retry loads the actual table", async () => {
  let attempts = 0;
  mock.method(globalThis, "fetch", async () => ++attempts === 1
    ? Response.json({ error: "Temporary failure" }, { status: 503 }) : Response.json([fixture]));
  mount(<AdminPostsPage />);
  await screen.findByRole("alert");
  assert.equal(screen.queryByText("로딩 중..."), null);
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  await screen.findByRole("link", { name: fixture.title });
  assert.equal(screen.queryByRole("alert"), null);
  assert.equal(attempts, 2);
});

test("an expired admin list session offers login recovery instead of rendering an error as posts", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ error: "Unauthorized" }, { status: 401 }));
  mount(<AdminPostsPage />);
  const link = await screen.findByRole("link", { name: "다시 로그인" });
  assert.equal(link.getAttribute("href"), "/admin/login");
  assert.equal(screen.queryByText("로딩 중..."), null);
});

test("a failed deletion keeps the post and restores the delete button", async () => {
  mock.method(window, "confirm", () => true);
  mock.method(globalThis, "fetch", async (_url: string, options?: RequestInit) => options?.method === "DELETE"
    ? Response.json({ error: "Unavailable" }, { status: 503 }) : Response.json([fixture]));
  mount(<AdminPostsPage />);
  await screen.findByRole("link", { name: fixture.title });
  fireEvent.click(screen.getByRole("button", { name: "삭제" }));
  await screen.findByText(/요청을 처리하지 못했습니다/);
  assert.ok(screen.getByRole("link", { name: fixture.title }));
  assert.equal((screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement).disabled, false);
});

test("the edit page can retry a failed load and opens the correct post form", async () => {
  let attempts = 0;
  mock.method(globalThis, "fetch", async () => ++attempts === 1
    ? Response.json({ error: "Unavailable" }, { status: 503 }) : Response.json(fixture));
  mount(<PathParamsContext.Provider value={{ id: fixture.id }}><EditPostPage /></PathParamsContext.Provider>);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  const title = await screen.findByPlaceholderText("게시글 제목을 입력하세요");
  assert.equal((title as HTMLInputElement).value, fixture.title);
  assert.equal(screen.queryByRole("alert"), null);
});
