import { NextRequest } from "next/server";

import { requireAccessToken } from "@/lib/auth-helpers";
import { toErrorResponse } from "@/lib/errors";
import { assertSameOrigin, getClientIp } from "@/lib/http";
import { runSetlistWorkflow } from "@/lib/playlist-workflows";
import { assertRateLimit } from "@/lib/rate-limit";
import { setlistRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { accessToken, userId } = await requireAccessToken(request);
    assertRateLimit(`${userId}:${getClientIp(request)}:setlist`);

    const payload = setlistRequestSchema.parse((await request.json()) as unknown);

    const result = await runSetlistWorkflow(accessToken, {
      artistName: payload.artistName,
      setlistLimit: payload.setlistLimit,
      destination: payload.destination
    });
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, "Unable to create the setlist playlist.");
  }
}
