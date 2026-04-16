import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { PlaylistSummary } from "@/lib/types";

const spotifyApiBase = "https://api.spotify.com/v1";

type SpotifyPaginatedResponse<T> = {
  items: T[];
  next: string | null;
};

type SpotifyImage = {
  url: string;
};

type SpotifyArtist = {
  name: string;
};

type SpotifyTrack = {
  uri: string;
  name: string;
  artists: SpotifyArtist[];
};

type SpotifySavedTrack = {
  track: SpotifyTrack;
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  external_urls: {
    spotify: string;
  };
};

type SpotifyPlaylistItem = {
  track: {
    uri: string | null;
  } | null;
};

type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

type SpotifyUserProfile = {
  id: string;
  display_name: string | null;
  images?: SpotifyImage[];
};

type SpotifyRecentlyPlayedItem = {
  played_at: string;
  track: SpotifyTrack;
};

function withBaseUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${spotifyApiBase}${pathOrUrl}`;
}

async function wait(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function spotifyFetch<T>(
  accessToken: string,
  pathOrUrl: string,
  init: RequestInit = {},
  attempt = 0
): Promise<T> {
  const response = await fetch(withBaseUrl(pathOrUrl), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (response.status === 429 && attempt < 3) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
    await wait((retryAfter + 1) * 1000);
    return spotifyFetch<T>(accessToken, pathOrUrl, init, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text();
    logger.warn("Spotify API request failed", {
      pathOrUrl,
      status: response.status,
      body
    });

    if (response.status === 401) {
      throw new AppError(
        "Spotify authorization expired. Please sign in again.",
        401,
        "spotify_unauthorized"
      );
    }

    throw new AppError(
      `Spotify request failed with status ${response.status}.`,
      502,
      "spotify_request_failed"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function collectPaginated<T>(
  accessToken: string,
  path: string
): Promise<T[]> {
  const collected: T[] = [];
  let nextUrl: string | null = path;

  while (nextUrl) {
    const page: SpotifyPaginatedResponse<T> = await spotifyFetch<
      SpotifyPaginatedResponse<T>
    >(accessToken, nextUrl);
    collected.push(...page.items);
    nextUrl = page.next;
  }

  return collected;
}

export async function getCurrentUserProfile(accessToken: string) {
  return spotifyFetch<SpotifyUserProfile>(accessToken, "/me");
}

export async function listCurrentUserPlaylists(
  accessToken: string
): Promise<PlaylistSummary[]> {
  const playlists = await collectPaginated<SpotifyPlaylist>(
    accessToken,
    "/me/playlists?limit=50"
  );
  const deduped = new Map<string, PlaylistSummary>();

  for (const playlist of playlists) {
    if (deduped.has(playlist.id)) {
      continue;
    }

    deduped.set(playlist.id, {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      url: playlist.external_urls.spotify
    });
  }

  return Array.from(deduped.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export async function getSavedTracks(accessToken: string) {
  return collectPaginated<SpotifySavedTrack>(accessToken, "/me/tracks?limit=50");
}

export async function getRecentlyPlayed(accessToken: string, after: number) {
  const response = await spotifyFetch<{
    items: SpotifyRecentlyPlayedItem[];
  }>(accessToken, `/me/player/recently-played?limit=50&after=${after}`);

  return response.items;
}

export async function searchTrackUri(
  accessToken: string,
  artist: string,
  track: string
) {
  const query = encodeURIComponent(`artist:${artist} track:${track}`);
  const response = await spotifyFetch<SpotifySearchResponse>(
    accessToken,
    `/search?q=${query}&type=track&limit=1`
  );

  return response.tracks.items[0] ?? null;
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  isPublic: boolean,
  description: string
) {
  return spotifyFetch<SpotifyPlaylist>(accessToken, `/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name,
      public: isPublic,
      description
    })
  });
}

export async function getPlaylistTrackUris(
  accessToken: string,
  playlistId: string
) {
  const items = await collectPaginated<SpotifyPlaylistItem>(
    accessToken,
    `/playlists/${playlistId}/tracks?fields=items(track(uri)),next&limit=100`
  );

  return new Set(
    items
      .map((item) => item.track?.uri)
      .filter((uri): uri is string => Boolean(uri))
  );
}

export async function addPlaylistItems(
  accessToken: string,
  playlistId: string,
  uris: string[]
) {
  const batches: Promise<void>[] = [];

  for (let index = 0; index < uris.length; index += 100) {
    const batch = uris.slice(index, index + 100);
    batches.push(
      spotifyFetch<void>(accessToken, `/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({
          uris: batch
        })
      })
    );
  }

  await Promise.all(batches);
}
