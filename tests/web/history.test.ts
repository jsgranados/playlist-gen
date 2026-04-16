import { describe, expect, it } from "vitest";

import { parseHistoryUpload } from "@/lib/history";

describe("history parsing", () => {
  it("accepts valid streaming history rows", () => {
    const rows = parseHistoryUpload(
      JSON.stringify([
        {
          artistName: "Fred again..",
          trackName: "places to be",
          endTime: "2025-03-08 14:30"
        }
      ])
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.artistName).toBe("Fred again..");
  });

  it("rejects invalid payloads", () => {
    expect(() => parseHistoryUpload(JSON.stringify({ nope: true }))).toThrowError(
      "Spotify history uploads must contain a JSON array."
    );
  });
});
