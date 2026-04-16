import { z } from "zod";

import { defaultFestivalUrl } from "@/lib/env";
import { AppError } from "@/lib/errors";

function refineDestination(
  value: { destinationMode: string; existingPlaylistId?: string; newPlaylistName?: string },
  ctx: z.RefinementCtx
) {
  if (value.destinationMode === "existing" && !value.existingPlaylistId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "An existing playlist must be selected."
    });
  }

  if (value.destinationMode === "new" && !value.newPlaylistName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A new playlist name is required."
    });
  }
}

const destinationSchema = z
  .object({
    destinationMode: z.enum(["new", "existing"]),
    existingPlaylistId: z.string().trim().optional(),
    newPlaylistName: z.string().trim().max(100).optional(),
    newPlaylistPublic: z.boolean().default(false)
  })
  .superRefine(refineDestination);

export const festivalRequestSchema = z.object({
  lineupUrl: z.string().trim().url().optional().default(defaultFestivalUrl),
  destination: destinationSchema
});

export const recentRequestSchema = z
  .object({
    startAt: z.string().trim().min(1),
    endAt: z.string().trim().optional(),
    destination: destinationSchema
  })
  .superRefine((value, ctx) => {
    if (value.endAt && new Date(value.startAt).getTime() > new Date(value.endAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date."
      });
    }
  });

export const historyFieldSchema = z
  .object({
    startAt: z.string().trim().min(1),
    endAt: z.string().trim().min(1),
    timezone: z.string().trim().min(1),
    destinationMode: z.enum(["new", "existing"]),
    existingPlaylistId: z.string().trim().optional(),
    newPlaylistName: z.string().trim().max(100).optional(),
    newPlaylistPublic: z
      .preprocess((v) => v === "true" || v === true, z.boolean())
      .default(false)
  })
  .superRefine((value, ctx) => {
    refineDestination(value, ctx);

    if (new Date(value.startAt).getTime() > new Date(value.endAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date."
      });
    }
  });

export function ensureFileLike(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new AppError(
      "A Spotify history JSON file is required.",
      422,
      "history_missing_file"
    );
  }

  return value;
}
