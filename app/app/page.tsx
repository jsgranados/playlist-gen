import { DashboardCard } from "@/components/dashboard-card";

export default function DashboardPage() {
  return (
    <section className="dashboard-grid">
      <header className="page-header">
        <span className="eyebrow">Workflows</span>
        <h2>Pick a source. Crate takes it from there.</h2>
        <p>
          Every workflow can spin up a new playlist or file tracks into an existing one,
          deduping against what&rsquo;s already there.
        </p>
      </header>

      <div className="dashboard-card-grid">
        <DashboardCard
          description="Paste a festival lineup JSON feed. Crate matches the artists against your liked tracks."
          eyebrow="Festival"
          href="/app/festival"
          title="Lineup → liked tracks"
        />
        <DashboardCard
          description="Pull your last fifty plays, filter by window, and send them to Spotify in one pass."
          eyebrow="Recent"
          href="/app/recent"
          title="Your recent rotation"
        />
        <DashboardCard
          description="Upload your Spotify streaming history export. Filter by date. Nothing is retained."
          eyebrow="History"
          href="/app/history"
          title="Deep-range history dig"
        />
      </div>
    </section>
  );
}
