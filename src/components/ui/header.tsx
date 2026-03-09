"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PixelCat } from "./cat-icon";
import { useAuth } from "./auth-provider";
import { useTheme } from "./theme-provider";
import { useMeow } from "@/hooks/use-meow";
import { useMusic } from "@/hooks/use-music";

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const meow = useMeow();
  const { playing, toggle: toggleMusic } = useMusic();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const success = await login(password);
    if (success) {
      setShowLoginModal(false);
      setPassword("");
    } else {
      setLoginError("비밀번호가 틀렸습니다.");
    }
    setLoginLoading(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[rgb(var(--color-bg)/0.85)] backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/home" className="group flex items-center gap-2.5">
              <div
                className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-110 cursor-pointer"
                onClick={(e) => { e.preventDefault(); toggleMusic(); meow(); }}
              >
                <PixelCat size={36} />
                {/* 음악 상태 말풍선 */}
                <span
                  className={`pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] leading-none transition-all duration-300 ${
                    playing
                      ? "bg-accent-purple/20 text-accent-purple scale-100 opacity-100"
                      : "bg-surface-raised/60 text-content-muted scale-90 opacity-70"
                  }`}
                >
                  {playing ? "♪" : "⏸"}
                </span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-heading">
                Joo<span className="text-accent-purple">Dev</span>
              </span>
            </Link>
            <nav className="flex items-center gap-0.5">
              {/* Nav tabs */}
              <Link
                href="/home"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-200",
                  pathname === "/home"
                    ? "bg-accent-purple/10 text-accent-purple"
                    : "text-content-3 hover:bg-surface-raised/80 hover:text-content-1"
                )}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-200",
                  pathname.startsWith("/blog")
                    ? "bg-accent-purple/10 text-accent-purple"
                    : "text-content-3 hover:bg-surface-raised/80 hover:text-content-1"
                )}
              >
                Blog
              </Link>

              <div className="mx-1.5 h-4 w-px bg-surface-border/40" />

              {/* Icon buttons */}
              <button
                onClick={toggleTheme}
                className="rounded-lg p-1.5 text-content-muted hover:bg-surface-raised/80 hover:text-content-2 transition-all duration-200"
                title={theme === "dark" ? "라이트 모드" : "다크 모드"}
              >
                {theme === "dark" ? (
                  <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <a
                href="https://github.com/MINJOOOONG"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-content-muted hover:bg-surface-raised/80 hover:text-content-2 transition-all duration-200"
                title="GitHub"
              >
                <svg className="h-[15px] w-[15px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* Action buttons */}
              {!isLoading && isAuthenticated && (
                <>
                  <div className="mx-1.5 h-4 w-px bg-surface-border/40" />
                  <Link
                    href="/admin/posts/new"
                    className="rounded-lg bg-accent-purple px-3 py-1.5 text-[12px] font-bold text-dark-950 hover:bg-accent-pink hover:shadow-glow-sm active:scale-[0.97] transition-all duration-200"
                  >
                    Write
                  </Link>
                </>
              )}
              {!isLoading && (
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      logout();
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="ml-0.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-content-muted hover:bg-surface-raised/80 hover:text-content-1 active:scale-[0.97] transition-all duration-200"
                >
                  {isAuthenticated ? "Logout" : "Login"}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-surface-border bg-dark-950 p-6 shadow-glow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-heading mb-4">Login</h3>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="input-field mb-3"
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-red-400 mb-3">{loginError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="btn-secondary flex-1 !py-2 !text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loginLoading || !password}
                  className="btn-primary flex-1 !py-2 !text-xs"
                >
                  {loginLoading ? "..." : "로그인"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
