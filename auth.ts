import NextAuth, { type Session } from "next-auth";
import Spotify from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";

import { appUrl, authSecret, spotifyScopes } from "@/lib/env";
import { logger } from "@/lib/logger";

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

async function refreshSpotifyAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: "RefreshTokenMissing"
    };
  }

  const clientId = readEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = readEnv("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return {
      ...token,
      error: "MissingSpotifyEnv"
    };
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken
      })
    });

    const refreshed = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    };

    if (!response.ok || !refreshed.access_token || !refreshed.expires_in) {
      logger.warn("Spotify token refresh failed", {
        error: refreshed.error ?? response.statusText
      });

      return {
        ...token,
        error: "RefreshAccessTokenError"
      };
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined
    };
  } catch (error) {
    logger.error("Spotify token refresh threw", {
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      ...token,
      error: "RefreshAccessTokenError"
    };
  }
}

function getSession(session: Session, token: JWT) {
  return {
    ...session,
    user: {
      ...session.user,
      id: token.sub ?? ""
    },
    error: typeof token.error === "string" ? token.error : undefined
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  redirectProxyUrl: `${appUrl}/api/auth`,
  secret: authSecret || undefined,
  logger: {
    error(error) {
      logger.error("Auth.js error", {
        name: error.name,
        message: error.message
      });
    },
    warn(code) {
      logger.warn("Auth.js warning", { code });
    }
  },
  pages: {
    error: "/signin",
    signIn: "/signin"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Spotify({
      clientId: readEnv("SPOTIFY_CLIENT_ID"),
      clientSecret: readEnv("SPOTIFY_CLIENT_SECRET"),
      redirectProxyUrl: `${appUrl}/api/auth`,
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(
        spotifyScopes
      )}`
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          sub: token.sub ?? account.providerAccountId,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 60 * 60 * 1000,
          refreshToken: account.refresh_token ?? token.refreshToken
        };
      }

      if (
        typeof token.accessToken === "string" &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires - 60_000
      ) {
        return token;
      }

      return refreshSpotifyAccessToken(token);
    },
    async session({ session, token }) {
      return getSession(session, token);
    }
  }
});
