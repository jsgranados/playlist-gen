"use client";

import { useState, useTransition } from "react";

import { PlaylistDestinationFields } from "@/components/playlist-destination-fields";
import { ResultPanel } from "@/components/workflows/result-panel";
import { submitWorkflow } from "@/lib/client-request";
import type {
  PlaylistDestinationState,
  WorkflowResult
} from "@/lib/types";

const initialDestination: PlaylistDestinationState = {
  destinationMode: "new",
  existingPlaylistId: "",
  newPlaylistName: "Live set",
  newPlaylistPublic: false
};

export function SetlistForm() {
  const [artistName, setArtistName] = useState("");
  const [setlistLimit, setSetlistLimit] = useState(5);
  const [destination, setDestination] = useState(initialDestination);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleArtistNameChange(value: string) {
    setArtistName(value);

    if (destination.destinationMode === "new") {
      setDestination((current) => ({
        ...current,
        newPlaylistName: value.trim() ? `${value.trim()} live set` : "Live set"
      }));
    }
  }

  function handleSubmit() {
    setError(null);
    setResult(null);

    startTransition(() => {
      void (async () => {
        const outcome = await submitWorkflow(
          "/api/playlists/setlist",
          JSON.stringify({ artistName, setlistLimit, destination }),
          { "Content-Type": "application/json" },
          "Unable to run the setlist workflow."
        );

        if (outcome.ok) {
          setResult(outcome.result);
        } else {
          setError(outcome.error);
        }
      })();
    });
  }

  return (
    <div className="workflow-card">
      <div className="workflow-copy">
        <span className="eyebrow">Setlist To Playlist</span>
        <h2>Build a playlist from what an artist is playing live</h2>
        <p>
          Enter an artist, scan recent setlist.fm entries, and send the performed songs
          to a new or existing Spotify playlist.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Artist name</span>
          <input
            onChange={(event) => handleArtistNameChange(event.target.value)}
            placeholder="Charli xcx"
            type="text"
            value={artistName}
          />
        </label>

        <label className="field">
          <span>Recent setlists to scan</span>
          <select
            onChange={(event) => setSetlistLimit(Number(event.target.value))}
            value={setlistLimit}
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <PlaylistDestinationFields onChange={setDestination} value={destination} />

        <button className="button" disabled={isPending} onClick={handleSubmit} type="button">
          {isPending ? "Building playlist..." : "Run setlist workflow"}
        </button>

        {error ? <div className="callout error">{error}</div> : null}
        {result ? <ResultPanel result={result} /> : null}
      </div>
    </div>
  );
}
