import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth-buttons";

const navItems = [
  { href: "/app", label: "Overview" },
  { href: "/app/festival", label: "Festival" },
  { href: "/app/recent", label: "Recent" },
  { href: "/app/history", label: "History" }
];

export default async function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div>
          <span className="eyebrow">Playlist Generator</span>
          <h1>Build Spotify playlists with less friction.</h1>
          <p>{session.user.name ?? "Spotify user"}</p>
        </div>

        <nav className="nav-stack">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <SignOutButton />
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}
