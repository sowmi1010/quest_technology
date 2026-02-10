const DEFAULT_SIZE = 20; // px
const DEFAULT_STROKE = 2;

function IconBase({
  className,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  children,
  title,
  ...rest
}) {
  const computedClass = className ?? `h-5 w-5`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={computedClass}
      width={size}
      height={size}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : "presentation"}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconArrowRight(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

export function IconBookOpen(props) {
  return (
    <IconBase {...props}>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v18H5.5A2.5 2.5 0 0 0 3 23z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v18h5.5A2.5 2.5 0 0 1 21 23z" />
    </IconBase>
  );
}

export function IconBriefcase(props) {
  return (
    <IconBase {...props}>
      <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M2.5 13h19" />
    </IconBase>
  );
}

export function IconCalculator(props) {
  return (
    <IconBase {...props}>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
      <path d="M8 6h8" />
      <path d="M8 11h2" />
      <path d="M12 11h2" />
      <path d="M16 11h0" />
      <path d="M8 15h2" />
      <path d="M12 15h2" />
      <path d="M16 15h0" />
      <path d="M8 19h8" />
    </IconBase>
  );
}

export function IconCalendar(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </IconBase>
  );
}

export function IconCheckCircle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.4 2.3 4.6-5.1" />
    </IconBase>
  );
}

export function IconClock(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconFilter(props) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </IconBase>
  );
}

export function IconSearch(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconBase>
  );
}

export function IconGraduationCap(props) {
  return (
    <IconBase {...props}>
      <path d="m2 10 10-5 10 5-10 5-10-5Z" />
      <path d="M6 12.5V16a6 6 0 0 0 12 0v-3.5" />
      <path d="M22 10v5" />
    </IconBase>
  );
}

export function IconLaptop(props) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="16" height="11" rx="2" />
      <path d="M2 18h20" />
      <path d="M9 18h6" />
    </IconBase>
  );
}

export function IconMail(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3 7 9 7 9-7" />
    </IconBase>
  );
}

export function IconMoon(props) {
  return (
    <IconBase {...props}>
      <path d="M18 15.7A7.9 7.9 0 1 1 8.3 6a7.2 7.2 0 0 0 9.7 9.7Z" />
    </IconBase>
  );
}

export function IconMapPin(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

export function IconMenu(props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function IconMessageCircle(props) {
  return (
    <IconBase {...props}>
      <path d="M20 11.2A7.9 7.9 0 0 1 12.2 19H8l-4 2v-4A7.9 7.9 0 1 1 20 11.2z" />
    </IconBase>
  );
}

export function IconPhone(props) {
  return (
    <IconBase {...props}>
      <path d="M4.8 4.8a2 2 0 0 1 2.8 0l2.1 2.1a2 2 0 0 1 .3 2.4l-1 1.6a15.6 15.6 0 0 0 4.2 4.2l1.6-1a2 2 0 0 1 2.4.3l2.1 2.1a2 2 0 0 1 0 2.8l-1 1a4 4 0 0 1-4.2 1A22 22 0 0 1 3.8 10a4 4 0 0 1 1-4.2l1-1Z" />
    </IconBase>
  );
}

export function IconQuote(props) {
  return (
    <IconBase {...props}>
      <path d="M9.5 8A4.5 4.5 0 0 0 5 12.5V16a3 3 0 0 0 3 3h2v-5H7.5v-1.5a2 2 0 0 1 2-2H10V8h-.5Z" />
      <path d="M18.5 8A4.5 4.5 0 0 0 14 12.5V16a3 3 0 0 0 3 3h2v-5h-2.5v-1.5a2 2 0 0 1 2-2h.5V8h-.5Z" />
    </IconBase>
  );
}

export function IconShield(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6.5v5.2c0 5.3 3.4 9 7 10.3 3.6-1.3 7-5 7-10.3V6.5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function IconSpark(props) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z" />
      <path d="m5 14 .8 2.1L8 17l-2.2.9L5 20l-.8-2.1L2 17l2.2-.9L5 14Z" />
      <path d="m19 14 .8 2.1L22 17l-2.2.9L19 20l-.8-2.1L16 17l2.2-.9L19 14Z" />
    </IconBase>
  );
}

export function IconSun(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </IconBase>
  );
}

export function IconStar({ className = "h-4 w-4", filled = false, size, strokeWidth, title, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth ?? DEFAULT_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size ?? 16}
      height={size ?? 16}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : "presentation"}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d="m12 3.5 2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8L12 3.5Z" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <IconBase {...props}>
      <path d="M16 20a4 4 0 0 0-8 0" />
      <circle cx="12" cy="11" r="3.5" />
      <path d="M4 20a3.5 3.5 0 0 1 3.5-3.5" />
      <path d="M20 20a3.5 3.5 0 0 0-3.5-3.5" />
    </IconBase>
  );
}

export function IconWrench(props) {
  return (
    <IconBase {...props}>
      <path d="M15.1 7.4a4 4 0 0 0-5.3 5.3L4 18.5V21h2.5l5.8-5.8a4 4 0 0 0 5.3-5.3l-2.5 2.5-2-2 2.5-2.5Z" />
    </IconBase>
  );
}

export function IconX(props) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}
