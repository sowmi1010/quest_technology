const ADMIN_STORAGE_KEY = "admin_profile";
const ACCESS_TOKEN_STORAGE_KEY = "admin_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "admin_refresh_token";

const BLOCKED_AUTH_FIELDS = new Set([
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
]);

function inBrowser() {
  return typeof window !== "undefined";
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function sanitizeAdmin(admin) {
  if (!admin || typeof admin !== "object" || Array.isArray(admin)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(admin).filter(([key]) => !BLOCKED_AUTH_FIELDS.has(key))
  );
}

function purgeLegacyLocalAuth() {
  if (!inBrowser()) return;
  try {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("admin");
  } catch {
    // storage may be unavailable in restricted contexts
  }
}

function getSessionItem(key) {
  if (!inBrowser()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionItem(key, value) {
  if (!inBrowser()) return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // storage may be unavailable in restricted contexts
  }
}

function removeSessionItem(key) {
  if (!inBrowser()) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // storage may be unavailable in restricted contexts
  }
}

// One-time cleanup for legacy localStorage token usage.
purgeLegacyLocalAuth();

export function getStoredAdmin() {
  const current = getSessionItem(ADMIN_STORAGE_KEY);
  if (current && current !== "undefined" && current !== "null") {
    const parsed = safeJsonParse(current);
    return parsed && typeof parsed === "object" ? parsed : {};
  }

  return {};
}

export function setStoredAdmin(admin) {
  const safe = JSON.stringify(sanitizeAdmin(admin));
  setSessionItem(ADMIN_STORAGE_KEY, safe);
  purgeLegacyLocalAuth();
}

export function getStoredAccessToken() {
  return String(getSessionItem(ACCESS_TOKEN_STORAGE_KEY) || "").trim();
}

export function setStoredAccessToken(token) {
  const value = String(token || "").trim();
  if (!value) {
    removeSessionItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  setSessionItem(ACCESS_TOKEN_STORAGE_KEY, value);
}

export function getStoredRefreshToken() {
  return String(getSessionItem(REFRESH_TOKEN_STORAGE_KEY) || "").trim();
}

export function setStoredRefreshToken(token) {
  const value = String(token || "").trim();
  if (!value) {
    removeSessionItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  setSessionItem(REFRESH_TOKEN_STORAGE_KEY, value);
}

export function clearAuthStorage() {
  removeSessionItem(ADMIN_STORAGE_KEY);
  removeSessionItem(ACCESS_TOKEN_STORAGE_KEY);
  removeSessionItem(REFRESH_TOKEN_STORAGE_KEY);
  purgeLegacyLocalAuth();
}
