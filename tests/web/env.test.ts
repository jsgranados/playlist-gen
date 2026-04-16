import { describe, expect, it } from "vitest";

import { buildDeploymentHealth } from "@/lib/env";

describe("buildDeploymentHealth", () => {
  it("uses the local default origin for development when app url env is unset", () => {
    const health = buildDeploymentHealth({
      AUTH_SECRET: "secret",
      NODE_ENV: "development",
      SPOTIFY_CLIENT_ID: "client-id",
      SPOTIFY_CLIENT_SECRET: "client-secret"
    });

    expect(health.isReady).toBe(true);
    expect(health.appUrl).toBe("http://127.0.0.1:3000");
    expect(health.expectedSpotifyRedirectUri).toBe(
      "http://127.0.0.1:3000/api/auth/callback/spotify"
    );
  });

  it("flags a production deployment that still points at a local origin", () => {
    const health = buildDeploymentHealth({
      APP_URL: "http://127.0.0.1:3000",
      AUTH_SECRET: "secret",
      NODE_ENV: "production",
      SPOTIFY_CLIENT_ID: "client-id",
      SPOTIFY_CLIENT_SECRET: "client-secret"
    });

    expect(health.isReady).toBe(false);
    expect(health.issues).toContain(
      "Production APP_URL/NEXTAUTH_URL still points to a local origin. Set it to your public domain."
    );
  });

  it("accepts a public https deployment and reports the production redirect uri", () => {
    const health = buildDeploymentHealth({
      APP_URL: "https://playlist.example.com",
      AUTH_SECRET: "secret",
      NODE_ENV: "production",
      SPOTIFY_CLIENT_ID: "client-id",
      SPOTIFY_CLIENT_SECRET: "client-secret"
    });

    expect(health.isReady).toBe(true);
    expect(health.expectedSpotifyRedirectUri).toBe(
      "https://playlist.example.com/api/auth/callback/spotify"
    );
  });
});
