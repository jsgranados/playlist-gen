import { deploymentHealth } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const status = deploymentHealth.isReady ? 200 : 503;

  return Response.json(
    {
      status: deploymentHealth.isReady ? "ok" : "misconfigured",
      nodeEnv: deploymentHealth.nodeEnv,
      appUrl: deploymentHealth.appUrl,
      expectedSpotifyRedirectUri: deploymentHealth.expectedSpotifyRedirectUri,
      checks: deploymentHealth.checks,
      issues: deploymentHealth.issues,
      timestamp: new Date().toISOString()
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
