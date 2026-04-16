import { describe, expect, it } from "vitest";

import { normalizeFestivalArtists } from "@/lib/festival";

describe("festival normalization", () => {
  it("collects and sorts title fields from nested payloads", () => {
    const artists = normalizeFestivalArtists({
      a: { title: "Justice" },
      b: {
        nested: [{ title: "Khruangbin" }, { title: "Justice" }]
      }
    });

    expect(artists).toEqual(["Justice", "Khruangbin"]);
  });
});
