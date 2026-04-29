import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/setlistfm", () => ({
  extractSetlistSongNames: vi.fn(),
  getArtistSetlists: vi.fn(),
  searchSetlistFmArtist: vi.fn()
}));

vi.mock("@/lib/spotify-api", () => ({
  addPlaylistItems: vi.fn(),
  createPlaylist: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  getPlaylistTrackUris: vi.fn(),
  getRecentlyPlayed: vi.fn(),
  getSavedTracks: vi.fn(),
  searchTrackUri: vi.fn()
}));

import {
  extractSetlistSongNames,
  getArtistSetlists,
  searchSetlistFmArtist
} from "@/lib/setlistfm";
import { runSetlistWorkflow } from "@/lib/playlist-workflows";
import {
  addPlaylistItems,
  createPlaylist,
  getCurrentUserProfile,
  searchTrackUri
} from "@/lib/spotify-api";

describe("runSetlistWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dedupes setlist songs and reports unmatched songs", async () => {
    vi.mocked(searchSetlistFmArtist).mockResolvedValue({
      mbid: "artist-mbid",
      name: "The Cure"
    });
    vi.mocked(getArtistSetlists).mockResolvedValue([
      {
        id: "1",
        url: "https://www.setlist.fm/setlist/1",
        eventDate: "01-01-2026",
        artist: { mbid: "artist-mbid", name: "The Cure" }
      }
    ]);
    vi.mocked(extractSetlistSongNames).mockReturnValue([
      "Plainsong",
      "Pictures of You",
      "plainsong"
    ]);
    vi.mocked(searchTrackUri).mockImplementation(async (_accessToken, _artist, track) => {
      if (track === "Pictures of You") {
        return null;
      }

      return {
        uri: "spotify:track:plainsong",
        name: "Plainsong",
        artists: [{ name: "The Cure" }]
      };
    });
    vi.mocked(getCurrentUserProfile).mockResolvedValue({
      id: "user-id",
      display_name: "User"
    });
    vi.mocked(createPlaylist).mockResolvedValue({
      id: "playlist-id",
      name: "The Cure live set",
      description: "Setlist playlist generated with Playlist Generator",
      external_urls: {
        spotify: "https://open.spotify.com/playlist/playlist-id"
      }
    });
    vi.mocked(addPlaylistItems).mockResolvedValue(undefined);

    await expect(
      runSetlistWorkflow("token", {
        artistName: "the cure",
        setlistLimit: 5,
        destination: {
          destinationMode: "new",
          newPlaylistName: "The Cure live set",
          newPlaylistPublic: false
        }
      })
    ).resolves.toMatchObject({
      workflow: "setlist",
      counts: {
        candidates: 2,
        matched: 1,
        added: 1,
        existing: 0,
        skipped: 1
      },
      warnings: ["Some setlist songs could not be matched to Spotify catalog items."],
      details: {
        selectedArtist: "The Cure",
        setlistCount: 1,
        unmatchedTracks: [{ artist: "The Cure", track: "Pictures of You" }]
      }
    });

    expect(getArtistSetlists).toHaveBeenCalledWith("artist-mbid", 5);
    expect(searchTrackUri).toHaveBeenCalledTimes(2);
    expect(addPlaylistItems).toHaveBeenCalledWith("token", "playlist-id", [
      "spotify:track:plainsong"
    ]);
  });
});
