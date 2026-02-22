import { API_ORIGIN } from "./apiConfig";

export const PUBLIC_CONTACT = {
  phoneDisplay: "+91 98765 43210",
  phoneE164: "+919876543210",
  whatsapp: "https://wa.me/919876543210",
  email: "info@quest.com",
  location: "Tamil Nadu, India",
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
