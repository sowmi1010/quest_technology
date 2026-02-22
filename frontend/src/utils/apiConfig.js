const FALLBACK_API_ORIGIN = "http://localhost:5000";

function trimTrailingSlash(value = "") {
  return String(value).replace(/\/+$/, "");
}

function originFromBase(base = "") {
  if (!base) return "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}

const envApiOrigin = trimTrailingSlash(import.meta.env.VITE_API_ORIGIN || "");
const envApiBase = trimTrailingSlash(import.meta.env.VITE_API_BASE || "");

export const API_ORIGIN =
  envApiOrigin || originFromBase(envApiBase) || FALLBACK_API_ORIGIN;

export const API_BASE = envApiBase || `${API_ORIGIN}/api`;

export function resolveAssetUrl(path = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
