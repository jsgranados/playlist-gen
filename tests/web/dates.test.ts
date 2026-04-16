import { describe, expect, it } from "vitest";

import { isWithinRange, parseFlexibleDate, toSpotifyTimestampMs } from "@/lib/dates";

describe("date helpers", () => {
  it("parses ISO dates into UTC", () => {
    const parsed = parseFlexibleDate("2025-03-08T14:30:00-05:00");
    expect(parsed.toUTC().toISO()).toBe("2025-03-08T19:30:00.000Z");
  });

  it("parses SQL-like dates with a provided timezone", () => {
    const parsed = parseFlexibleDate("2025-03-08 14:30:00", "America/New_York");
    expect(parsed.toUTC().hour).toBe(19);
  });

  it("filters ranges inclusively", () => {
    const start = parseFlexibleDate("2025-03-08T00:00:00Z");
    const end = parseFlexibleDate("2025-03-08T23:59:59Z");
    const candidate = parseFlexibleDate("2025-03-08T12:00:00Z");
    expect(isWithinRange(candidate, start, end)).toBe(true);
  });

  it("converts to Spotify milliseconds", () => {
    expect(toSpotifyTimestampMs("2025-03-08T00:00:00Z")).toBe(1741392000000);
  });
});
