import { setlistFmApiKey } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const setlistFmApiBase = "https://api.setlist.fm/rest/1.0";

export type SetlistFmArtist = {
  mbid: string;
  name: string;
  sortName?: string;
  disambiguation?: string;
  url?: string;
};

type SetlistFmSong = {
  name?: string;
};

type SetlistFmSet = {
  song?: SetlistFmSong[];
};

export type SetlistFmSetlist = {
  id: string;
  url: string;
  eventDate: string;
  artist: SetlistFmArtist;
  venue?: {
    name?: string;
    city?: {
      name?: string;
      stateCode?: string;
      country?: {
        code?: string;
        name?: string;
      };
    };
  };
  sets?: {
    set?: SetlistFmSet[];
  };
};

type SetlistFmArtistSearchResponse = {
  artist?: SetlistFmArtist[];
};

type SetlistFmSetlistsResponse = {
  setlist?: SetlistFmSetlist[];
};

async function setlistFmFetch<T>(path: string): Promise<T> {
  if (!setlistFmApiKey) {
    throw new AppError(
      "Setlist.fm API key is not configured.",
      500,
      "setlistfm_api_key_missing"
    );
  }

  const response = await fetch(`${setlistFmApiBase}${path}`, {
    headers: {
      Accept: "application/json",
      "x-api-key": setlistFmApiKey
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    logger.warn("setlist.fm API request failed", {
      path,
      status: response.status,
      body
    });

    throw new AppError(
      `setlist.fm request failed with status ${response.status}.`,
      502,
      "setlistfm_request_failed"
    );
  }

  return (await response.json()) as T;
}

export async function searchSetlistFmArtist(artistName: string) {
  const params = new URLSearchParams({
    artistName,
    sort: "relevance"
  });
  const response = await setlistFmFetch<SetlistFmArtistSearchResponse>(
    `/search/artists?${params.toString()}`
  );

  return response.artist?.[0] ?? null;
}

export async function getArtistSetlists(mbid: string, limit: number) {
  const response = await setlistFmFetch<SetlistFmSetlistsResponse>(
    `/artist/${encodeURIComponent(mbid)}/setlists?p=1`
  );

  return (response.setlist ?? []).slice(0, limit);
}

export function extractSetlistSongNames(setlists: SetlistFmSetlist[]) {
  const songs: string[] = [];

  for (const setlist of setlists) {
    for (const set of setlist.sets?.set ?? []) {
      for (const song of set.song ?? []) {
        const name = song.name?.trim();
        if (name) {
          songs.push(name);
        }
      }
    }
  }

  return songs;
}
