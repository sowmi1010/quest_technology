import { API_ORIGIN } from "./apiConfig";

function readRuntimeContactValue(key) {
  if (typeof window === "undefined") return "";

  const config = window.__QUEST_PUBLIC_CONTACT__;
  if (!config || typeof config !== "object") return "";

  const value = config[key];
  return typeof value === "string" ? value.trim() : "";
}

function readEnvValue(key) {
  return String(import.meta?.env?.[key] || "").trim();
}

function readContactValue(runtimeKey, envKey) {
  return readRuntimeContactValue(runtimeKey) || readEnvValue(envKey);
}

function normalizePhoneE164(value = "") {
  const raw = String(value).trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  return `+${digits}`;
}

function resolveWhatsappUrl(value = "", phoneE164 = "") {
  const raw = String(value).trim();
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw;
    const digits = raw.replace(/\D/g, "");
    if (digits) return `https://wa.me/${digits}`;
  }

  const phoneDigits = String(phoneE164).replace(/\D/g, "");
  return phoneDigits ? `https://wa.me/${phoneDigits}` : "";
}

const configuredPhoneDisplay = readContactValue(
  "phoneDisplay",
  "VITE_PUBLIC_CONTACT_PHONE_DISPLAY"
);
const configuredPhoneE164 = readContactValue(
  "phoneE164",
  "VITE_PUBLIC_CONTACT_PHONE_E164"
);
const normalizedPhoneE164 = normalizePhoneE164(
  configuredPhoneE164 || configuredPhoneDisplay
);
const configuredWhatsapp = readContactValue(
  "whatsapp",
  "VITE_PUBLIC_CONTACT_WHATSAPP"
);

export const PUBLIC_CONTACT = {
  phoneDisplay: configuredPhoneDisplay || normalizedPhoneE164,
  phoneE164: normalizedPhoneE164,
  whatsapp: resolveWhatsappUrl(configuredWhatsapp, normalizedPhoneE164),
  email: readContactValue("email", "VITE_PUBLIC_CONTACT_EMAIL"),
  location: readContactValue("location", "VITE_PUBLIC_CONTACT_LOCATION"),
};

export const INSTALLMENT_START = 5000;

export const getPublicImageUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
};

export const formatINR = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Rs 0";
  return `Rs ${amount.toLocaleString("en-IN")}`;
};
