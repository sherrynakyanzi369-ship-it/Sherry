const PATHS = {
  cart: 'M6 7h12l1 13H5L6 7zm3 0a3 3 0 0 1 6 0',
  heart: 'M12 20s-7-4.3-9.2-8.6C1.3 8.4 3 5 6.2 5c2 0 3.3 1 4.1 2.4l1.7 2.6 1.7-2.6C14.5 6 15.8 5 17.8 5 21 5 22.7 8.4 21.2 11.4 19 15.7 12 20 12 20z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM21 21l-5.2-5.2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  star: 'M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3z',
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm9 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6l8-3z',
  leaf: 'M6 20C6 10 12 5 21 4c0 10-5 16-13 16H6zm0 0c2-4 5-7 9-9',
  headset: 'M4 13v-2a8 8 0 0 1 16 0v2m-16 0v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2zm16 0v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5m0 3v.5M12 3l9.5 17h-19L12 3z',
  chevron: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  trash: 'M5 7h14M10 7V5h4v2m-7 0l1 13h8l1-13',
  eye: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zm10 2.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  arrowRight: 'M4 12h16m-6-6l6 6-6 6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zm7 10l.9 2.6L22.5 17l-2.6.9L19 20.5l-.9-2.6L15.5 17l2.6-.9L19 13z',
  gift: 'M4 10h16v10H4zM4 7h16v3H4zm8 3v10m-2.5-10a2.5 2.5 0 1 1 1.8-4.3L12 7l1.7-1.3A2.5 2.5 0 1 1 14.5 10z',
  tag: 'M4 4h7l9 9-7 7-9-9V4zm4 5h.01',
  phone: 'M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v5l3.5 2',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0l9 5 9-5m-9 5v9',
  flask: 'M9 3h6m-5 0v5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L13 8V3',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.2 6.8h.01',
  facebook: 'M14 8h3V4.5h-3A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v7H14v-7h2.8l.7-3.5H14V8z',
  twitter: 'M3 4h4.6l4.6 6.3L17.4 4H21l-6.9 8L21.4 20h-4.6l-4.9-6.7L6.4 20H3l7.3-8.4L3 4z',
  whatsapp: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm-3.2 5.6c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .6.5s.7 1.7.7 1.8c0 .1 0 .3-.1.4l-.5.7c-.1.2-.2.3-.1.5a7 7 0 0 0 3.3 2.8c.2.1.4.1.5-.1l.8-.9c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3a1.7 1.7 0 0 1-.3 1.2 3.4 3.4 0 0 1-2.3 1.4 5.6 5.6 0 0 1-2.9-.6 9.3 9.3 0 0 1-4.4-4.4 4 4 0 0 1-.8-2.3 3 3 0 0 1 1.5-2z',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4m-3-4l-4-4 4-4m-4 4h9',
  plus: 'M12 5v14M5 12h14',
  minus: 'M6 12h12',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4',
  droplet: 'M12 3s6.5 6.6 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z',
};

export function Icon({ name, size = 20, filled = false, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] ?? PATHS.sparkle} />
    </svg>
  );
}

export function Stars({ rating, size = 14 }) {
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={`g${i}-${Math.round(rating * 10)}`}>
              <stop offset={`${Math.max(0, Math.min(1, rating - i + 1)) * 100}%`} stopColor="#ff862f" />
              <stop offset={`${Math.max(0, Math.min(1, rating - i + 1)) * 100}%`} stopColor="#ffd0aa" />
            </linearGradient>
          </defs>
          <path
            d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3z"
            fill={`url(#g${i}-${Math.round(rating * 10)})`}
          />
        </svg>
      ))}
    </span>
  );
}
