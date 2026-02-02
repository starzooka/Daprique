import { useMemo } from 'react';

function buildPlaceholderDataUri() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.28" />
      <stop offset="55%" stop-color="#f97316" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0.18" />
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="800" height="520" rx="28" fill="url(#g)" />
  <rect width="800" height="520" rx="28" fill="url(#r)" />

  <g opacity="0.18">
    <circle cx="660" cy="120" r="90" fill="#0ea5e9" />
    <circle cx="150" cy="390" r="120" fill="#f97316" />
    <circle cx="420" cy="280" r="150" fill="#22c55e" />
  </g>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function CategoryTile({ category, imageSrc, icon: Icon, colors, onClick }) {
  const src = useMemo(() => imageSrc || buildPlaceholderDataUri(), [imageSrc]);
  const style = colors
    ? {
        '--catFrom': colors.from,
        '--catTo': colors.to,
        '--catGlow': colors.glow,
      }
    : undefined;

  return (
    <button
      type="button"
      className="category-tile"
      onClick={onClick}
      aria-label={`Shop ${category}`}
      style={style}
    >
      {Icon ? (
        <span className="category-bg" aria-hidden="true">
          <Icon className="category-bg-icon" />
        </span>
      ) : (
        <img className="category-image" src={src} alt="" loading="lazy" />
      )}
      <span className="category-name">{category}</span>
    </button>
  );
}
