/**
 * Custom icon set tuned for Monster Chef. All icons share a 1.6 stroke and
 * 24x24 viewport. Avoids Lucide/Feather defaults — these read as "AI tool".
 */
type Props = { size?: number; className?: string };
const wrap = (size = 18, className = "") => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true as const,
});

export const IconDashboard = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v3" /><path d="M20 13v3" />
    <path d="m12 13 3-3" />
    <circle cx="12" cy="13" r="1.2" />
  </svg>
);

export const IconStudents = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M3 19c.7-2.6 3-4.5 6-4.5s5.3 1.9 6 4.5" />
    <circle cx="9" cy="8" r="3" />
    <path d="M15.5 14.5c2 .3 3.6 1.8 4.2 3.7" />
    <path d="M16 8a2.6 2.6 0 0 0 0-5" />
  </svg>
);

export const IconSections = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M3 7h18" />
    <path d="M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7" />
    <path d="M9 7V4h6v3" />
    <path d="M9 12h6" /><path d="M9 16h4" />
  </svg>
);

export const IconScores = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M8 21h8" /><path d="M12 17v4" />
    <path d="M5 4h14v6a7 7 0 0 1-14 0V4Z" />
    <path d="M5 5H3a2 2 0 0 0 0 4h2.4" />
    <path d="M19 5h2a2 2 0 0 1 0 4h-2.4" />
  </svg>
);

export const IconLive = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <rect x="2.5" y="5" width="14" height="10" rx="2" />
    <path d="m16.5 9 5-2.5v11L16.5 15" />
    <circle cx="6" cy="10" r="1.2" />
  </svg>
);

export const IconSignOut = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
    <path d="M14 8.5 17.5 12 14 15.5" /><path d="M8.5 12h9" />
  </svg>
);

export const IconCheck = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="m4 12 5 5 11-12" />
  </svg>
);

export const IconClock = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconSparkle = ({ size, className }: Props) => (
  <svg {...wrap(size, className)}>
    <path d="M12 4v4" /><path d="M12 16v4" />
    <path d="M4 12h4" /><path d="M16 12h4" />
    <path d="m6.5 6.5 2.5 2.5" /><path d="m15 15 2.5 2.5" />
    <path d="m6.5 17.5 2.5-2.5" /><path d="m15 9 2.5-2.5" />
  </svg>
);
