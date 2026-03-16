"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PixelCat } from "@/components/ui/cat-icon";
import { useMeow } from "@/hooks/use-meow";

export default function HomePage() {
  const meow = useMeow();
  const [activeWord, setActiveWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/[0.02] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-purple/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-accent-pink/[0.03] rounded-full blur-[80px]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-24 sm:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-purple/15 bg-accent-purple/[0.05] px-4 py-1.5 text-xs font-semibold text-accent-purple backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-pulse" />
                Welcome to my blog
              </div>

              <h1
                className="text-4xl font-extrabold sm:text-5xl lg:text-[54px] lg:leading-[1.2]"
                style={{ fontFamily: "var(--font-galmuri), system-ui, sans-serif", letterSpacing: "0.01em" }}
              >
                <span className="block">
                  <span className={`title-word ${activeWord === 0 ? "title-word-active" : ""}`}>
                    Coding,
                  </span>
                </span>
                <span className="block mt-1">
                  <span className={`title-word ${activeWord === 1 ? "title-word-active" : ""}`}>
                    Digging,
                  </span>
                  {" "}
                  <span className={`title-word ${activeWord === 2 ? "title-word-active" : ""}`}>
                    & Cats
                  </span>
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-content-3">
                개발하면서 배운 것들, 삽질한 경험들,
                <br className="hidden sm:block" />
                그리고 고양이처럼 우아한 코드에 대한 이야기.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link href="/explore" className="btn-primary">
                  블로그 구경하기
                </Link>
                <Link href="/admin/posts/new" className="btn-outline">
                  글 쓰기
                </Link>
              </div>

              {/* Terminal-style decoration */}
              <div className="mt-12 rounded-2xl border border-surface-border/60 bg-dark-975/80 p-5 font-mono text-sm max-w-md backdrop-blur-sm shadow-inner">
                <div className="flex items-center gap-1.5 mb-3.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                </div>
                <div className="space-y-0.5 text-[13px]">
                  <div>
                    <span className="text-accent-purple">const</span>{" "}
                    <span className="text-accent-mint">blog</span>{" "}
                    <span className="text-content-faint">=</span>{" "}
                    <span className="text-accent-orange">{`{`}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">author</span>
                    <span className="text-content-faint">:</span>{" "}
                    <span className="text-accent-orange">&apos;JooDev&apos;</span>
                    <span className="text-content-faint">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">mood</span>
                    <span className="text-content-faint">:</span>{" "}
                    <span className="text-accent-orange">&apos;~(=^..^)&apos;</span>
                    <span className="text-content-faint">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-accent-blue">coffee</span>
                    <span className="text-content-faint">:</span>{" "}
                    <span className="text-accent-purple">Infinity</span>
                  </div>
                  <div>
                    <span className="text-accent-orange">{`}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Cat */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-heading/[0.03] rounded-full blur-3xl scale-75" />
                <div className="relative animate-float-slow cursor-pointer" onClick={meow}>
                  <PixelCat size={320} />
                </div>
                {/* Floating tags */}
                <div className="absolute -top-4 -right-4 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft text-xs font-mono text-accent-mint animate-float backdrop-blur-sm">
                  meow( )
                </div>
                <div className="absolute top-16 -right-16 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft animate-float backdrop-blur-sm" style={{ animationDelay: "0.8s" }}>
                  <span className="text-accent-orange text-xs font-mono">nap.log</span>
                </div>
                <div className="absolute -bottom-2 -left-10 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft animate-float backdrop-blur-sm" style={{ animationDelay: "1.5s" }}>
                  <span className="text-accent-pink text-xs font-mono">purr.js</span>
                </div>
                <div className="absolute top-1/2 -left-16 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft animate-float backdrop-blur-sm" style={{ animationDelay: "2.2s" }}>
                  <span className="text-accent-blue text-xs font-mono">scratch.css</span>
                </div>
                <div className="absolute -bottom-6 right-8 rounded-xl border border-surface-border-light/60 bg-surface-raised/90 px-3 py-1.5 shadow-soft animate-float backdrop-blur-sm" style={{ animationDelay: "3s" }}>
                  <span className="text-accent-purple text-xs font-mono">cat.exe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
