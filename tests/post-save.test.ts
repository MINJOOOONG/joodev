import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { after, before, beforeEach, mock, test } from "node:test";
import type { Post, Prisma } from "@prisma/client";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { PUT, DELETE } from "../src/app/api/posts/[id]/route";
import { POST } from "../src/app/api/posts/route";
import { prisma } from "../src/lib/db";

const require = createRequire(import.meta.url);
const originalSecret = process.env.SESSION_SECRET;
const secret = randomBytes(32).toString("hex");
const original = { find: prisma.post.findUnique, transaction: prisma.$transaction };
const publishedAt = new Date("2026-01-01T00:00:00Z");
const initial: Post = {
  id: "save-test-post", title: "Original", slug: "original", excerpt: "Summary",
  contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Original body" }] }] },
  coverUrl: null, images: [], category: "Backend", status: "PUBLISHED", publishedAt,
  startDate: null, endDate: null, createdAt: publishedAt, updatedAt: publishedAt,
};
let stored: Post;
let storedTags: string[];

before(() => {
  process.env.SESSION_SECRET = secret;
  mock.method(require("next/cache"), "revalidatePath", () => {});
  prisma.post.findUnique = (async () => structuredClone(stored)) as unknown as typeof prisma.post.findUnique;
  // Only model persistence. Validation, status/date decisions, authorization
  // and the transaction are exercised through the real route handler.
  prisma.$transaction = (async (work: (tx: Prisma.TransactionClient) => Promise<unknown>) => work({
    tag: { deleteMany: async () => { storedTags = []; return { count: 1 }; } },
    post: { update: async ({ data }: { data: Prisma.PostUpdateInput }) => {
      for (const [key, value] of Object.entries(data)) {
        if (key !== "tags" && value !== undefined) Object.assign(stored, { [key]: value });
      }
      if (data.tags) storedTags = (data.tags.create as { name: string }[]).map((tag) => tag.name);
      return { ...stored, tags: storedTags.map((name) => ({ name })) };
    } },
  } as unknown as Prisma.TransactionClient)) as unknown as typeof prisma.$transaction;
});

beforeEach(() => { stored = structuredClone(initial); storedTags = ["existing-tag"]; });
after(() => {
  prisma.post.findUnique = original.find;
  prisma.$transaction = original.transaction;
  mock.restoreAll();
  if (originalSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = originalSecret;
});

async function request(body: object, role = "admin", method = "PUT") {
  const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h").sign(new TextEncoder().encode(secret));
  return new NextRequest("http://localhost/api/posts/save-test-post", {
    method, headers: { cookie: `admin_session=${token}`, "content-type": "application/json" },
    ...(method !== "DELETE" ? { body: JSON.stringify(body) } : {}),
  });
}

const context = { params: Promise.resolve({ id: initial.id }) };

test("ordinary Save edits a published article without hiding it or changing its publication date", async () => {
  const response = await PUT(await request({ excerpt: "Updated summary" }), context);
  assert.equal(response.status, 200);
  const post = await response.json();
  assert.equal(post.status, "PUBLISHED");
  assert.equal(post.publishedAt, publishedAt.toISOString());
  assert.equal(post.excerpt, "Updated summary");
  assert.deepEqual(post.tags, [{ name: "existing-tag" }]);
});

test("ordinary Save keeps an unpublished article as a draft", async () => {
  stored.status = "DRAFT";
  stored.publishedAt = null;
  const response = await PUT(await request({ excerpt: "Draft edits" }), context);
  const post = await response.json();
  assert.equal(post.status, "DRAFT");
  assert.equal(post.publishedAt, null);
});

test("renaming a published article preserves its shared URL and original publication date", async () => {
  const response = await PUT(await request({ title: "A completely revised title" }), context);
  assert.equal(response.status, 200);
  const post = await response.json();
  assert.equal(post.title, "A completely revised title");
  assert.equal(post.slug, initial.slug);
  assert.equal(post.publishedAt, publishedAt.toISOString());
});

test("explicit Publish sets the initial publication date only once", async () => {
  stored.status = "DRAFT";
  stored.publishedAt = null;
  const first = await PUT(await request({ status: "PUBLISHED" }), context);
  const firstPost = await first.json();
  assert.equal(firstPost.status, "PUBLISHED");
  assert.ok(firstPost.publishedAt);
  const second = await PUT(await request({ status: "PUBLISHED" }), context);
  assert.equal((await second.json()).publishedAt, firstPost.publishedAt);
});

test("repeated tag names are normalized instead of causing a unique-constraint failure", async () => {
  const response = await PUT(await request({ tags: ["React", " React ", "", "Next.js"] }), context);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).tags, [{ name: "React" }, { name: "Next.js" }]);
});

test("mutation handlers reject visitors and non-admin sessions even without the proxy", async () => {
  const visitor = new NextRequest("http://localhost/api/posts", { method: "POST" });
  assert.equal((await POST(visitor)).status, 401);
  assert.equal((await PUT(await request({}, "reader"), context)).status, 401);
  assert.equal((await DELETE(await request({}, "reader", "DELETE"), context)).status, 401);
  assert.equal(stored.status, "PUBLISHED");
});
