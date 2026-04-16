"use client";

import { useState, useTransition } from "react";

import { submitWorkflow } from "@/lib/client-request";
import { defaultFestivalUrl } from "@/lib/env";
import type {
  PlaylistDestinationState,
  WorkflowResult
} from "@/lib/types";
import { PlaylistDestinationFields } from "@/components/playlist-destination-fields";
import { ResultPanel } from "@/components/workflows/result-panel";

const initialDestination: PlaylistDestinationState = {
  destinationMode: "new",
  existingPlaylistId: "",
  newPlaylistName: "Festival lineup finds",
  newPlaylistPublic: false
};

export function FestivalForm() {
  const [lineupUrl, setLineupUrl] = useState(defaultFestivalUrl);
  const [destination, setDestination] = useState(initialDestination);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    setResult(null);

    startTransition(() => {
      void (async () => {
        const outcome = await submitWorkflow(
          "/api/playlists/festival",
          JSON.stringify({ lineupUrl, destination }),
          { "Content-Type": "application/json" },
          "Unable to run the festival workflow."
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
        <span className="eyebrow">Festival To Playlist</span>
        <h2>Turn a lineup into a playlist from your liked songs</h2>
        <p>
          Paste any festival lineup JSON feed that exposes artist titles. The app scans
          your saved tracks, finds matching artists, and creates or updates a playlist.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Festival lineup JSON URL</span>
          <input
            onChange={(event) => setLineupUrl(event.target.value)}
            placeholder="https://example.com/artists.json"
            type="url"
            value={lineupUrl}
          />
          <small>Default is the current Coachella lineup feed.</small>
        </label>

        <PlaylistDestinationFields onChange={setDestination} value={destination} />

        <button className="button" disabled={isPending} onClick={handleSubmit} type="button">
          {isPending ? "Building playlist..." : "Run festival workflow"}
        </button>

        {error ? <div className="callout error">{error}</div> : null}
        {result ? <ResultPanel result={result} /> : null}
      </div>
    </div>
  );
}
