"use client";

import { signIn, signOut } from "next-auth/react";
import { useTransition } from "react";

export function SignInButton({
  callbackUrl = "/app",
  className = "button"
}: {
  callbackUrl?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          void signIn("spotify", { callbackUrl });
        });
      }}
      type="button"
    >
      {isPending ? "Connecting..." : "Sign In With Spotify"}
    </button>
  );
}

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button button-secondary"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          void signOut({ callbackUrl: "/" });
        });
      }}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
