// Íconos SVG en línea (sin librerías externas para mantener la app ligera).
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const IconBrujula = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8l-2.2 5.8L8 16l2.2-5.8z" />
  </svg>
);

export const IconCheck = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 12.5l3 3 5-6" />
  </svg>
);

export const IconRobot = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 8V4M9 13h.01M15 13h.01M9.5 16.5h5" />
    <circle cx="12" cy="3.5" r="1" />
  </svg>
);

export const IconCalendario = (props) => (
  <svg {...base} strokeWidth={2} {...props}>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M8 2v4M16 2v4M3 10h18M9 16l2 2 4-4" />
  </svg>
);

export const IconCandado = (props) => (
  <svg {...base} strokeWidth={2} {...props}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export const IconLupa = (props) => (
  <svg {...base} strokeWidth={2} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);

export const IconLibro = (props) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
    <path d="M4 10l16 3v28L4 38z" fill="#0f7c80" />
    <path d="M44 10L28 13v28l16-3z" fill="#0b5358" />
    <path d="M20 13h8v28h-8z" fill="#3fb6b3" />
    <path d="M8 16l8 1.5M8 22l8 1.5M8 28l8 1.5" stroke="#d9f1ef" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
