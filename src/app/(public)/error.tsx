"use client";

import Link from "next/link";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl font-bold text-heading">글을 불러오지 못했어요.</h1>
      <p className="mt-4 leading-relaxed text-content-3">연결 상태를 확인하거나 잠시 후 다시 시도해 주세요.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={reset}>다시 시도</button>
        <Link href="/home" className="btn-secondary">홈으로 돌아가기</Link>
      </div>
    </section>
  );
}
