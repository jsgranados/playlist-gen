import { afterEach, describe, expect, it, vi } from "vitest";

import { listCurrentUserPlaylists } from "@/lib/spotify-api";

describe("listCurrentUserPlaylists", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deduplicates playlists with the same Spotify id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "05nrbCDo3w4u1ECaHZ4z63",
              name: "Festival Finds",
              description: null,
              external_urls: {
                spotify: "https://open.spotify.com/playlist/05nrbCDo3w4u1ECaHZ4z63"
              }
            },
            {
              id: "05nrbCDo3w4u1ECaHZ4z63",
              name: "Festival Finds",
              description: null,
              external_urls: {
                spotify: "https://open.spotify.com/playlist/05nrbCDo3w4u1ECaHZ4z63"
              }
            },
            {
              id: "2",
              name: "Late Night",
              description: "after hours",
              external_urls: {
                spotify: "https://open.spotify.com/playlist/2"
              }
            }
          ],
          next: null
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    await expect(listCurrentUserPlaylists("token")).resolves.toEqual([
      {
        id: "05nrbCDo3w4u1ECaHZ4z63",
        name: "Festival Finds",
        description: null,
        url: "https://open.spotify.com/playlist/05nrbCDo3w4u1ECaHZ4z63"
      },
      {
        id: "2",
        name: "Late Night",
        description: "after hours",
        url: "https://open.spotify.com/playlist/2"
      }
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
