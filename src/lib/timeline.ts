export interface TimelineCategory {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;       // tailwind accent class suffix
  glowColor: string;   // rgba for SVG glow
}

export const TIMELINE_CATEGORIES: TimelineCategory[] = [
  {
    key: "Daily",
    label: "Daily",
    description: "일상 기록과 스냅샷",
    icon: "📸",
    color: "accent-pink",
    glowColor: "rgba(240, 171, 252, 0.6)",
  },
  {
    key: "Frontend",
    label: "Frontend",
    description: "프론트엔드 개발 이야기",
    icon: "🎨",
    color: "accent-blue",
    glowColor: "rgba(147, 197, 253, 0.6)",
  },
  {
    key: "Backend",
    label: "Backend",
    description: "백엔드 & 서버 사이드",
    icon: "⚙️",
    color: "accent-mint",
    glowColor: "rgba(110, 231, 183, 0.6)",
  },
  {
    key: "DevOps",
    label: "DevOps",
    description: "인프라와 배포 자동화",
    icon: "🚀",
    color: "accent-orange",
    glowColor: "rgba(253, 186, 116, 0.6)",
  },
  {
    key: "QA",
    label: "QA",
    description: "테스트와 품질 관리",
    icon: "🔍",
    color: "accent-purple",
    glowColor: "rgba(167, 139, 250, 0.6)",
  },
  {
    key: "Review",
    label: "Review",
    description: "회고와 정리",
    icon: "📝",
    color: "accent-purple",
    glowColor: "rgba(167, 139, 250, 0.6)",
  },
  {
    key: "Experiences",
    label: "Experiences",
    description: "경험과 인사이트",
    icon: "💡",
    color: "accent-orange",
    glowColor: "rgba(253, 186, 116, 0.6)",
  },
];

export function getTimelineCategory(key: string): TimelineCategory | undefined {
  return TIMELINE_CATEGORIES.find((c) => c.key === key);
}
