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

function runtimeOrigin() {
  if (typeof window === "undefined") return "";
  return trimTrailingSlash(window.location?.origin || "");
}

const envApiOrigin = trimTrailingSlash(import.meta.env.VITE_API_ORIGIN || "");
const envApiBase = trimTrailingSlash(import.meta.env.VITE_API_BASE || "");

function resolveApiBase() {
  if (envApiBase) return envApiBase;
  if (envApiOrigin) return `${envApiOrigin}/api`;

  throw new Error(
    "API not configured: set VITE_API_BASE (recommended) or VITE_API_ORIGIN."
  );
}

export const API_BASE = resolveApiBase();

function resolveApiOrigin() {
  if (envApiOrigin) return envApiOrigin;

  const originFromConfiguredBase = originFromBase(API_BASE);
  if (originFromConfiguredBase) return originFromConfiguredBase;

  const originFromRuntime = runtimeOrigin();
  if (originFromRuntime) return originFromRuntime;

  throw new Error(
    "API origin could not be resolved. Set VITE_API_ORIGIN for absolute asset URLs."
  );
}

export const API_ORIGIN = resolveApiOrigin();

export function resolveAssetUrl(path = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
