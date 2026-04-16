import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

import { authSecret } from "@/lib/env";
import { AppError } from "@/lib/errors";

function shouldUseSecureCookie(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function requireAccessToken(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret || undefined,
    secureCookie: shouldUseSecureCookie(request)
  });

  if (!token?.sub || typeof token.accessToken !== "string") {
    throw new AppError("You must be signed in to use this action.", 401, "unauthorized");
  }

  if (token.error === "RefreshAccessTokenError") {
    throw new AppError(
      "Your Spotify session expired. Please sign in again.",
      401,
      "spotify_session_expired"
    );
  }

  return {
    accessToken: token.accessToken,
    userId: token.sub
  };
}
