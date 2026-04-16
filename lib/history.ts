import { z } from "zod";

import { AppError } from "@/lib/errors";
import { HistoryTrackRecord } from "@/lib/types";

const historyTrackSchema = z.object({
  artistName: z.string().trim().min(1),
  trackName: z.string().trim().min(1),
  endTime: z.string().trim().min(1)
});

export function parseHistoryUpload(raw: string): HistoryTrackRecord[] {
  let payload: unknown;

  try {
    payload = JSON.parse(raw);
  } catch {
    throw new AppError(
      "Uploaded history file is not valid JSON.",
      422,
      "history_invalid_json"
    );
  }

  if (!Array.isArray(payload)) {
    throw new AppError(
      "Spotify history uploads must contain a JSON array.",
      422,
      "history_invalid_shape"
    );
  }

  return payload.map((entry, index) => {
    const parsed = historyTrackSchema.safeParse(entry);

    if (!parsed.success) {
      throw new AppError(
        `History row ${index + 1} is missing artistName, trackName, or endTime.`,
        422,
        "history_invalid_row"
      );
    }

    return parsed.data;
  });
}
