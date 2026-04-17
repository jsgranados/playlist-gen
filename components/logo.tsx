export function Logo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <LogoMark />
      </span>
      {showWordmark ? <span className="brand-wordmark">Crate</span> : null}
    </span>
  );
}

export function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="3.2" rx="1.4" fill="#0b0d10" />
      <rect x="3" y="10.4" width="13" height="3.2" rx="1.4" fill="#0b0d10" />
      <rect x="3" y="15.8" width="16" height="3.2" rx="1.4" fill="#0b0d10" />
    </svg>
  );
}
