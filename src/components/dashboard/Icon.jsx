const PATHS = {
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-3a4 4 0 0 1 0 8m0-8a4 4 0 0 1 3 1.35A4 4 0 0 1 21 18",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  play: "M4 4v16a1 1 0 0 0 1.5.86l14-8a1 1 0 0 0 0-1.72l-14-8A1 1 0 0 0 4 4Z",
  clipboard: "M9 5h6m-8 0H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9V3Zm-1 9h8m-8 4h5",
  plus: "M12 5v14m-7-7h14",
  edit: "m16.86 3.49 3.65 3.65M4 20l3.66-.83L19.5 7.33a2.58 2.58 0 0 0-3.65-3.65L4 15.52V20Z",
  chart: "M4 19V5m0 14h16M8 16v-3m4 3V8m4 8v-6",
  user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  search: "m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8.5 13h5",
  menu: "M4 6h16M4 12h16M4 18h16",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  dots: "M6 12h.01M12 12h.01M18 12h.01",
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] || PATHS.grid} />
    </svg>
  );
}
