import { NextRequest } from "next/server";

import { requireAccessToken } from "@/lib/auth-helpers";
import { toErrorResponse } from "@/lib/errors";
import { assertSameOrigin, getClientIp } from "@/lib/http";
import { runFestivalWorkflow } from "@/lib/playlist-workflows";
import { assertRateLimit } from "@/lib/rate-limit";
import { festivalRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { accessToken, userId } = await requireAccessToken(request);
    assertRateLimit(`${userId}:${getClientIp(request)}:festival`);

    const payload = festivalRequestSchema.parse(
      (await request.json()) as unknown
    );

    const result = await runFestivalWorkflow(accessToken, {
      lineupUrl: payload.lineupUrl,
      destination: payload.destination
    });
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, "Unable to create the festival playlist.");
  }
}
