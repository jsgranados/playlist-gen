import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Crate — Build Spotify playlists from your sources",
    template: "%s · Crate"
  },
  description:
    "Crate turns festival lineups, recent plays, and streaming history into polished Spotify playlists.",
  applicationName: "Crate"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d10"
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
