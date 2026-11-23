import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getSecret, SESSION_COOKIE, SESSION_MAX_AGE } from "./session";

export { getSecret, SESSION_COOKIE, SESSION_MAX_AGE } from "./session";

export function verifyPassword(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("ADMIN_PASSWORD_HASH is not set");
  return bcrypt.compareSync(password, hash);
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<{ role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { role: string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
