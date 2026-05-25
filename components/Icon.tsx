type IconProps = {
  name: string
  size?: number
  stroke?: number
  color?: string
  className?: string
}

export function Icon({
  name,
  size = 18,
  stroke = 1.5,
  color = "currentColor",
  className,
}: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  }

  switch (name) {
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )
    case "arrowL":
      return (
        <svg {...props}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      )
    case "arrowUR":
      return (
        <svg {...props}>
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      )
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s-8-6.9-8-12a8 8 0 1 1 16 0c0 5.1-8 12-8 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      )
    case "cal":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      )
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )
    case "users":
      return (
        <svg {...props}>
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      )
    case "luggage":
      return (
        <svg {...props}>
          <rect x="5" y="7" width="14" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M8 11h8M8 15h8" />
        </svg>
      )
    case "plane":
      return (
        <svg {...props}>
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 1 16.5 2.5L13 6 4.8 4.2l-2.4 2.4 7.6 3.7L5.9 15 4 16l1 2 2-1 1.1-4.1 3.7 7.6 2.4-2.4z" />
        </svg>
      )
    case "train":
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <path d="M4 11h16M12 3v8M8 19l-2 2M16 19l2 2M12 15h.01" />
        </svg>
      )
    case "ship":
      return (
        <svg {...props}>
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.19.62 4.15 1.62 5.86" />
          <path d="M10 11V5h4v6M12 1v4" />
        </svg>
      )
    case "briefcase":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" />
        </svg>
      )
    case "car":
      return (
        <svg {...props}>
          <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-1" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="15" cy="17" r="2" />
          <path d="M3 9l2-5h11l2 5" />
        </svg>
      )
    case "sparkle":
      return (
        <svg {...props}>
          <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
        </svg>
      )
    case "check":
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case "star":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case "phone":
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case "mail":
      return (
        <svg {...props}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    case "wa":
      return (
        <svg {...props}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    case "menu":
      return (
        <svg {...props}>
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )
    case "close":
      return (
        <svg {...props}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )
    case "chev":
      return (
        <svg {...props}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case "gauge":
      return (
        <svg {...props}>
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
          <path d="M12 12l3.5-3.5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      )
    case "coin":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5a3 3 0 0 0-5 2.2V13h4M9.5 15h4" />
        </svg>
      )
    case "baby":
      return (
        <svg {...props}>
          <circle cx="12" cy="7" r="3" />
          <path d="M9 14c0-1.66 1.34-3 3-3s3 1.34 3 3v4H9v-4z" />
          <path d="M6 20h12" />
        </svg>
      )
    case "leaf":
      return (
        <svg {...props}>
          <path d="M17 8C8 10 5.9 16.17 3.82 19.5a.5.5 0 0 0 .65.67c.97-.42 5.03-2.17 5.03-7.17 0 0 5 1 8 5 0-5-1-10-8-12z" />
        </svg>
      )
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
          <path d="M3 12h18" />
        </svg>
      )
    case "headset":
      return (
        <svg {...props}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      )
    case "fb":
      return (
        <svg {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case "insta":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case "x":
      return (
        <svg {...props}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      )
    case "li":
      return (
        <svg {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    default:
      return null
  }
}
