"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CatFace } from "./cat-icon";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

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
                <CatFace size={16} className="text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white">
                Admin
              </span>
            </Link>
            <Link
              href="/admin/posts"
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                pathname === "/admin/posts"
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "text-gray-400 hover:bg-surface-raised hover:text-gray-200"
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
                  : "text-gray-400 hover:bg-surface-raised hover:text-gray-200"
              )}
            >
              새 글 작성
            </Link>
          </div>
          <div className="flex items-center gap-1">
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
