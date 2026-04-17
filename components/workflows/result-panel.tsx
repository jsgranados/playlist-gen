import type { WorkflowResult } from "@/lib/types";

export function ResultPanel({
  result
}: {
  result: WorkflowResult;
}) {
  return (
    <section className="result-panel">
      <div className="result-header">
        <span className="eyebrow">Crate filed</span>
        <h3>{result.playlist.name}</h3>
        <a className="inline-link" href={result.playlist.url} rel="noreferrer" target="_blank">
          Open in Spotify
        </a>
      </div>

      <div className="stats-grid">
        <article>
          <span>Candidates</span>
          <strong>{result.counts.candidates}</strong>
        </article>
        <article>
          <span>Matched</span>
          <strong>{result.counts.matched}</strong>
        </article>
        <article>
          <span>Added</span>
          <strong>{result.counts.added}</strong>
        </article>
        <article>
          <span>Already there</span>
          <strong>{result.counts.existing}</strong>
        </article>
      </div>

      {result.warnings.length > 0 ? (
        <div className="callout warning">
          {result.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {result.details.artistCount ? (
        <p className="result-note">
          Artist lineup entries processed: {result.details.artistCount}
        </p>
      ) : null}

      {result.details.note ? <p className="result-note">{result.details.note}</p> : null}

      {result.details.unmatchedTracks?.length ? (
        <div className="result-list">
          <h4>Sample unmatched tracks</h4>
          <ul>
            {result.details.unmatchedTracks.map((track) => (
              <li key={`${track.artist}-${track.track}`}>
                <span>{track.artist}</span>
                <span>{track.track}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
