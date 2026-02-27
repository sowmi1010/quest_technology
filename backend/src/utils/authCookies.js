const ACCESS_COOKIE_NAME = String(process.env.ACCESS_COOKIE_NAME || "qt_access").trim() || "qt_access";
const REFRESH_COOKIE_NAME = String(process.env.REFRESH_COOKIE_NAME || "qt_refresh").trim() || "qt_refresh";

function numFromEnv(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function boolFromEnv(name, fallback) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function isProdEnv() {
  return String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
}

function parseUrlHostname(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    return String(new URL(raw).hostname || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function isLoopbackHost(hostname = "") {
  const host = String(hostname || "").trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function shouldDefaultToCrossSiteCookies() {
  if (!isProdEnv()) return false;

  const publicHost = parseUrlHostname(process.env.PUBLIC_APP_URL);
  if (!publicHost) return false;

  return !isLoopbackHost(publicHost);
}

function getSameSite() {
  const raw = String(process.env.AUTH_COOKIE_SAME_SITE || "").trim().toLowerCase();
  if (raw === "strict" || raw === "none") return raw;
  if (raw === "lax") return "lax";

  if (shouldDefaultToCrossSiteCookies()) {
    return "none";
  }

  return "lax";
}

function getCookieSecure() {
  return boolFromEnv("AUTH_COOKIE_SECURE", isProdEnv());
}

function getCommonCookieOptions() {
  const sameSite = getSameSite();
  const secure = sameSite === "none" ? true : getCookieSecure();
  return {
    httpOnly: true,
    secure,
    sameSite,
  };
}

function getAccessCookieOptions() {
  return {
    ...getCommonCookieOptions(),
    path: "/",
    maxAge: numFromEnv("ACCESS_COOKIE_MAX_AGE_MS", 15 * 60 * 1000),
  };
}

function getRefreshCookieOptions() {
  return {
    ...getCommonCookieOptions(),
    path: "/api/auth",
    maxAge: numFromEnv("REFRESH_COOKIE_MAX_AGE_MS", 7 * 24 * 60 * 60 * 1000),
  };
}

export function setAuthCookies(res, tokens) {
  if (tokens?.accessToken) {
    res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, getAccessCookieOptions());
  }
  if (tokens?.refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getRefreshCookieOptions());
  }
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    ...getCommonCookieOptions(),
    path: "/",
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getCommonCookieOptions(),
    path: "/api/auth",
  });
}

function parseCookieHeader(header) {
  if (!header) return {};

  return String(header)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const eqIndex = entry.indexOf("=");
      if (eqIndex <= 0) return acc;

      const key = entry.slice(0, eqIndex).trim();
      const value = entry.slice(eqIndex + 1).trim();
      if (!key) return acc;

      try {
        acc[key] = decodeURIComponent(value);
      } catch {
        acc[key] = value;
      }

      return acc;
    }, {});
}

export function getCookieValue(req, name) {
  const cookies = parseCookieHeader(req?.headers?.cookie || "");
  return String(cookies[name] || "");
}

export const AUTH_COOKIE_NAMES = {
  access: ACCESS_COOKIE_NAME,
  refresh: REFRESH_COOKIE_NAME,
};
