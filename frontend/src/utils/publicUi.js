import { API_ORIGIN } from "./apiConfig";

const DEFAULT_PUBLIC_CONTACT = {
  phoneDisplay: "+91 6382 768 882",
  phoneE164: "+916382768882",
  phoneDisplaySecondary: "+91 93601 99379",
  phoneE164Secondary: "+919360199379",
  email: "admin@questtechnologies.com",
  location: "102, Second Floor, Nehru Bazaar, Avadi, Chennai-600054",
  twitter: "https://x.com/ask_questtech",
  instagram: "https://www.instagram.com/askquesttech?igsh=cHAyNmtyYzNnM2tv",
};

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

function readContactValueWithDefault(runtimeKey, envKey, fallback = "") {
  const value = readContactValue(runtimeKey, envKey);
  return value || String(fallback || "").trim();
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

function normalizeExternalUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
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
  configuredPhoneE164 || configuredPhoneDisplay || DEFAULT_PUBLIC_CONTACT.phoneE164
);

const configuredPhoneDisplaySecondary = readContactValue(
  "phoneDisplaySecondary",
  "VITE_PUBLIC_CONTACT_PHONE_DISPLAY_SECONDARY"
);
const configuredPhoneE164Secondary = readContactValue(
  "phoneE164Secondary",
  "VITE_PUBLIC_CONTACT_PHONE_E164_SECONDARY"
);
const normalizedPhoneE164Secondary = normalizePhoneE164(
  configuredPhoneE164Secondary ||
    configuredPhoneDisplaySecondary ||
    DEFAULT_PUBLIC_CONTACT.phoneE164Secondary
);

const configuredWhatsapp = readContactValue(
  "whatsapp",
  "VITE_PUBLIC_CONTACT_WHATSAPP"
);
const configuredTwitter = readContactValueWithDefault(
  "twitter",
  "VITE_PUBLIC_CONTACT_TWITTER",
  DEFAULT_PUBLIC_CONTACT.twitter
);
const configuredInstagram = readContactValueWithDefault(
  "instagram",
  "VITE_PUBLIC_CONTACT_INSTAGRAM",
  DEFAULT_PUBLIC_CONTACT.instagram
);

export const PUBLIC_CONTACT = {
  phoneDisplay:
    configuredPhoneDisplay ||
    DEFAULT_PUBLIC_CONTACT.phoneDisplay ||
    normalizedPhoneE164,
  phoneE164: normalizedPhoneE164,
  phoneDisplaySecondary:
    configuredPhoneDisplaySecondary ||
    DEFAULT_PUBLIC_CONTACT.phoneDisplaySecondary ||
    normalizedPhoneE164Secondary,
  phoneE164Secondary: normalizedPhoneE164Secondary,
  whatsapp: resolveWhatsappUrl(configuredWhatsapp, normalizedPhoneE164),
  email: readContactValueWithDefault(
    "email",
    "VITE_PUBLIC_CONTACT_EMAIL",
    DEFAULT_PUBLIC_CONTACT.email
  ),
  location: readContactValueWithDefault(
    "location",
    "VITE_PUBLIC_CONTACT_LOCATION",
    DEFAULT_PUBLIC_CONTACT.location
  ),
  twitter: normalizeExternalUrl(configuredTwitter),
  instagram: normalizeExternalUrl(configuredInstagram),
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
