import { DateTime } from "luxon";

import { AppError } from "@/lib/errors";

const supportedFormats = [
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm",
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "LLLL d, yyyy"
];

export function parseFlexibleDate(
  value: string | number | Date,
  timezone = "UTC"
): DateTime {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toUTC();
  }

  if (typeof value === "number") {
    const milliseconds = value > 1e11 ? value : value * 1000;
    return DateTime.fromMillis(milliseconds).toUTC();
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new AppError("Date value cannot be empty.", 422, "invalid_date");
  }

  const iso = DateTime.fromISO(trimmed, { setZone: true });
  if (iso.isValid) {
    return iso.toUTC();
  }

  const sql = DateTime.fromSQL(trimmed, { zone: timezone });
  if (sql.isValid) {
    return sql.toUTC();
  }

  for (const format of supportedFormats) {
    const parsed = DateTime.fromFormat(trimmed, format, { zone: timezone });
    if (parsed.isValid) {
      return parsed.toUTC();
    }
  }

  throw new AppError(
    `Unable to parse date value "${trimmed}".`,
    422,
    "invalid_date"
  );
}

export function isWithinRange(
  value: DateTime,
  start: DateTime,
  end?: DateTime
) {
  if (value < start) {
    return false;
  }

  if (end && value > end) {
    return false;
  }

  return true;
}

export function toSpotifyTimestampMs(value: string) {
  return parseFlexibleDate(value).toMillis();
}

export function datetimeLocalToIso(value: string) {
  return value ? new Date(value).toISOString() : "";
}
