"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PixelCat } from "./cat-icon";
import { useAuth } from "./auth-provider";

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, login, logout } = useAuth();
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
      <header className="sticky top-0 z-40 bg-dark-950/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <PixelCat size={36} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Joo<span className="text-accent-purple">Dev</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  pathname === "/"
                    ? "bg-accent-purple/10 text-accent-purple"
                    : "text-gray-400 hover:bg-surface-raised hover:text-gray-200"
                )}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/blog")
                    ? "bg-accent-purple/10 text-accent-purple"
                    : "text-gray-400 hover:bg-surface-raised hover:text-gray-200"
                )}
              >
                Blog
              </Link>
              <div className="ml-2 h-5 w-px bg-surface-border/50" />
              {!isLoading && isAuthenticated && (
                <Link
                  href="/admin/posts/new"
                  className="ml-2 btn-primary !py-1.5 !px-4 !text-xs !rounded-xl"
                >
                  Write
                </Link>
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
                  className="ml-1 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-surface-raised hover:text-gray-300 transition-all duration-200"
                >
                  {isAuthenticated ? "Logout" : "Login"}
                </button>
              )}
            </nav>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-surface-border/50 to-transparent" />
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
            <h3 className="text-lg font-bold text-white mb-4">Login</h3>
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
