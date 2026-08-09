/**
 * EthioDelala brand logo — exact recreation.
 *
 * The mark consists of three connected elements in a single solid color:
 *   1. A tall vertical bar on the left (the "I" stem)
 *   2. A hand shape in the centre — a flat palm sweeping right with
 *      a curled index finger looping back left
 *   3. A house on the right — pentagonal (pointed roof) with a 2×2
 *      grid of four square windows cut out as white negative space
 *
 * Props
 *   size      {number}  — rendered width & height in px (default 40)
 *   variant   {string}  — 'color' | 'white' | 'dark'
 *   className {string}  — forwarded to <svg>
 *   withBg    {boolean} — wrap in a light-blue circle (default false)
 */
export default function Logo({
  size = 40,
  variant = 'color',
  className = '',
  withBg = false,
}) {
  const fill = variant === 'white' ? '#ffffff' : '#01579B'
  const bg   = variant === 'white' ? 'rgba(255,255,255,0.15)' : '#BAE6FD'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EthioDelala logo"
      role="img"
    >
      {/* Optional circle background */}
      {withBg && <circle cx="55" cy="50" r="52" fill={bg} />}

      {/* ── 1. Vertical bar (left "I") ── */}
      <rect x="2" y="38" width="14" height="52" rx="2" fill={fill} />

      {/* ── 2. Hand shape ──
          Palm: a wide flat shape that extends right under the house.
          The index finger curls back to the left forming the distinctive
          S-curve visible in the logo. */}
      <path
        d="
          M16 56
          L16 82
          Q16 90 24 90
          L90 90
          Q100 90 100 82
          Q100 74 90 74
          L52 74
          Q44 74 40 70
          L36 64
          Q34 60 30 58
          L26 57
          Q22 56 20 56
          Z
        "
        fill={fill}
      />

      {/* Index finger curl — the S-curve loop going back left */}
      <path
        d="
          M40 70
          Q44 78 38 82
          Q32 86 28 80
          Q24 74 30 68
          Q34 64 40 66
          Q48 68 50 74
        "
        fill={fill}
      />

      {/* Cutout inside the curl so the white gap shows */}
      <path
        d="
          M38 72
          Q42 76 38 79
          Q34 82 31 78
          Q28 74 32 70
          Q35 67 38 69
          Q42 71 42 74
        "
        fill="white"
      />

      {/* ── 3. House ──
          Pentagon: two sloped roof edges meeting at the peak,
          then vertical sides going down. */}
      <path
        d="
          M55 10
          L95 34
          L95 74
          L55 74
          L55 34
          Z
        "
        fill={fill}
      />

      {/* 2×2 window grid — cut out as white squares */}
      {/* top-left window */}
      <rect x="61" y="38" width="11" height="11" rx="1.5" fill="white" />
      {/* top-right window */}
      <rect x="76" y="38" width="11" height="11" rx="1.5" fill="white" />
      {/* bottom-left window */}
      <rect x="61" y="53" width="11" height="11" rx="1.5" fill="white" />
      {/* bottom-right window */}
      <rect x="76" y="53" width="11" height="11" rx="1.5" fill="white" />
    </svg>
  )
}
