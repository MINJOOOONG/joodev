import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, AdminAuthConfigurationError, createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        {
          status: 401,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }

    const token = await createSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    if (error instanceof AdminAuthConfigurationError) {
      console.error(error.message);
      return NextResponse.json(
        { error: "현재 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
