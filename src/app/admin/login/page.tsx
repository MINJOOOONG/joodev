"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CatFace, PawPrint } from "@/components/ui/cat-icon";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/admin/posts");
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/[0.03] via-transparent to-transparent" />
      <div className="relative w-full max-w-sm">
        {/* Cat logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink shadow-glow">
            <CatFace size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            관리자 로그인
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            비밀번호를 입력해 주세요 ~(=^..^)
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card p-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-400 mb-1.5"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="input-field"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  로그인 중...
                </>
              ) : (
                <>
                  로그인
                  <PawPrint size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Paw trail */}
        <div className="mt-6 flex justify-center gap-3 text-accent-purple/15">
          <PawPrint size={10} className="rotate-[-20deg]" />
          <PawPrint size={12} className="rotate-[10deg]" />
          <PawPrint size={10} className="rotate-[-5deg]" />
        </div>
      </div>
    </div>
  );
}
