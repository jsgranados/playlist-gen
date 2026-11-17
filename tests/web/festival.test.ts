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

  it("parses the AEG keyed-by-id feed format used by Coachella 2027", () => {
    const artists = normalizeFestivalArtists({
      "01M74MNQ70ZV00N2SYMTC3J95R": {
        _id: "01M74MNQ70ZV00N2SYMTC3J95R",
        title: "Adam Ten",
        photo_suffix: "https://media.aegamp.com/733/collection/x.webp",
        slug: "adam-ten",
        billingOrder: null
      },
      "01M74MNQ728YJK119M179XRDZA": {
        _id: "01M74MNQ728YJK119M179XRDZA",
        title: "ADÉLA",
        photo_suffix: "https://media.aegamp.com/733/collection/y.webp",
        slug: "adela",
        billingOrder: null
      }
    });

    expect(artists).toEqual(["Adam Ten", "ADÉLA"]);
  });
});
