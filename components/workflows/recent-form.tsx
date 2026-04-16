"use client";

import { useState, useTransition } from "react";

import { submitWorkflow } from "@/lib/client-request";
import { datetimeLocalToIso } from "@/lib/dates";
import type {
  PlaylistDestinationState,
  WorkflowResult
} from "@/lib/types";
import { PlaylistDestinationFields } from "@/components/playlist-destination-fields";
import { ResultPanel } from "@/components/workflows/result-panel";

const initialDestination: PlaylistDestinationState = {
  destinationMode: "new",
  existingPlaylistId: "",
  newPlaylistName: "Recent Spotify run",
  newPlaylistPublic: false
};

export function RecentForm() {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [destination, setDestination] = useState(initialDestination);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    setResult(null);

    if (!startAt) {
      setError("Choose a start date and time first.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const outcome = await submitWorkflow(
          "/api/playlists/recent",
          JSON.stringify({
            startAt: datetimeLocalToIso(startAt),
            endAt: endAt ? datetimeLocalToIso(endAt) : undefined,
            destination
          }),
          { "Content-Type": "application/json" },
          "Unable to run the recent workflow."
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
        <span className="eyebrow">Recent Plays</span>
        <h2>Capture the last stretch of your listening activity</h2>
        <p>
          Spotify caps this workflow to your 50 most recent plays. Pick a start point,
          optionally cap it with an end point, then send the filtered tracks into a new
          or existing playlist.
        </p>
      </div>

      <div className="form-grid">
        <div className="field-grid two-col">
          <label className="field">
            <span>Start date and time</span>
            <input
              onChange={(event) => setStartAt(event.target.value)}
              type="datetime-local"
              value={startAt}
            />
          </label>

          <label className="field">
            <span>Optional end date and time</span>
            <input
              onChange={(event) => setEndAt(event.target.value)}
              type="datetime-local"
              value={endAt}
            />
          </label>
        </div>

        <div className="callout soft">
          Spotify only exposes up to the 50 most recently played tracks through the public
          API for this workflow.
        </div>

        <PlaylistDestinationFields onChange={setDestination} value={destination} />

        <button className="button" disabled={isPending} onClick={handleSubmit} type="button">
          {isPending ? "Building playlist..." : "Run recent workflow"}
        </button>

        {error ? <div className="callout error">{error}</div> : null}
        {result ? <ResultPanel result={result} /> : null}
      </div>
    </div>
  );
}
