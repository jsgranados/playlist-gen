import { parseFlexibleDate, isWithinRange, toSpotifyTimestampMs } from "@/lib/dates";
import { defaultFestivalUrl } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { fetchFestivalArtists } from "@/lib/festival";
import {
  extractSetlistSongNames,
  getArtistSetlists,
  searchSetlistFmArtist
} from "@/lib/setlistfm";
import {
  addPlaylistItems,
  createPlaylist,
  getCurrentUserProfile,
  getPlaylistTrackUris,
  getRecentlyPlayed,
  getSavedTracks,
  searchTrackUri
} from "@/lib/spotify-api";
import { PlaylistDestinationInput, WorkflowResult } from "@/lib/types";

type ResolvedPlaylist = {
  id: string;
  name: string;
  url: string;
  isNew: boolean;
  visibility: "public" | "private";
};

type AddSummary = {
  added: number;
  existing: number;
};

function uniqueTrackUris(uris: string[]) {
  return Array.from(new Set(uris));
}

async function resolvePlaylistDestination(
  accessToken: string,
  destination: PlaylistDestinationInput,
  workflowLabel: string
): Promise<ResolvedPlaylist> {
  if (destination.destinationMode === "existing" && destination.existingPlaylistId) {
    return {
      id: destination.existingPlaylistId,
      name: "Existing playlist",
      url: `https://open.spotify.com/playlist/${destination.existingPlaylistId}`,
      isNew: false,
      visibility: "private"
    };
  }

  if (!destination.newPlaylistName) {
    throw new AppError(
      "A playlist name is required when creating a new playlist.",
      422,
      "playlist_name_required"
    );
  }

  const user = await getCurrentUserProfile(accessToken);
  const created = await createPlaylist(
    accessToken,
    user.id,
    destination.newPlaylistName,
    destination.newPlaylistPublic,
    `${workflowLabel} playlist generated with Playlist Generator`
  );

  return {
    id: created.id,
    name: created.name,
    url: created.external_urls.spotify,
    isNew: true,
    visibility: destination.newPlaylistPublic ? "public" : "private"
  };
}

async function addTracksWithDedupe(
  accessToken: string,
  playlistId: string,
  uris: string[],
  isNew: boolean
): Promise<AddSummary> {
  const uniqueUris = uniqueTrackUris(uris);
  const existingUris = isNew
    ? new Set<string>()
    : await getPlaylistTrackUris(accessToken, playlistId);
  const newUris = uniqueUris.filter((uri) => !existingUris.has(uri));

  if (newUris.length > 0) {
    await addPlaylistItems(accessToken, playlistId, newUris);
  }

  return {
    added: newUris.length,
    existing: uniqueUris.length - newUris.length
  };
}

export async function runFestivalWorkflow(
  accessToken: string,
  input: {
    lineupUrl?: string;
    destination: PlaylistDestinationInput;
  }
): Promise<WorkflowResult> {
  const lineupUrl = input.lineupUrl || defaultFestivalUrl;
  const artists = await fetchFestivalArtists(lineupUrl);
  const artistSet = new Set(artists.map((artist) => artist.toLowerCase()));
  const savedTracks = await getSavedTracks(accessToken);
  const matchingUris = savedTracks
    .filter((item) =>
      item.track.artists.some((artist) => artistSet.has(artist.name.toLowerCase()))
    )
    .map((item) => item.track.uri);
  const playlist = await resolvePlaylistDestination(
    accessToken,
    input.destination,
    "Festival lineup"
  );
  const addSummary = await addTracksWithDedupe(accessToken, playlist.id, matchingUris, playlist.isNew);

  return {
    workflow: "festival",
    playlist,
    counts: {
      candidates: savedTracks.length,
      matched: uniqueTrackUris(matchingUris).length,
      added: addSummary.added,
      existing: addSummary.existing,
      skipped: savedTracks.length - addSummary.added
    },
    warnings:
      matchingUris.length === 0
        ? ["No liked tracks matched the artists in this lineup."]
        : [],
    details: {
      artistCount: artists.length,
      lineupUrl
    }
  };
}

