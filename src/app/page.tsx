"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PixelCat } from "@/components/ui/cat-icon";

/*
  장면: "코딩하는 고양이의 방"
  오브젝트 2개 + 노트북: 창문(왼쪽 뒤 배경), 어항(오른쪽 앞)
  고양이 앞에 작은 노트북으로 코딩 컨셉
  색 채도 높여서 배경 위에서 또렷하게
*/

/* ─── 창문 (20x16 @ 160x128) ─── */

function PixelWindow() {
  return (
    <svg width="160" height="128" viewBox="0 0 20 16" shapeRendering="crispEdges">
      {/* 창틀 — 선명한 우드 */}
      <rect x="0" y="0" width="20" height="14" fill="#d4a574" opacity="0.4" />
      <rect x="1" y="1" width="18" height="12" fill="#c4956a" opacity="0.15" />

      {/* 왼쪽 유리 — 선명한 인디고 */}
      <rect x="1" y="1" width="8" height="9" fill="#6366f1" opacity="0.35" />
      {/* 오른쪽 유리 */}
      <rect x="11" y="1" width="8" height="9" fill="#6366f1" opacity="0.35" />

      {/* 별 */}
      <rect x="3" y="2" width="1" height="1" fill="#fef08a" opacity="0.9" className="intro-sparkle" />
      <rect x="6" y="4" width="1" height="1" fill="#fef08a" opacity="0.65" className="intro-sparkle-slow" />
      <rect x="13" y="2" width="1" height="1" fill="#fef08a" opacity="0.8" className="intro-sparkle-fast" />
      <rect x="17" y="3" width="1" height="1" fill="#fef08a" opacity="0.6" className="intro-sparkle" />

      {/* 달 */}
      <rect x="15" y="2" width="2" height="2" fill="#fef08a" opacity="0.55" />
      <rect x="16" y="1" width="1" height="1" fill="#fef08a" opacity="0.35" />

      {/* 나무 왼쪽 */}
      <rect x="3" y="6" width="3" height="3" fill="#34d399" opacity="0.4" />
      <rect x="4" y="5" width="2" height="2" fill="#6ee7b7" opacity="0.35" />
      <rect x="4" y="9" width="1" height="1" fill="#92400e" opacity="0.3" />

      {/* 나무 오른쪽 */}
      <rect x="14" y="6" width="3" height="3" fill="#34d399" opacity="0.4" />
      <rect x="15" y="5" width="2" height="2" fill="#6ee7b7" opacity="0.35" />
      <rect x="15" y="9" width="1" height="1" fill="#92400e" opacity="0.3" />

      {/* 잔디 */}
      <rect x="1" y="9" width="8" height="1" fill="#34d399" opacity="0.15" />
      <rect x="11" y="9" width="8" height="1" fill="#34d399" opacity="0.15" />

      {/* 창틀 십자 */}
      <rect x="9" y="1" width="2" height="9" fill="#d4a574" opacity="0.4" />
      <rect x="1" y="6" width="18" height="1" fill="#d4a574" opacity="0.2" />

      {/* 창틀 하단 턱 */}
      <rect x="0" y="10" width="20" height="1" fill="#d4a574" opacity="0.45" />
      <rect x="1" y="10" width="18" height="1" fill="#e8c9a0" opacity="0.1" />

      {/* 창 아래 벽 */}
      <rect x="0" y="11" width="20" height="5" fill="#d4a574" opacity="0.06" />

      {/* 유리 반사 */}
      <rect x="2" y="2" width="1" height="2" fill="#a5b4fc" opacity="0.2" className="intro-sparkle-slow" />
      <rect x="12" y="2" width="1" height="2" fill="#a5b4fc" opacity="0.16" className="intro-sparkle" />
    </svg>
  );
}

/* ─── 어항 (8x8 @ 72x72) ─── 선명한 색 */

function PixelFishBowl() {
  return (
    <svg width="72" height="72" viewBox="0 0 8 8" shapeRendering="crispEdges">
      {/* 받침 */}
      <rect x="2" y="7" width="4" height="1" fill="#c4956a" opacity="0.35" />

      {/* 어항 유리 — 선명한 청록 */}
      <rect x="2" y="1" width="4" height="1" fill="#67e8f9" opacity="0.2" />
      <rect x="1" y="2" width="6" height="4" fill="#67e8f9" opacity="0.16" />
      <rect x="2" y="6" width="4" height="1" fill="#67e8f9" opacity="0.12" />

      {/* 물 */}
      <rect x="1" y="3" width="6" height="3" fill="#22d3ee" opacity="0.08" />

      {/* 물고기 — 선명한 빨강 */}
      <rect x="3" y="3" width="2" height="1" fill="#ef4444" opacity="0.6" />
      <rect x="2" y="4" width="1" height="1" fill="#ef4444" opacity="0.45" />
      <rect x="5" y="3" width="1" height="1" fill="#ef4444" opacity="0.45" />
      {/* 눈 */}
      <rect x="3" y="3" width="1" height="1" fill="#0f172a" opacity="0.5" />

      {/* 물거품 */}
      <rect x="4" y="2" width="1" height="1" fill="#a5f3fc" opacity="0.35" className="intro-sparkle-fast" />

      {/* 수초 */}
      <rect x="5" y="4" width="1" height="2" fill="#34d399" opacity="0.35" />

      {/* 유리 반사 */}
      <rect x="1" y="2" width="1" height="2" fill="#cffafe" opacity="0.18" className="intro-sparkle-slow" />
    </svg>
  );
}

/* ─── 노트북 (고양이 앞 작은 소품) ─── */

