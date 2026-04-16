import { NextRequest } from "next/server";

import { requireAccessToken } from "@/lib/auth-helpers";
import { toErrorResponse } from "@/lib/errors";
import { assertRateLimit } from "@/lib/rate-limit";
import { listCurrentUserPlaylists } from "@/lib/spotify-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { accessToken, userId } = await requireAccessToken(request);
    assertRateLimit(`${userId}:playlist-picker`, 20, 60_000);
    const playlists = await listCurrentUserPlaylists(accessToken);

    return Response.json({
      playlists
    });
  } catch (error) {
    return toErrorResponse(error, "Unable to load Spotify playlists.");
  }
}
