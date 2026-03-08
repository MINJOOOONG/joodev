import Link from "next/link";
import { SleepingCat } from "@/components/ui/cat-icon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/[0.03] via-transparent to-transparent" />
      <div className="relative text-center px-4">
        <SleepingCat className="mx-auto mb-6" />
        <p className="text-7xl font-extrabold bg-gradient-to-b from-accent-purple/40 to-accent-purple/10 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-xl font-bold text-content-1">
          길을 잃었어요...
        </h1>
        <p className="mt-2 text-sm text-content-muted">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link href="/" className="btn-primary mt-8">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
