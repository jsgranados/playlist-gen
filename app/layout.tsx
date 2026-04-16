import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Playlist Generator",
  description: "Build Spotify playlists from festival lineups, recent plays, and history exports."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
