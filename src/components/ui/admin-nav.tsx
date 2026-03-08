"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CatFace } from "./cat-icon";
import { useTheme } from "./theme-provider";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-dark-950/70 backdrop-blur-2xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            <Link
              href="/admin/posts"
              className="mr-4 flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink shadow-glow-sm">
                <CatFace size={16} className="text-dark-950" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-heading">
                Admin
              </span>
            </Link>
            <Link
              href="/admin/posts"
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                pathname === "/admin/posts"
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "text-content-3 hover:bg-surface-raised hover:text-content-1"
              )}
            >
              게시글
            </Link>
            <Link
              href="/admin/posts/new"
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                pathname === "/admin/posts/new"
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "text-content-3 hover:bg-surface-raised hover:text-content-1"
              )}
            >
              새 글 작성
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-content-3 hover:bg-surface-raised hover:text-content-1 transition-all duration-200"
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
            >
              {theme === "dark" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              href="/"
              target="_blank"
              className="btn-ghost text-xs"
            >
              사이트 보기
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-surface-border/50 to-transparent" />
    </header>
  );
}
