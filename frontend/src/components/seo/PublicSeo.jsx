import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Quest Technology";
const DEFAULT_TITLE = "Quest Technology | Skill Training Institute";
const DEFAULT_DESCRIPTION =
  "Quest Technology offers practical IT, Accounts, Mechanical, and tuition programs with placement guidance and flexible batches.";
const DEFAULT_KEYWORDS =
  "Quest Technology, skill training institute, IT courses, accounts courses, mechanical courses, tuition";
const DEFAULT_IMAGE = "/logo.jpeg";

function getBaseUrl() {
  const configured = String(import.meta?.env?.VITE_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function toAbsoluteUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const base = getBaseUrl();
  if (!base) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalized}`;
}

function upsertMeta({ name, property, content }) {
  if (!content) return;

  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;

  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    if (name) node.setAttribute("name", name);
    if (property) node.setAttribute("property", property);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function upsertCanonical(href) {
  if (!href) return;
  let node = document.head.querySelector('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
}

function upsertJsonLd(data) {
  const id = "quest-public-jsonld";
  if (!data) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    return;
  }

  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("script");
    node.id = id;
    node.type = "application/ld+json";
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

export default function PublicSeo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = "website",
  robots = "index,follow",
  canonicalPath,
  jsonLd,
}) {
  const location = useLocation();

  const fullTitle = useMemo(() => {
    if (!title) return DEFAULT_TITLE;
    if (title.includes(SITE_NAME)) return title;
    return `${title} | ${SITE_NAME}`;
  }, [title]);

  const canonicalUrl = useMemo(() => {
    const path = canonicalPath || location.pathname;
    return toAbsoluteUrl(path);
  }, [canonicalPath, location.pathname]);

  const imageUrl = useMemo(() => toAbsoluteUrl(image), [image]);

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta({ name: "description", content: description });
    upsertMeta({ name: "keywords", content: keywords });
    upsertMeta({ name: "robots", content: robots });

    upsertMeta({ property: "og:type", content: type });
    upsertMeta({ property: "og:site_name", content: SITE_NAME });
    upsertMeta({ property: "og:title", content: fullTitle });
    upsertMeta({ property: "og:description", content: description });
    upsertMeta({ property: "og:url", content: canonicalUrl });
    upsertMeta({ property: "og:image", content: imageUrl });

    upsertMeta({ name: "twitter:card", content: "summary_large_image" });
    upsertMeta({ name: "twitter:title", content: fullTitle });
    upsertMeta({ name: "twitter:description", content: description });
    upsertMeta({ name: "twitter:image", content: imageUrl });

    upsertCanonical(canonicalUrl);
    upsertJsonLd(jsonLd || null);
  }, [canonicalUrl, description, fullTitle, imageUrl, jsonLd, keywords, robots, type]);

  return null;
}
