function decodePayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getStoredToken() {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return "";
  return token;
}

export function hasValidToken(token) {
  const payload = decodePayload(token);
  if (!payload || typeof payload !== "object") return false;

  const exp = Number(payload.exp);
  if (!Number.isFinite(exp) || exp <= 0) return false;

  return Date.now() < exp * 1000;
}

export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
}