function PixelLaptop() {
  return (
    <svg width="80" height="48" viewBox="0 0 10 6" shapeRendering="crispEdges">
      {/* 화면 — 약간 기울어진 느낌 */}
      <rect x="1" y="0" width="8" height="4" fill="#334155" opacity="0.5" />
      {/* 화면 안쪽 */}
      <rect x="2" y="1" width="6" height="2" fill="#6366f1" opacity="0.25" />
      {/* 코드 줄 */}
      <rect x="2" y="1" width="3" height="1" fill="#a78bfa" opacity="0.4" />
      <rect x="2" y="2" width="4" height="1" fill="#34d399" opacity="0.3" />
      {/* 화면 반사 */}
      <rect x="6" y="1" width="1" height="1" fill="#a5b4fc" opacity="0.15" className="intro-sparkle-slow" />

      {/* 키보드 베이스 */}
      <rect x="0" y="4" width="10" height="2" fill="#475569" opacity="0.4" />
      <rect x="1" y="4" width="8" height="1" fill="#64748b" opacity="0.15" />
      {/* 키 패턴 */}
      <rect x="2" y="4" width="1" height="1" fill="#94a3b8" opacity="0.12" />
      <rect x="4" y="4" width="1" height="1" fill="#94a3b8" opacity="0.12" />
      <rect x="6" y="4" width="1" height="1" fill="#94a3b8" opacity="0.12" />
      {/* 트랙패드 */}
      <rect x="4" y="5" width="2" height="1" fill="#94a3b8" opacity="0.08" />
    </svg>
  );
}

/* ─── 핑크 러그 ─── */

function PixelRug() {
  return (
    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[30%]">
      <svg width="280" height="80" viewBox="0 0 70 20">
        <ellipse cx="35" cy="10" rx="35" ry="10" fill="#ffb8d0" opacity="0.08" />
        <ellipse cx="35" cy="10" rx="26" ry="7" fill="#ffd6e8" opacity="0.06" />
        <ellipse cx="35" cy="10" rx="14" ry="3.5" fill="#ffe0ec" opacity="0.05" />
      </svg>
    </div>
  );
}

/* ─── 발자국 ─── */

function PawPad({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="paw-pad-icon" opacity={opacity}>
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      <circle cx="7" cy="10" r="2.2" />
      <circle cx="11" cy="8" r="2.2" />
      <circle cx="15.5" cy="9" r="2" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  );
}

function IntroPawFall() {
  const [paws, setPaws] = useState<{ id: number; x: number; size: number; opacity: number; duration: number; delay: number; sway: number; rotation: number }[]>([]);

  useEffect(() => {
    const positions = [3, 10, 20, 30, 42, 55, 65, 75, 85, 95];
    setPaws(
      positions.map((x, i) => ({
        id: i,
        x: x + (Math.random() * 6 - 3),
        size: 12 + Math.random() * 16,
        opacity: 0.1 + Math.random() * 0.12,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 10,
        sway: 10 + Math.random() * 25,
        rotation: Math.random() * 360,
      }))
    );
  }, []);

  if (paws.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute paw-falling"
          style={{
            left: `${paw.x}%`,
            animationDuration: `${paw.duration}s`,
            animationDelay: `${paw.delay}s`,
            ["--paw-sway" as string]: `${paw.sway}px`,
          }}
        >
          <div style={{ transform: `rotate(${paw.rotation}deg)` }}>
            <PawPad size={paw.size} opacity={paw.opacity} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 메인 ─── */

export default function IntroPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleClick = useCallback(() => {
    const meow = new Audio("/sounds/meowsound.wav");
    meow.volume = 0.35;
    meow.play().catch(() => {});
    localStorage.setItem("musicEnabled", "true");
    setTimeout(() => router.push("/home"), 400);
  }, [router]);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <IntroPawFall />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-purple/[0.02] via-transparent to-accent-purple/[0.03]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-accent-purple/8" />

      {/* ─── 장면 ─── */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in-up px-4">

        {/* 말풍선 — z-30, 절대 가려지지 않음 */}
        <div className="relative z-30 intro-bubble rounded-2xl border border-accent-purple/20 bg-surface/80 px-7 py-4 shadow-soft backdrop-blur-sm mb-5">
          <p
            className="intro-text text-sm sm:text-base font-bold tracking-wide"
            style={{ fontFamily: "var(--font-galmuri), system-ui, sans-serif" }}
          >
            Do you want to see Minjoo&apos;s blog?
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-b border-r border-accent-purple/20 bg-surface/80" />
        </div>

        {/* 장면 컨테이너 */}
        <div className="relative">

          {/* 창문 — 왼쪽 대각선 뒤, 고양이와 적당히 떨어짐 */}
          <div className="pointer-events-none absolute z-0 -top-20 -left-36 sm:-left-48">
            <PixelWindow />
          </div>

          {/* 어항 — 오른쪽 아래, 고양이와 적당히 떨어짐 */}
          <div className="pointer-events-none absolute z-[1] bottom-2 -right-24 sm:-right-32">
            <PixelFishBowl />
          </div>

          {/* 고양이 + 노트북 + 러그 */}
          <div className="relative z-[2]">
            <PixelRug />
            <button
              onClick={handleClick}
              className="relative cursor-pointer p-2 transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="블로그 입장"
            >
              <div className="animate-float-slow">
                <PixelCat size={260} />
              </div>
              {/* 노트북 — 고양이 앞(아래) 중앙 */}
              <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-[3]">
                <PixelLaptop />
              </div>
            </button>
          </div>
        </div>

        {/* click the cat — 러그 아래 충분한 여백 */}
        <p className="mt-16 text-xs text-content-faint font-mono animate-pulse-soft">
          click the cat
        </p>
      </div>
    </div>
  );
}
