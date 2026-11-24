import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { POST as login } from "../src/app/api/auth/login/route";
import { verifyPassword, AdminAuthConfigurationError } from "../src/lib/admin-password";

const original = {
  password: process.env.ADMIN_PASSWORD,
  hash: process.env.ADMIN_PASSWORD_HASH,
  secret: process.env.SESSION_SECRET,
};
const secret = randomBytes(32).toString("hex");
const password = "test-only-admin-credential";

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

before(() => { process.env.SESSION_SECRET = secret; });
after(() => {
  restore("ADMIN_PASSWORD", original.password);
  restore("ADMIN_PASSWORD_HASH", original.hash);
  restore("SESSION_SECRET", original.secret);
});

function request(value: string, ip: string) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ password: value }),
  });
}

test("existing ADMIN_PASSWORD signs an admin session; wrong passwords return 401", async () => {
  delete process.env.ADMIN_PASSWORD_HASH;
  process.env.ADMIN_PASSWORD = password;
  const accepted = await login(request(password, "login-test-1"));
  assert.equal(accepted.status, 200);
  const cookie = accepted.cookies.get("admin_session");
  assert.ok(cookie?.value);
  const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode(secret));
  assert.equal(payload.role, "admin");
  const rejected = await login(request("wrong-test-password", "login-test-2"));
  assert.equal(rejected.status, 401);
  assert.equal(rejected.cookies.get("admin_session"), undefined);
});

test("an explicit bcrypt hash takes precedence over the old password variable", async () => {
  process.env.ADMIN_PASSWORD = password;
  process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync("new-hashed-test-password", 4);
  assert.equal(await verifyPassword("new-hashed-test-password"), true);
  assert.equal(await verifyPassword(password), false);
});

test("existing bcrypt values in ADMIN_PASSWORD remain supported", async () => {
  delete process.env.ADMIN_PASSWORD_HASH;
  process.env.ADMIN_PASSWORD = bcrypt.hashSync(password, 4);
  assert.equal(await verifyPassword(password), true);
  assert.equal(await verifyPassword("wrong-test-password"), false);
});

test("missing or malformed credentials fail closed", async () => {
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_PASSWORD_HASH;
  await assert.rejects(() => verifyPassword(password), AdminAuthConfigurationError);
  process.env.ADMIN_PASSWORD = password;
  process.env.ADMIN_PASSWORD_HASH = "invalid-test-hash";
  await assert.rejects(() => verifyPassword(password), AdminAuthConfigurationError);
});

test("malformed login requests return 400", async () => {
  const response = await login(new NextRequest("http://localhost/api/auth/login", {
    method: "POST", headers: { "x-forwarded-for": "login-test-3" }, body: "{",
  }));
  assert.equal(response.status, 400);
});
