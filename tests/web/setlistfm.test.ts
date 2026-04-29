import { afterEach, describe, expect, it, vi } from "vitest";

describe("setlist.fm client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("sends the JSON accept header and API key", async () => {
    vi.stubEnv("SETLISTFM_API_KEY", "setlist-key");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          artist: [{ mbid: "artist-mbid", name: "The Cure" }]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );
    const { searchSetlistFmArtist } = await import("@/lib/setlistfm");

    await expect(searchSetlistFmArtist("The Cure")).resolves.toEqual({
      mbid: "artist-mbid",
      name: "The Cure"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.setlist.fm/rest/1.0/search/artists?artistName=The+Cure&sort=relevance",
      {
        headers: {
          Accept: "application/json",
          "x-api-key": "setlist-key"
        },
        cache: "no-store"
      }
    );
  });

  it("fails clearly when the API key is missing", async () => {
    const { searchSetlistFmArtist } = await import("@/lib/setlistfm");

    await expect(searchSetlistFmArtist("The Cure")).rejects.toMatchObject({
      code: "setlistfm_api_key_missing",
      status: 500
    });
  });

  it("extracts song names from sets", async () => {
    const { extractSetlistSongNames } = await import("@/lib/setlistfm");

    expect(
      extractSetlistSongNames([
        {
          id: "1",
          url: "https://www.setlist.fm/setlist/1",
          eventDate: "01-01-2026",
          artist: { mbid: "artist-mbid", name: "The Cure" },
          sets: {
            set: [
              {
                song: [{ name: "Plainsong" }, { name: "Pictures of You" }]
              },
              {
                song: [{ name: " " }, { name: "Disintegration" }]
              }
            ]
          }
        }
      ])
    ).toEqual(["Plainsong", "Pictures of You", "Disintegration"]);
  });
});
