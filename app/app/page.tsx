import { DashboardCard } from "@/components/dashboard-card";

export default function DashboardPage() {
  return (
    <section className="dashboard-grid">
      <header className="page-header">
        <span className="eyebrow">Workflow Hub</span>
        <h2>Choose the playlist generator you want to run.</h2>
        <p>
          Each workflow supports either creating a brand-new playlist or appending into an
          existing one while deduping tracks already in that destination.
        </p>
      </header>

      <div className="dashboard-card-grid">
        <DashboardCard
          description="Pull artist names from a festival JSON feed and match them against your liked tracks."
          eyebrow="Festival"
          href="/app/festival"
          title="Festival lineup workflow"
        />
        <DashboardCard
          description="Work from the recent-play endpoint with a clear 50-track API constraint."
          eyebrow="Recent"
          href="/app/recent"
          title="Recent listening workflow"
        />
        <DashboardCard
          description="Upload an exported streaming-history JSON file and filter it by time range."
          eyebrow="History"
          href="/app/history"
          title="History upload workflow"
        />
      </div>
    </section>
  );
}
