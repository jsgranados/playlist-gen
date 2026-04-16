"use client";

import { useEffect, useState } from "react";

import type {
  PlaylistDestinationState,
  PlaylistSummary
} from "@/lib/types";

export function PlaylistDestinationFields({
  value,
  onChange
}: {
  value: PlaylistDestinationState;
  onChange: (next: PlaylistDestinationState) => void;
}) {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (value.destinationMode !== "existing" || playlists.length > 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    void fetch("/api/spotify/playlists", {
      credentials: "same-origin"
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          error?: string;
          playlists?: PlaylistSummary[];
        };

        if (!response.ok || !payload.playlists) {
          throw new Error(payload.error ?? "Unable to load playlists.");
        }

        setPlaylists(payload.playlists);
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load playlists."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- isLoading is guarded inside the effect to prevent duplicate fetches
  }, [playlists.length, value.destinationMode]);

  return (
    <fieldset className="destination-fieldset">
      <legend>Playlist destination</legend>

      <div className="toggle-row">
        <label className="choice-chip">
          <input
            checked={value.destinationMode === "new"}
            name="destination-mode"
            onChange={() => {
              onChange({
                ...value,
                destinationMode: "new"
              });
            }}
            type="radio"
          />
          <span>Create new playlist</span>
        </label>

        <label className="choice-chip">
          <input
            checked={value.destinationMode === "existing"}
            name="destination-mode"
            onChange={() => {
              onChange({
                ...value,
                destinationMode: "existing"
              });
            }}
            type="radio"
          />
          <span>Append to existing</span>
        </label>
      </div>

      {value.destinationMode === "new" ? (
        <div className="field-grid two-col">
          <label className="field">
            <span>Playlist name</span>
            <input
              onChange={(event) => {
                onChange({
                  ...value,
                  newPlaylistName: event.target.value
                });
              }}
              placeholder="Desert set discoveries"
              type="text"
              value={value.newPlaylistName}
            />
          </label>

          <div className="field">
            <span>Visibility</span>
            <label className="switch">
              <input
                checked={value.newPlaylistPublic}
                onChange={(event) => {
                  onChange({
                    ...value,
                    newPlaylistPublic: event.target.checked
                  });
                }}
                type="checkbox"
              />
              <span>{value.newPlaylistPublic ? "Public playlist" : "Private playlist"}</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="field-grid">
          <label className="field">
            <span>Existing playlist</span>
            <select
              onChange={(event) => {
                onChange({
                  ...value,
                  existingPlaylistId: event.target.value
                });
              }}
              value={value.existingPlaylistId}
            >
              <option value="">Select a playlist</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
            <small>
              {isLoading
                ? "Loading your playlists..."
                : loadError ?? "Choose from your Spotify playlists or paste an ID below."}
            </small>
          </label>

          <label className="field">
            <span>Manual playlist ID fallback</span>
            <input
              onChange={(event) => {
                onChange({
                  ...value,
                  existingPlaylistId: event.target.value
                });
              }}
              placeholder="37i9dQZF1DXcBWIGoYBM5M"
              type="text"
              value={value.existingPlaylistId}
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}
