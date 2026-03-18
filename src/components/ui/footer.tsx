import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-surface-border/40 to-transparent" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm text-content-faint">
            <Link
              href="/home"
              className="font-semibold text-content-3 hover:text-accent-purple transition-colors duration-200"
            >
              Joo<span className="text-accent-purple">Dev</span>
            </Link>
            <span className="text-content-ghost">&middot;</span>
            <span>Made with</span>
            <span className="text-accent-pink/50">&hearts;</span>
            <span>by Minjoo</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-content-ghost">
            <a
              href="https://github.com/MINJOOOONG"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-content-faint transition-colors duration-200"
            >
              GitHub
            </a>
            <span className="h-3 w-px bg-surface-border/40" />
            <span>010-4948-5089</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
