import { NextRequest } from "next/server";

import { appUrl } from "@/lib/env";
import { AppError } from "@/lib/errors";

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = new Set([requestOrigin, appUrl]);

  if (!allowedOrigins.has(origin)) {
    throw new AppError(
      "Cross-site requests are not allowed.",
      403,
      "forbidden_origin"
    );
  }
}

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
