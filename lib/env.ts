type EnvSource = Record<string, string | undefined>;

export type DeploymentCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type DeploymentHealth = {
  appUrl: string;
  expectedSpotifyRedirectUri: string;
  nodeEnv: string;
  isReady: boolean;
  issues: string[];
  checks: DeploymentCheck[];
};

function readTrimmedEnvFrom(env: EnvSource, name: string) {
  const value = env[name];
  return typeof value === "string" ? value.trim() : undefined;
}

function readTrimmedEnv(name: string) {
  return readTrimmedEnvFrom(process.env, name);
}

function readOriginFromUrlEnv(env: EnvSource, name: string) {
  const value = readTrimmedEnvFrom(env, name);

  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

export function buildDeploymentHealth(env: EnvSource = process.env): DeploymentHealth {
  const nodeEnv = readTrimmedEnvFrom(env, "NODE_ENV") ?? "development";
  const spotifyClientId = readTrimmedEnvFrom(env, "SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = readTrimmedEnvFrom(env, "SPOTIFY_CLIENT_SECRET");
  const setlistFmApiKey = readTrimmedEnvFrom(env, "SETLISTFM_API_KEY");
  const authSecret =
    readTrimmedEnvFrom(env, "AUTH_SECRET") ??
    readTrimmedEnvFrom(env, "NEXTAUTH_SECRET");
  const configuredAppUrl =
    readTrimmedEnvFrom(env, "APP_URL") ??
    readTrimmedEnvFrom(env, "NEXTAUTH_URL") ??
    readOriginFromUrlEnv(env, "SPOTIFY_REDIRECT_URI");
  const appUrl = configuredAppUrl ?? "http://127.0.0.1:3000";
  const expectedSpotifyRedirectUri = `${appUrl}/api/auth/callback/spotify`;
  const issues: string[] = [];

  const checks: DeploymentCheck[] = [
    {
      name: "spotify-client-id",
      ok: Boolean(spotifyClientId),
      detail: spotifyClientId
        ? "SPOTIFY_CLIENT_ID is set."
        : "Missing SPOTIFY_CLIENT_ID."
    },
    {
      name: "spotify-client-secret",
      ok: Boolean(spotifyClientSecret),
      detail: spotifyClientSecret
        ? "SPOTIFY_CLIENT_SECRET is set."
        : "Missing SPOTIFY_CLIENT_SECRET."
    },
    {
      name: "auth-secret",
      ok: Boolean(authSecret),
      detail: authSecret ? "AUTH_SECRET is set." : "Missing AUTH_SECRET."
    },
    {
      name: "setlistfm-api-key",
      ok: Boolean(setlistFmApiKey),
      detail: setlistFmApiKey
        ? "SETLISTFM_API_KEY is set."
        : "Missing SETLISTFM_API_KEY."
    },
    {
      name: "app-url",
      ok: Boolean(configuredAppUrl),
      detail: configuredAppUrl
        ? `Resolved app URL: ${appUrl}`
        : `Falling back to local default: ${appUrl}`
    }
  ];

  if (!spotifyClientId) {
    issues.push("Set SPOTIFY_CLIENT_ID.");
  }

  if (!spotifyClientSecret) {
    issues.push("Set SPOTIFY_CLIENT_SECRET.");
  }

  if (!authSecret) {
    issues.push("Set AUTH_SECRET.");
  }

  if (!setlistFmApiKey) {
    issues.push("Set SETLISTFM_API_KEY.");
  }

  if (nodeEnv === "production" && isLocalOrigin(appUrl)) {
    issues.push(
      "Production APP_URL/NEXTAUTH_URL still points to a local origin. Set it to your public domain."
    );
  }

  if (!isLocalOrigin(appUrl) && !appUrl.startsWith("https://")) {
    issues.push("Public APP_URL/NEXTAUTH_URL must use https.");
  }

  return {
    appUrl,
    expectedSpotifyRedirectUri,
    nodeEnv,
    isReady: issues.length === 0,
    issues,
    checks
  };
}

export const deploymentHealth = buildDeploymentHealth();

export const spotifyScopes = [
  "user-library-read",
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "user-read-recently-played"
].join(" ");

export const defaultFestivalUrl =
  "https://amp-prod-aeg-festivaldata.s3.amazonaws.com/app/711/2g4uo3jiai93brm3/artists.json";

export const appUrl = deploymentHealth.appUrl;
export const expectedSpotifyRedirectUri = deploymentHealth.expectedSpotifyRedirectUri;

export const authSecret =
  readTrimmedEnv("AUTH_SECRET") ??
  readTrimmedEnv("NEXTAUTH_SECRET") ??
  "";

export const setlistFmApiKey = readTrimmedEnv("SETLISTFM_API_KEY") ?? "";
