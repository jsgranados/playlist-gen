import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth-buttons";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/app");
  }

  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Spotify Playlist Generator</span>
          <h1>From one-off script to polished playlist control room.</h1>
          <p>
            Sign in with Spotify, keep the three original generation modes, and run them
            from a product-ready interface built for the web.
          </p>

          <div className="hero-actions">
            <SignInButton />
            <Link className="button button-secondary" href="#features">
              See the workflows
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-stat">
            <span>3 preserved workflows</span>
            <strong>Festival, recent, history</strong>
          </div>
          <div className="hero-stat">
            <span>Spotify aware</span>
            <strong>OAuth, playlists, saved tracks</strong>
          </div>
          <div className="hero-stat">
            <span>Safer by default</span>
            <strong>Validation, dedupe, rate limiting</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="features">
        <article className="feature-card">
          <span className="eyebrow">Festival flow</span>
          <h2>Match lineups against your liked songs.</h2>
          <p>Paste a festival JSON feed and turn artist overlap into a playlist in one run.</p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">Recent flow</span>
          <h2>Capture the last 50 plays that matter.</h2>
          <p>Filter your recent listening activity by time and send it straight into Spotify.</p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">History flow</span>
          <h2>Upload your export when the API cannot go deep enough.</h2>
          <p>Keep full-range historical playlist generation without retaining the raw file.</p>
        </article>
      </section>
    </main>
  );
}
