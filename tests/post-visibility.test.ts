import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import type { Post, Prisma } from "@prisma/client";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { GET as getPost } from "../src/app/api/posts/[id]/route";
import { GET as listPosts } from "../src/app/api/posts/route";
import { GET as checkAuth } from "../src/app/api/auth/check/route";
import { prisma } from "../src/lib/db";
import { middleware } from "../src/middleware";

const originalSecret = process.env.SESSION_SECRET;
const secret = randomBytes(32).toString("hex");
const published: Post & { tags: [] } = {
  id: "published-post",
  title: "Public article",
  slug: "public-article",
  excerpt: "Public summary",
  contentJson: { type: "doc", content: [] },
  coverUrl: null,
  images: [],
  category: "Daily",
  status: "PUBLISHED",
  publishedAt: new Date("2026-01-01"),
  startDate: null,
  endDate: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  tags: [],
};
const draft: typeof published = {
  ...published,
  id: "private-draft",
  title: "Private draft",
  slug: "private-draft",
  status: "DRAFT",
  publishedAt: null,
};
const posts = [published, draft];
const originalFindUnique = prisma.post.findUnique;
const originalFindMany = prisma.post.findMany;

before(() => {
  process.env.SESSION_SECRET = secret;
  // Model the persistence boundary so these tests exercise HTTP authorization
  // without requiring a running database or reading any real articles.
  prisma.post.findUnique = (async ({ where }: { where: Prisma.PostWhereUniqueInput }) =>
    posts.find((post) => post.id === where.id && (!where.status || post.status === where.status)) ?? null
  ) as unknown as typeof prisma.post.findUnique;
  prisma.post.findMany = (async ({ where }: { where?: Prisma.PostWhereInput }) =>
    posts.filter((post) => !where?.status || post.status === where.status)
  ) as unknown as typeof prisma.post.findMany;
});

after(() => {
  prisma.post.findUnique = originalFindUnique;
  prisma.post.findMany = originalFindMany;
  if (originalSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = originalSecret;
});

function request(path: string, token?: string, method = "GET") {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: token ? { cookie: `admin_session=${token}` } : {},
  });
}

async function token(role = "admin", expires = "1h") {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(new TextEncoder().encode(secret));
}

async function readPost(id: string, session?: string) {
  return getPost(request(`/api/posts/${id}`, session), { params: Promise.resolve({ id }) });
}

test("visitors can read a published article", async () => {
  const response = await readPost(published.id);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).title, published.title);
});

test("knowing a draft ID does not expose it to a visitor", async () => {
  const response = await readPost(draft.id);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Post not found" });
});

test("an authenticated admin can open a draft for editing", async () => {
  const response = await readPost(draft.id, await token());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).title, draft.title);
});

test("invalid, expired, and non-admin sessions cannot read drafts", async () => {
  for (const session of ["invalid-session", await token("admin", "0s"), await token("reader")]) {
    assert.equal((await readPost(draft.id, session)).status, 404);
  }
});

test("a missing article returns the same response as a private draft", async () => {
  const missing = await readPost("missing-post");
  const privatePost = await readPost(draft.id);
  assert.equal(missing.status, privatePost.status);
  assert.deepEqual(await missing.json(), await privatePost.json());
});

test("public lists contain published articles only", async () => {
  const response = await listPosts(request("/api/posts"));
  assert.deepEqual((await response.json()).map((post: Post) => post.id), [published.id]);
});

test("admin lists include drafts while non-admin sessions do not", async () => {
  const admin = await listPosts(request("/api/posts", await token()));
  assert.equal((await admin.json()).length, 2);
  const reader = await listPosts(request("/api/posts", await token("reader")));
  assert.equal((await reader.json()).length, 1);
});

test("authentication checks reject signed tokens without the admin role", async () => {
  const response = await checkAuth(request("/api/auth/check", await token("reader")));
  assert.deepEqual(await response.json(), { authenticated: false });
});

test("protected mutations reject non-admin sessions and accept admin sessions", async () => {
  const denied = await middleware(request("/api/posts/private-draft", await token("reader"), "PUT"));
  assert.equal(denied.status, 401);
  const allowed = await middleware(request("/api/posts/private-draft", await token(), "PUT"));
  assert.equal(allowed.headers.get("x-middleware-next"), "1");
});
