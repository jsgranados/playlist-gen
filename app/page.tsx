import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/app");
  }

  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <Logo />
          <h1>
            Turn your music into a <span className="accent">crate</span>, not a query.
          </h1>
          <p>
            Crate pulls from festival lineups, your recent plays, and live setlists,
            then files everything into Spotify playlists. No scripts, no spreadsheets.
          </p>

          <div className="hero-actions">
            <SignInButton />
            <Link className="button button-secondary" href="#features">
              See the workflows
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-title">What&rsquo;s inside</div>
          <div className="hero-stat">
            <span>Festival</span>
            <strong>Lineup JSON → liked tracks</strong>
          </div>
          <div className="hero-stat">
            <span>Recent</span>
            <strong>Last 50 plays, filtered</strong>
          </div>
          <div className="hero-stat">
            <span>Setlist</span>
            <strong>Recent live songs</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="features">
        <article className="feature-card">
          <span className="eyebrow">Festival</span>
          <h2>Match a lineup against your library.</h2>
          <p>
            Paste a festival JSON feed. Crate scans your saved tracks, finds every artist
            overlap, and drops the matches straight into a playlist.
          </p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">Recent</span>
          <h2>Capture the fifty plays that matter.</h2>
          <p>
            Filter your most recent listening activity by window, dedupe against your
            destination, and send it to Spotify in one pass.
          </p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">Setlist</span>
          <h2>Build from what artists play live.</h2>
          <p>
            Scan recent setlist.fm entries for an artist, resolve those songs against
            Spotify, and collect the live rotation in a playlist.
          </p>
        </article>
      </section>
    </main>
  );
}
