// Illustrations for the sign-in pages, drawn in the Office Suit palette.
// Each floating piece sits in an outer <g className="art-float"> so the CSS
// animation doesn't replace the inner group's rotate/translate transform.

const INK = "#201e1d";
const PAPER = "#f3f2f2";
const RED = "#ec3013";
const LANE = "#e6e4e3";
const WHITE = "#ffffff";

type ArtProps = { className?: string };

function TaskCard({ x, y, done = false, hot = false }: { x: number; y: number; done?: boolean; hot?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width="88" height="44" rx="8" fill={WHITE} />
      <rect x={x + 10} y={y + 11} width={done ? 46 : 60} height="6" rx="3" fill={INK} opacity={done ? 0.35 : 0.8} />
      <rect x={x + 10} y={y + 23} width="38" height="5" rx="2.5" fill={INK} opacity="0.25" />
      <rect x={x + 10} y={y + 33} width="18" height="5" rx="2.5" fill={hot ? RED : INK} opacity={hot ? 1 : 0.2} />
      {done && (
        <g>
          <circle cx={x + 72} cy={y + 22} r="9" fill={RED} />
          <polyline points={`${x + 67.5},${y + 22} ${x + 71},${y + 25.5} ${x + 77},${y + 18.5}`} fill="none" stroke={WHITE} strokeWidth="2.6" strokeLinecap="square" />
        </g>
      )}
    </g>
  );
}

function Lane({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="126" width="112" height="214" rx="12" fill={LANE} />
      <rect x={x + 12} y="139" width="46" height="8" rx="4" fill={INK} opacity="0.55" />
      <rect x={x + 88} y="137" width="14" height="12" rx="6" fill={WHITE} />
    </g>
  );
}

/** Sign in: a task board with one card being dragged to Done. */
export function BoardArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-label="A task board with a card being moved to Done">
      <g className="art-float art-slow">
        <rect x="30" y="70" width="400" height="290" rx="20" fill={PAPER} />
        <circle cx="58" cy="98" r="7" fill={RED} />
        <rect x="74" y="92" width="118" height="12" rx="6" fill={INK} opacity="0.85" />
        <rect x="334" y="88" width="76" height="20" rx="10" fill={INK} />
        <rect x="350" y="95" width="44" height="6" rx="3" fill={PAPER} />
        <Lane x={50} />
        <Lane x={177} />
        <Lane x={304} />
        <TaskCard x={62} y={160} hot />
        <TaskCard x={62} y={214} />
        <TaskCard x={62} y={268} />
        <TaskCard x={189} y={160} />
        <rect x="189" y="214" width="88" height="44" rx="8" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="5 5" />
        <TaskCard x={316} y={160} done />
        <TaskCard x={316} y={214} done />
      </g>

      {/* The card on its way to Done */}
      <g className="art-float art-delay-1">
        <g transform="rotate(-8 300 300)">
          <rect x="250" y="268" width="104" height="54" rx="10" fill={INK} opacity="0.3" transform="translate(6 8)" />
          <rect x="250" y="268" width="104" height="54" rx="10" fill={WHITE} />
          <rect x="250" y="268" width="6" height="54" rx="3" fill={RED} />
          <rect x="266" y="281" width="66" height="7" rx="3.5" fill={INK} opacity="0.8" />
          <rect x="266" y="295" width="44" height="6" rx="3" fill={INK} opacity="0.25" />
          <rect x="266" y="307" width="22" height="6" rx="3" fill={RED} />
        </g>
        <path d="M352 318 l0 26 l7 -6 l6 12 l6 -3 l-6 -12 l9 -1 z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* Calendar tile */}
      <g className="art-float art-delay-2">
        <g transform="rotate(6 450 80)">
          <rect x="400" y="28" width="96" height="104" rx="16" fill={WHITE} />
          <rect x="400" y="28" width="96" height="30" rx="16" fill={RED} />
          <rect x="400" y="44" width="96" height="14" fill={RED} />
          <circle cx="426" cy="28" r="5" fill={INK} />
          <circle cx="470" cy="28" r="5" fill={INK} />
          <text x="448" y="49" textAnchor="middle" fontSize="12" fontWeight="800" letterSpacing="2" fill={WHITE} style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
            DUE
          </text>
          <text x="448" y="112" textAnchor="middle" fontSize="44" fontWeight="800" letterSpacing="-2" fill={INK} style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
            14
          </text>
        </g>
      </g>

      {/* Pinned note */}
      <g className="art-float art-delay-3">
        <g transform="rotate(-7 70 350)">
          <rect x="14" y="306" width="116" height="96" rx="8" fill={WHITE} />
          <circle cx="72" cy="318" r="7" fill={RED} />
          <rect x="30" y="338" width="80" height="6" rx="3" fill={INK} opacity="0.7" />
          <rect x="30" y="352" width="64" height="5" rx="2.5" fill={INK} opacity="0.25" />
          <rect x="30" y="364" width="72" height="5" rx="2.5" fill={INK} opacity="0.25" />
          <rect x="30" y="376" width="40" height="5" rx="2.5" fill={INK} opacity="0.25" />
        </g>
      </g>
    </svg>
  );
}

