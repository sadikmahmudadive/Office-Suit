// Office Suit "Button" mark (design turn 3a): a jacket front drawn as one
// closure line and one red button on a rounded tile. Colours come from the
// --logo-* tokens in globals.css so the mark flips to the light variant in dark mode.

/** At 40px and below the line and button get heavier so they stay visible. */
const SMALL_SIZE = 40;

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  const small = size <= SMALL_SIZE;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Office Suit"
    >
      <rect width="100" height="100" rx="22.4" style={{ fill: "var(--logo-field)" }} />
      {small ? (
        <>
          <rect x="53" y="0" width="8" height="100" style={{ fill: "var(--logo-line)" }} />
          <circle cx="38" cy="57" r="13" style={{ fill: "var(--logo-button)" }} />
        </>
      ) : (
        <>
          <rect x="54" y="0" width="5" height="100" style={{ fill: "var(--logo-line)" }} />
          <circle cx="42" cy="58" r="9" style={{ fill: "var(--logo-button)" }} />
        </>
      )}
    </svg>
  );
}

/** Mark plus the "Office Suit" wordmark (Archivo ExtraBold, tight tracking). */
export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="font-brand font-extrabold tracking-[-0.03em]" style={{ fontSize: size * 0.68 }}>
        Office Suit
      </span>
    </span>
  );
}
