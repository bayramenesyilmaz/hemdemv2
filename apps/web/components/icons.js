/**
 * Uygulama genelinde kullanılan satır içi SVG ikonlar. Ek bir ikon
 * kütüphanesi bağımlılığı eklemek yerine sadece ihtiyaç duyulan ikonlar
 * burada tutuluyor — hepsi 24x24 grid, `currentColor` ile boyanır, bu
 * sayede aktif/pasif sekme renkleri CSS'ten gelir.
 */

const BASE_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function Icon({ children, className = "h-6 w-6", ...props }) {
  return (
    <svg className={className} {...BASE_PROPS} {...props}>
      {children}
    </svg>
  );
}

export function CompassIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </Icon>
  );
}

export function TestsIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <path d="m9 12 1.6 1.6L14 10.5" />
      <path d="M9.5 17.5h5" />
    </Icon>
  );
}

export function PostsIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v13H6a2 2 0 0 1-2-2z" />
      <path d="M16 8.5h2.5A1.5 1.5 0 0 1 20 10v6.5a2 2 0 0 1-2 2h-2" />
      <path d="M7.5 8h5M7.5 11.5h5M7.5 15h3" />
    </Icon>
  );
}

export function MessagesIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.4-4.2A7.5 7.5 0 1 1 20 11.5z" />
    </Icon>
  );
}

export function HeartIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z" />
    </Icon>
  );
}

export function TrophyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4.5V7A3.5 3.5 0 0 0 8 10.5" />
      <path d="M17 5.5h2.5V7A3.5 3.5 0 0 1 16 10.5" />
      <path d="M12 14v3.5M8.5 20h7" />
    </Icon>
  );
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </Icon>
  );
}

export function CoinIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M13.8 9.6a2.4 2.4 0 0 0-3.8.5c-.5 1 .1 1.9 1.5 2.2s2.2 1.1 1.7 2.2a2.4 2.4 0 0 1-3.9.4" />
      <path d="M12 7.5v9" />
    </Icon>
  );
}

export function NoteIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V14l-5 5.5H6.5A1.5 1.5 0 0 1 5 18z" />
      <path d="M19 14h-3.5a1.5 1.5 0 0 0-1.5 1.5V19" />
      <path d="M8.5 9h7M8.5 12.5h4" />
    </Icon>
  );
}

export function ShieldIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5.5 6v6c0 4 2.8 7.2 6.5 8.5 3.7-1.3 6.5-4.5 6.5-8.5V6z" />
    </Icon>
  );
}

export function HelpIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.6a2.3 2.3 0 0 1 4.4.8c0 1.6-2.2 1.9-2.2 3.3" />
      <path d="M12 17.2h.01" />
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14 5.5h3.5A1.5 1.5 0 0 1 19 7v10a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M10 15.5 6.5 12 10 8.5" />
      <path d="M6.5 12H15" />
    </Icon>
  );
}

export function SupportIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 18.5v-9A5.5 5.5 0 0 1 10 4h4a5.5 5.5 0 0 1 5.5 5.5v9" />
      <path d="M4.5 12.5h3v6h-3zM16.5 12.5h3v6h-3z" />
    </Icon>
  );
}

export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M18 9a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13 18 9z" />
      <path d="M10.5 18.5a2 2 0 0 0 3 0" />
    </Icon>
  );
}
