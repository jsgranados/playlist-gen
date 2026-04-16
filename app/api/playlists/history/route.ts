import { NextRequest } from "next/server";

import { requireAccessToken } from "@/lib/auth-helpers";
import { maxHistoryUploadBytes } from "@/lib/env";
import { toErrorResponse } from "@/lib/errors";
import { parseHistoryUpload } from "@/lib/history";
import { assertSameOrigin, getClientIp } from "@/lib/http";
import { runHistoryWorkflow } from "@/lib/playlist-workflows";
import { assertRateLimit } from "@/lib/rate-limit";
import { ensureFileLike, historyFieldSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { accessToken, userId } = await requireAccessToken(request);
    assertRateLimit(`${userId}:${getClientIp(request)}:history`, 4, 60_000);

    const formData = await request.formData();
    const file = ensureFileLike(formData.get("file"));

    if (file.size > maxHistoryUploadBytes) {
      return Response.json(
        {
          error: "History uploads must be 10 MB or smaller.",
          code: "history_too_large"
        },
        { status: 413 }
      );
    }

    const fields = historyFieldSchema.parse({
      startAt: formData.get("startAt"),
      endAt: formData.get("endAt"),
      timezone: formData.get("timezone"),
      destinationMode: formData.get("destinationMode"),
      existingPlaylistId: formData.get("existingPlaylistId"),
      newPlaylistName: formData.get("newPlaylistName"),
      newPlaylistPublic: formData.get("newPlaylistPublic")
    });

    const records = parseHistoryUpload(await file.text());
    const result = await runHistoryWorkflow(accessToken, {
      records,
      startAt: fields.startAt,
      endAt: fields.endAt,
      timezone: fields.timezone,
      destination: {
        destinationMode: fields.destinationMode,
        existingPlaylistId: fields.existingPlaylistId,
        newPlaylistName: fields.newPlaylistName,
        newPlaylistPublic: fields.newPlaylistPublic
      }
    });

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, "Unable to create the history playlist.");
  }
}
