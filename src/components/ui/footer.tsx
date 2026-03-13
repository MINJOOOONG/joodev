import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-surface-border/40 to-transparent" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-content-faint">
            <span>Everything here was made by</span>
            <span className="text-accent-pink/40">&hearts;</span>
            <Link
              href="/"
              className="font-semibold text-content-3 hover:text-accent-purple transition-colors duration-200"
            >
              Minjoo
            </Link>
          </div>
          <p className="text-xs text-content-ghost">
            Contact me 010-4948-5089
          </p>
        </div>
      </div>
    </footer>
  );
}
