/**
 * Subtle developer watermark — "DDV". Fixed to a screen corner, very low contrast,
 * non-interactive. Present site-wide as a quiet maker's mark.
 */
export function DevWatermark() {
  return (
    <div
      aria-hidden
      className="fixed bottom-3 right-3 z-50 pointer-events-none select-none
                 text-[10px] font-mono tracking-[0.22em] text-[color:var(--color-fg-dim)]/60"
      style={{ opacity: 0.4 }}
    >
      DDV
    </div>
  );
}
