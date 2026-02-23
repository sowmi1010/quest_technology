const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePaginationParams(query = {}, opts = {}) {
  const defaultPage = toPositiveInt(opts.defaultPage, DEFAULT_PAGE);
  const defaultLimit = toPositiveInt(opts.defaultLimit, DEFAULT_LIMIT);
  const maxLimit = toPositiveInt(opts.maxLimit, MAX_LIMIT);

  const page = toPositiveInt(query.page, defaultPage);
  const requestedLimit = toPositiveInt(query.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPagination(total, page, limit) {
  const totalItems = Number(total || 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, limit)));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    limit,
    total: totalItems,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}

export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseSortToken(
  rawSort,
  allowedSortMap,
  fallbackToken
) {
  const token = String(rawSort || "").trim();
  if (token && allowedSortMap[token]) return allowedSortMap[token];
  return allowedSortMap[fallbackToken] || {};
}

export function parseBooleanFlag(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return false;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}
