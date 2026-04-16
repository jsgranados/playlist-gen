"use client";

import { useMemo, useState, useTransition } from "react";

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
  newPlaylistName: "Streaming history cut",
  newPlaylistPublic: false
};

export function HistoryForm() {
  const [file, setFile] = useState<File | null>(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [destination, setDestination] = useState(initialDestination);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  function handleSubmit() {
    setError(null);
    setResult(null);

    if (!file) {
      setError("Choose a Spotify history JSON file first.");
      return;
    }

    if (!startAt || !endAt) {
      setError("Choose both start and end date/time values.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("startAt", datetimeLocalToIso(startAt));
        formData.set("endAt", datetimeLocalToIso(endAt));
        formData.set("timezone", timezone);
        formData.set("destinationMode", destination.destinationMode);
        formData.set("existingPlaylistId", destination.existingPlaylistId);
        formData.set("newPlaylistName", destination.newPlaylistName);
        formData.set(
          "newPlaylistPublic",
          destination.newPlaylistPublic ? "true" : "false"
        );

        const outcome = await submitWorkflow(
          "/api/playlists/history",
          formData,
          {},
          "Unable to run the history workflow."
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
        <span className="eyebrow">History Upload</span>
        <h2>Filter your exported Spotify history by time range</h2>
        <p>
          Upload a JSON export from Spotify Privacy settings, choose a date range, and the
          app will resolve matching tracks against Spotify before building the playlist.
          Raw uploads are processed for the request only.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Spotify history JSON file</span>
          <input
            accept="application/json,.json"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <small>Expected fields: artistName, trackName, endTime.</small>
        </label>

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
            <span>End date and time</span>
            <input
              onChange={(event) => setEndAt(event.target.value)}
              type="datetime-local"
              value={endAt}
            />
          </label>
        </div>

        <PlaylistDestinationFields onChange={setDestination} value={destination} />

        <button className="button" disabled={isPending} onClick={handleSubmit} type="button">
          {isPending ? "Building playlist..." : "Run history workflow"}
        </button>

        {error ? <div className="callout error">{error}</div> : null}
        {result ? <ResultPanel result={result} /> : null}
      </div>
    </div>
  );
}
