"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Overview" },
  { href: "/app/festival", label: "Festival" },
  { href: "/app/recent", label: "Recent" },
  { href: "/app/setlist", label: "Setlist" }
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-stack" aria-label="Workflows">
      <div className="nav-stack-label">Workflows</div>
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={active ? "active" : ""}
            href={item.href}
            key={item.href}
          >
            <span className="nav-dot" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