function normalizeSongName(name: string) {
  return name.trim().toLowerCase();
}

export async function runRecentWorkflow(
  accessToken: string,
  input: {
    startAt: string;
    endAt?: string;
    destination: PlaylistDestinationInput;
  }
): Promise<WorkflowResult> {
  const startAt = parseFlexibleDate(input.startAt);
  const endAt = input.endAt ? parseFlexibleDate(input.endAt) : undefined;
  const recentItems = await getRecentlyPlayed(accessToken, toSpotifyTimestampMs(input.startAt));
  const filtered = recentItems.filter((item) =>
    isWithinRange(parseFlexibleDate(item.played_at), startAt, endAt)
  );
  const playlist = await resolvePlaylistDestination(
    accessToken,
    input.destination,
    "Recent plays"
  );
  const trackUris = filtered.map((item) => item.track.uri);
  const addSummary = await addTracksWithDedupe(accessToken, playlist.id, trackUris, playlist.isNew);

  return {
    workflow: "recent",
    playlist,
    counts: {
      candidates: filtered.length,
      matched: uniqueTrackUris(trackUris).length,
      added: addSummary.added,
      existing: addSummary.existing,
      skipped: filtered.length - addSummary.added
    },
    warnings: [
      "Spotify only exposes up to the 50 most recently played tracks for this workflow."
    ],
    details: {
      note: endAt
        ? `Filtered recent plays between ${startAt.toISO()} and ${endAt.toISO()}.`
        : `Filtered recent plays after ${startAt.toISO()}.`
    }
  };
}

export async function runSetlistWorkflow(
  accessToken: string,
  input: {
    artistName: string;
    setlistLimit: number;
    destination: PlaylistDestinationInput;
  }
): Promise<WorkflowResult> {
  const artist = await searchSetlistFmArtist(input.artistName);

  if (!artist) {
    throw new AppError(
      "No setlist.fm artist matched that name.",
      404,
      "setlist_artist_not_found"
    );
  }

  const setlists = await getArtistSetlists(artist.mbid, input.setlistLimit);
  const songNames = extractSetlistSongNames(setlists);
  const uniqueSongs = new Map<string, string>();

  for (const songName of songNames) {
    const key = normalizeSongName(songName);
    if (!uniqueSongs.has(key)) {
      uniqueSongs.set(key, songName);
    }
  }

  const lookupEntries = await Promise.all(
    Array.from(uniqueSongs, async ([key, songName]) => {
      const track = await searchTrackUri(
        accessToken,
        artist.name,
        songName
      );
      return [key, track?.uri ?? null] as const;
    })
  );
  const lookupCache = new Map(lookupEntries);

  const unmatchedTracks: Array<{ artist: string; track: string }> = [];
  const matchedUris: string[] = [];

  for (const [key, songName] of uniqueSongs) {
    const uri = lookupCache.get(key);

    if (uri) {
      matchedUris.push(uri);
      continue;
    }

    if (unmatchedTracks.length < 10) {
      unmatchedTracks.push({
        artist: artist.name,
        track: songName
      });
    }
  }

  const playlist = await resolvePlaylistDestination(
    accessToken,
    input.destination,
    "Setlist"
  );
  const addSummary = await addTracksWithDedupe(accessToken, playlist.id, matchedUris, playlist.isNew);

  return {
    workflow: "setlist",
    playlist,
    counts: {
      candidates: uniqueSongs.size,
      matched: uniqueTrackUris(matchedUris).length,
      added: addSummary.added,
      existing: addSummary.existing,
      skipped: uniqueSongs.size - addSummary.added
    },
    warnings:
      unmatchedTracks.length > 0
        ? ["Some setlist songs could not be matched to Spotify catalog items."]
        : [],
    details: {
      note: `Scanned ${setlists.length} recent setlists for ${artist.name}.`,
      selectedArtist: artist.name,
      setlistCount: setlists.length,
      unmatchedTracks
    }
  };
}