function Person({ cx, cy, r, bg, fg }: { cx: number; cy: number; r: number; bg: string; fg: string }) {
  const id = `clip-${cx}-${cy}`;
  return (
    <g>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx} cy={cy - r * 0.18} r={r * 0.3} fill={fg} />
        <ellipse cx={cx} cy={cy + r * 0.78} rx={r * 0.62} ry={r * 0.5} fill={fg} />
      </g>
    </g>
  );
}

/** Sign up: teammates gathering around a shared checklist, plus an invite ticket. */
export function TeamArt({ className = "" }: ArtProps) {
  const rows = [
    { y: 196, done: true, w: 120 },
    { y: 230, done: true, w: 96 },
    { y: 264, done: false, w: 110 },
  ];
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-label="Teammates gathered around a shared checklist">
      <g stroke={PAPER} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 7" fill="none">
        <path d="M110 108 C 150 130, 160 150, 178 170" />
        <path d="M418 112 C 380 130, 370 150, 352 170" />
        <path d="M104 318 C 140 300, 150 290, 170 276" />
        <path d="M424 304 C 390 296, 375 290, 360 276" />
      </g>

      <g className="art-float art-slow">
        <rect x="150" y="128" width="220" height="182" rx="18" fill={PAPER} />
        <rect x="172" y="150" width="96" height="11" rx="5.5" fill={INK} opacity="0.85" />
        <rect x="318" y="148" width="30" height="14" rx="7" fill={RED} />
        {rows.map((row) => (
          <g key={row.y}>
            <rect x="172" y={row.y} width="18" height="18" rx="5" fill={row.done ? RED : WHITE} stroke={row.done ? RED : INK} strokeOpacity="0.3" strokeWidth="2" />
            {row.done && (
              <polyline points={`176,${row.y + 9} 180,${row.y + 13} 186,${row.y + 5}`} fill="none" stroke={WHITE} strokeWidth="2.6" strokeLinecap="square" />
            )}
            <rect x="202" y={row.y + 5} width={row.w} height="8" rx="4" fill={INK} opacity={row.done ? 0.3 : 0.75} />
          </g>
        ))}
      </g>

      <g className="art-float art-delay-1">
        <Person cx={92} cy={92} r={36} bg={PAPER} fg={INK} />
      </g>
      <g className="art-float art-delay-2">
        <Person cx={432} cy={96} r={32} bg={RED} fg={PAPER} />
      </g>
      <g className="art-float art-delay-3">
        <Person cx={84} cy={330} r={30} bg={WHITE} fg={RED} />
      </g>
      <g className="art-float art-delay-1">
        <Person cx={440} cy={318} r={34} bg={PAPER} fg={INK} />
        <circle cx="466" cy="292" r="12" fill={RED} stroke={INK} strokeWidth="3" />
        <path d="M466 286 v12 M460 292 h12" stroke={WHITE} strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* Invite ticket */}
      <g className="art-float art-delay-2">
        <g transform="rotate(-4 260 360)">
          <rect x="186" y="330" width="148" height="60" rx="10" fill={RED} />
          <circle cx="186" cy="360" r="9" fill={INK} />
          <circle cx="334" cy="360" r="9" fill={INK} />
          <text x="206" y="355" fontSize="11" fontWeight="800" letterSpacing="2" fill={WHITE} style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
            INVITE
          </text>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={206 + i * 20} y="364" width="14" height="10" rx="3" fill={WHITE} opacity="0.9" />
          ))}
        </g>
      </g>
    </svg>
  );
}

function Sparkle({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return <path d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}z`} fill={fill} />;
}

/** Reset password: an open lock and its key. */
export function KeyArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-label="A lock and key">
      <g className="art-float art-slow">
        <path d="M206 196 V150 a54 54 0 0 1 108 0 v8" fill="none" stroke={PAPER} strokeWidth="22" strokeLinecap="round" />
        <rect x="170" y="190" width="180" height="150" rx="28" fill={PAPER} />
        <circle cx="260" cy="252" r="18" fill={RED} />
        <rect x="252" y="258" width="16" height="40" rx="6" fill={RED} />
        <rect x="190" y="320" width="140" height="6" rx="3" fill={INK} opacity="0.12" />
      </g>
      <g className="art-float art-delay-2">
        <g transform="rotate(-28 400 300)">
          <circle cx="366" cy="300" r="30" fill="none" stroke={RED} strokeWidth="16" />
          <rect x="392" y="292" width="92" height="16" rx="6" fill={RED} />
          <rect x="452" y="308" width="12" height="20" rx="3" fill={RED} />
          <rect x="430" y="308" width="12" height="14" rx="3" fill={RED} />
        </g>
      </g>
      <g className="art-float art-delay-1">
        <Sparkle x={108} y={120} s={16} fill={PAPER} />
        <Sparkle x={420} y={110} s={11} fill={RED} />
        <Sparkle x={130} y={316} s={10} fill={RED} />
        <Sparkle x={448} y={210} s={8} fill={PAPER} />
      </g>
    </svg>
  );
}
