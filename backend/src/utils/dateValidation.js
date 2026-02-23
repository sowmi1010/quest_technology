const ISO_DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,3})?)?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/;

function hasValidCalendarDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseIsoDateString(value) {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, reason: "empty" };

  const dateOnlyMatch = raw.match(ISO_DATE_ONLY_REGEX);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    if (!hasValidCalendarDate(year, month, day)) {
      return { ok: false, reason: "calendar" };
    }

    return {
      ok: true,
      date: new Date(Date.UTC(year, month - 1, day)),
      raw,
    };
  }

  const dateTimeMatch = raw.match(ISO_DATETIME_REGEX);
  if (dateTimeMatch) {
    const year = Number(dateTimeMatch[1]);
    const month = Number(dateTimeMatch[2]);
    const day = Number(dateTimeMatch[3]);

    if (!hasValidCalendarDate(year, month, day)) {
      return { ok: false, reason: "calendar" };
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return { ok: false, reason: "parse" };
    }

    return { ok: true, date, raw };
  }

  return { ok: false, reason: "format" };
}

export function parseOptionalIsoDateInput(value, fieldName = "date") {
  if (value === undefined || value === null) {
    return { ok: true, provided: false, value: undefined };
  }

  const raw = String(value).trim();
  if (!raw) {
    return { ok: true, provided: false, value: undefined };
  }

  const parsed = parseIsoDateString(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      message: `Invalid ${fieldName}. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).`,
    };
  }

  return { ok: true, provided: true, value: parsed.date, raw: parsed.raw };
}
