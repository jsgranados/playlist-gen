import { AppError } from "@/lib/errors";

function collectTitles(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectTitles);
  }

  const maybeTitle = (value as { title?: unknown }).title;
  if (typeof maybeTitle === "string" && maybeTitle.trim()) {
    return [maybeTitle.trim()];
  }

  return Object.values(value).flatMap(collectTitles);
}

export function normalizeFestivalArtists(payload: unknown) {
  const artists = Array.from(
    new Set(
      collectTitles(payload)
        .map((artist) => artist.trim())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  if (artists.length === 0) {
    throw new AppError(
      "No artist names were found in the festival lineup feed.",
      422,
      "festival_empty"
    );
  }

  return artists;
}

export async function fetchFestivalArtists(lineupUrl: string) {
  const response = await fetch(lineupUrl, {
    headers: {
      accept: "application/json"
    },
    signal: AbortSignal.timeout(8_000)
  });

  if (!response.ok) {
    throw new AppError(
      `Festival lineup request failed with status ${response.status}.`,
      502,
      "festival_fetch_failed"
    );
  }

  const payload = (await response.json()) as unknown;
  return normalizeFestivalArtists(payload);
}
