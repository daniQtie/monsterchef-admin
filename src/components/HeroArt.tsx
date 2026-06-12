/**
 * HeroArt — a self-contained, vector "Monster Chef" cooking scene used as the login
 * hero. No network image dependency (so it never fails to load). Warm kitchen palette
 * matched to the VR game: copper pot, gold rim, a friendly monster peeking out, rising
 * steam, and floating Filipino-dish ingredients (chili, bay leaf, garlic).
 *
 * Decorative only (aria-hidden). Animations use the .steam / .drift-slow / .twinkle
 * helpers from globals.css and are disabled under prefers-reduced-motion.
 */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 640 760"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="hg-glow" cx="50%" cy="34%" r="60%">
          <stop offset="0%" stopColor="#e6a948" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#c2553a" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#16110d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hg-pot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a4030" />
          <stop offset="48%" stopColor="#3a281c" />
          <stop offset="100%" stopColor="#241812" />
        </linearGradient>
        <linearGradient id="hg-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b88534" />
          <stop offset="50%" stopColor="#f1b656" />
          <stop offset="100%" stopColor="#b88534" />
        </linearGradient>
        <linearGradient id="hg-broth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e07a3c" />
          <stop offset="100%" stopColor="#a8431f" />
        </linearGradient>
      </defs>

      {/* Warm ambient glow */}
      <rect width="640" height="760" fill="url(#hg-glow)" />

      {/* Floating ingredients */}
      <g className="drift-slow" style={{ ["--rot" as string]: "-8deg", transformBox: "fill-box", transformOrigin: "center" }}>
        {/* red chili */}
        <g transform="translate(120 220)">
          <path d="M0 0c18 4 30 18 28 40-1 14-10 22-20 20-12-3-14-18-10-32C-1 16-6 6 0 0Z" fill="#c2553a" />
          <path d="M2 -2c4-8 12-10 18-6" stroke="#6b8f5e" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      </g>
      <g className="drift-slow" style={{ animationDelay: "1.2s", ["--rot" as string]: "12deg", transformBox: "fill-box", transformOrigin: "center" }}>
        {/* bay leaf */}
        <g transform="translate(500 180)">
          <path d="M0 0c30-18 64-12 78 8-22 16-56 18-78-8Z" fill="#6b8f5e" />
          <path d="M6 2c22-6 44-2 64 8" stroke="#16110d" strokeWidth="3" opacity=".35" fill="none" />
        </g>
      </g>
      <g className="drift-slow" style={{ animationDelay: "0.6s", ["--rot" as string]: "-4deg", transformBox: "fill-box", transformOrigin: "center" }}>
        {/* garlic */}
        <g transform="translate(515 470)">
          <path d="M0 18c0-16 8-26 14-26s14 10 14 26c0 12-6 18-14 18S0 30 0 18Z" fill="#f4ede2" />
          <path d="M14 -8v8M9 -4l4 6M19 -4l-4 6" stroke="#b8a892" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 -8C12 -18 16 -22 20 -20" stroke="#b88534" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Sparkles */}
      <g fill="#f1b656">
        <path className="twinkle" d="M150 420l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
        <path className="twinkle" style={{ animationDelay: "1s" }} d="M470 320l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        <path className="twinkle" style={{ animationDelay: "2s" }} d="M95 560l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
      </g>

      {/* Steam */}
      <g stroke="#f4ede2" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.6">
        <path className="steam" d="M268 380c-14-16-14-34 0-50s14-34 0-50" />
        <path className="steam" style={{ animationDelay: "1.2s" }} d="M320 380c-14-16-14-34 0-50s14-34 0-50" />
        <path className="steam" style={{ animationDelay: "2.1s" }} d="M372 380c-14-16-14-34 0-50s14-34 0-50" />
      </g>

      {/* Chef toque resting behind the pot */}
      <g transform="translate(388 372) rotate(10)">
        <path d="M0 40c-6-30 10-50 34-50 8-18 36-18 46 0 24-2 40 18 34 48l-2 10H2L0 40Z" fill="#f4ede2" />
        <rect x="2" y="86" width="112" height="20" rx="6" fill="#e7ddcc" />
      </g>

      {/* The pot */}
      <g transform="translate(320 540)">
        {/* handles */}
        <path d="M-150 -34h-26a18 18 0 0 0 0 36h26" stroke="url(#hg-rim)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M150 -34h26a18 18 0 0 1 0 36h-26" stroke="url(#hg-rim)" strokeWidth="14" fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M-156 -44h312l-22 150a30 30 0 0 1-30 26H-104a30 30 0 0 1-30-26L-156 -44Z" fill="url(#hg-pot)" />
        {/* broth */}
        <ellipse cx="0" cy="-44" rx="156" ry="30" fill="url(#hg-broth)" />
        <ellipse cx="0" cy="-46" rx="156" ry="30" fill="none" stroke="url(#hg-rim)" strokeWidth="10" />
        {/* floating diced bits in the broth */}
        <g fill="#f4ede2" opacity=".85">
          <rect x="-60" y="-54" width="16" height="16" rx="3" transform="rotate(12 -52 -46)" />
          <rect x="20" y="-52" width="14" height="14" rx="3" transform="rotate(-18 27 -45)" />
          <rect x="68" y="-44" width="12" height="12" rx="3" transform="rotate(24 74 -38)" />
        </g>
        <g fill="#c2553a" opacity=".8">
          <circle cx="-20" cy="-44" r="7" />
          <circle cx="48" cy="-50" r="6" />
        </g>

        {/* Monster Chef — friendly eyes peeking over the rim */}
        <g transform="translate(0 -86)">
          <circle cx="-34" cy="0" r="22" fill="#f4ede2" />
          <circle cx="34" cy="0" r="22" fill="#f4ede2" />
          <circle cx="-30" cy="3" r="9" fill="#241812" />
          <circle cx="38" cy="3" r="9" fill="#241812" />
          <circle cx="-27" cy="0" r="3" fill="#f4ede2" />
          <circle cx="41" cy="0" r="3" fill="#f4ede2" />
          {/* little chef-y brows */}
          <path d="M-52 -20q18 -10 34 -2" stroke="#3a281c" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M18 -22q18 -8 34 2" stroke="#3a281c" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Wooden spoon */}
      <g transform="translate(140 560) rotate(-26)" className="drift-slow" style={{ animationDelay: "0.3s" }}>
        <rect x="0" y="0" width="14" height="150" rx="7" fill="#8a6a44" />
        <ellipse cx="7" cy="-8" rx="26" ry="34" fill="#9c7a4f" />
        <ellipse cx="7" cy="-8" rx="16" ry="24" fill="#7c5f3c" />
      </g>
    </svg>
  );
}
