import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";

const signInErrorMessages: Record<string, string> = {
  AccessDenied:
    "Spotify denied access. If the app is still in development mode, make sure your Spotify account is listed as a test user.",
  Configuration:
    "The Spotify sign-in flow is misconfigured. Check the current app URL and the redirect URIs in the Spotify developer dashboard.",
  OAuthSignin:
    "The app could not start the Spotify sign-in flow. Check that you are using the expected local URL and that Spotify allows its callback.",
  OAuthCallbackError:
    "Spotify returned an error while finishing sign-in. The most common cause is a redirect URI mismatch for the host you opened in the browser.",
  Verification:
    "The sign-in request could not be verified. Retry from the same browser tab so the auth cookies stay intact."
};

function readError(
  value: string | string[] | undefined
): { code: string; message: string } | null {
  const code = Array.isArray(value) ? value[0] : value;

  if (!code) {
    return null;
  }

  return {
    code,
    message:
      signInErrorMessages[code] ??
      "Spotify sign-in failed. Check the callback URL, Spotify app settings, and local auth cookies."
  };
}

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string | string[] }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const signInError = readError(resolvedSearchParams?.error);

  if (session?.user?.id) {
    redirect("/app");
  }

  return (
    <main className="centered-page">
      <section className="auth-panel">
        <Logo />
        <span className="eyebrow">Spotify OAuth</span>
        <h1>Connect Spotify to start building crates.</h1>
        <p>
          Crate uses Spotify for sign-in, playlist reads and writes, liked tracks, and
          recent plays. Uploaded history files are processed only for the current request.
        </p>
        {signInError ? (
          <div className="callout error" role="alert">
            {signInError.message} Error code: <code>{signInError.code}</code>
          </div>
        ) : null}
        <SignInButton />
      </section>
    </main>
  );
}
