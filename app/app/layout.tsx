import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { SignOutButton } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";

function initialOf(name: string | null | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export default async function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const displayName = session.user.name ?? "Spotify user";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <Logo />

          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {initialOf(displayName)}
            </div>
            <span className="label">Signed in</span>
            <span className="name">{displayName}</span>
          </div>

          <AppNav />
        </div>

        <SignOutButton />
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}
