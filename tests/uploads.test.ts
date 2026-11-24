import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import { SignJWT } from "jose";
import { getPayloadFromClientToken } from "@vercel/blob/client";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/upload/route";
import { MAX_UPLOAD_BYTES } from "../src/lib/upload-policy";

const keys = ["SESSION_SECRET", "BLOB_READ_WRITE_TOKEN", "VERCEL"] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const secret = randomBytes(32).toString("hex");
before(() => {
  process.env.SESSION_SECRET = secret;
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_teststore_test-signing-credential";
  process.env.VERCEL = "1";
});
after(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

async function request(size: number, type = "image/png", role = "admin") {
  const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h").sign(new TextEncoder().encode(secret));
  return new NextRequest("http://localhost/api/upload", {
    method: "POST", headers: { cookie: `admin_session=${token}`, "content-type": "application/json" },
    body: JSON.stringify({ type, size }),
  });
}

test("a file larger than the Function body limit receives a tightly constrained direct-upload token", async () => {
  const response = await POST(await request(6 * 1024 * 1024));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.strategy, "blob");
  assert.match(result.pathname, /^blog\/[\w-]+\.png$/);
  assert.notEqual(result.token, process.env.BLOB_READ_WRITE_TOKEN);
  const payload = getPayloadFromClientToken(result.token);
  assert.equal(payload.pathname, result.pathname);
  assert.deepEqual(payload.allowedContentTypes, ["image/png"]);
  assert.equal(payload.maximumSizeInBytes, MAX_UPLOAD_BYTES);
  assert.equal(payload.allowOverwrite, false);
  assert.ok(payload.validUntil > Date.now() && payload.validUntil <= Date.now() + 10 * 60 * 1000);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("50 MiB is accepted but oversize and unsupported uploads are rejected before transfer", async () => {
  assert.equal((await POST(await request(MAX_UPLOAD_BYTES))).status, 200);
  assert.equal((await POST(await request(MAX_UPLOAD_BYTES + 1))).status, 400);
  assert.equal((await POST(await request(100, "text/html"))).status, 400);
  assert.equal((await POST(await request(0))).status, 400);
});

test("visitors and signed non-admin sessions cannot obtain upload tokens", async () => {
  const visitor = new NextRequest("http://localhost/api/upload", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "image/png", size: 100 }),
  });
  assert.equal((await POST(visitor)).status, 401);
  assert.equal((await POST(await request(100, "image/png", "reader"))).status, 401);
});
