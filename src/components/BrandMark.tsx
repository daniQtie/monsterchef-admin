/**
 * Monster Chef brand mark — a stylised pot lid with a single rising steam wisp.
 * Replaces the 🍳 emoji and is monochrome by default so it picks up the warm
 * gold accent via currentColor.
 */
export function BrandMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Pot body */}
      <path d="M5 13.5h22l-1.3 11.2a3 3 0 0 1-3 2.6H9.3a3 3 0 0 1-3-2.6L5 13.5Z" />
      {/* Handles */}
      <path d="M5 16.5h-1.5a1.5 1.5 0 0 0 0 3H5" />
      <path d="M27 16.5h1.5a1.5 1.5 0 0 1 0 3H27" />
      {/* Lid line */}
      <path d="M3.5 13.5h25" />
      {/* Lid knob */}
      <circle cx="16" cy="11" r="1.5" />
      {/* Steam wisps — animated via the float-slow class on the parent if desired */}
      <path d="M11 7c1.4-1.2 1.4-3 0-4.2" opacity=".55" />
      <path d="M16 6c1.6-1.4 1.6-3.4 0-4.8" opacity=".75" />
      <path d="M21 7c1.4-1.2 1.4-3 0-4.2" opacity=".55" />
    </svg>
  );
}

export function WordMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-[color:var(--color-gold)] inline-flex">
        <BrandMark size={26} />
      </span>
      <span className="font-display text-[19px] font-semibold tracking-[-0.01em] leading-none">
        Monster <span className="italic text-[color:var(--color-gold)]">Chef</span>
      </span>
    </div>
  );
}
