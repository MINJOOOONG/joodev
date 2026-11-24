"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "./theme-provider";

type ViewMode = "diagram" | "code" | "both";

export default function MermaidBlock({ code }: { code: string }) {
  const { theme } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("diagram");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvg("");
    setError(false);
    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");
        if (cancelled) return;
        const isDark = theme === "dark";
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          suppressErrorRendering: true,
          theme: isDark ? "dark" : "default",
          themeVariables: {
            darkMode: isDark,
            background: isDark ? "#0d0919" : "#f8fafc",
            primaryColor: isDark ? "#a78bfa" : "#7c3aed",
            primaryTextColor: isDark ? "#e2e8f0" : "#1f2937",
            primaryBorderColor: isDark ? "#a78bfa" : "#7c3aed",
            lineColor: isDark ? "#6b7280" : "#9ca3af",
            secondaryColor: isDark ? "#f0abfc" : "#db2777",
            tertiaryColor: isDark ? "#1e1b4b" : "#ede9fe",
            fontFamily: "JetBrains Mono, monospace",
          },
        });
        const result = await mermaid.render(`mermaid-${id}`, code.trim());
        if (!cancelled) setSvg(result.svg);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [code, theme, id]);

  const showCode = viewMode !== "diagram" || error || !svg;
  return (
    <div className="my-8 rounded-2xl border border-surface-border overflow-hidden" style={{ backgroundColor: "rgb(var(--color-bg-code-article))" }}>
      <div className="flex items-center gap-1 px-4 pt-3 pb-2" aria-label="Mermaid 보기 방식">
        <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-accent-purple/60">Mermaid</span>
        {(["diagram", "code", "both"] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => setViewMode(mode)} aria-pressed={viewMode === mode}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${viewMode === mode ? "bg-accent-purple/15 text-accent-purple" : "text-content-muted hover:text-content-2 hover:bg-surface-overlay/50"}`}>
            {mode === "diagram" ? "Diagram" : mode === "code" ? "Code" : "Both"}
          </button>
        ))}
      </div>
      {showCode && <pre data-language="mermaid" className="!my-0 !rounded-none !border-0"><code className="language-mermaid">{code}</code></pre>}
      {viewMode !== "code" && svg && !error && (
        <div className={`flex justify-center p-6 overflow-x-auto${viewMode === "both" ? " border-t border-surface-border/50" : ""}`} dangerouslySetInnerHTML={{ __html: svg }} />
      )}
      {error && <p role="status" className="p-4 text-sm text-content-muted">다이어그램을 표시하지 못해 원본 코드를 보여드립니다.</p>}
    </div>
  );
}
