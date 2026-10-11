"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const LINKS = [
  { href: "/", label: "Dashboard", short: "Home", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/tasks", label: "Tasks", icon: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z" },
  { href: "/notes", label: "Notes", icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" },
  { href: "/calendar", label: "Calendar", icon: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" },
  { href: "/summary", label: "Summary", icon: "M5 20V10M10 20V4M15 20v-7M20 20v-4" },
  { href: "/team", label: "Team", icon: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 14a6.5 6.5 0 0 1 3 6" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <>
      {/* Sidebar on larger screens */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
        <Link href="/" className="mb-6 px-2 text-lg font-semibold tracking-tight">
          Office Notes
        </Link>
        <nav className="flex flex-col gap-0.5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium ${
                isActive(pathname, link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <NavIcon d={link.icon} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border px-2 pt-4">
          <Link
            href="/account"
            className={`block truncate text-sm font-medium hover:text-accent ${pathname === "/account" ? "text-accent" : ""}`}
          >
            {userName}
          </Link>
          <form action={logout}>
            <button className="mt-1 text-sm text-muted hover:text-text">Sign out</button>
          </form>
        </div>
      </aside>

      {/* Top bar and bottom tabs on phones */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <Link href="/" className="font-semibold">
          Office Notes
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/account" className="max-w-32 truncate text-sm font-medium">
            {userName}
          </Link>
          <form action={logout}>
            <button className="text-sm text-muted">Sign out</button>
          </form>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t border-border bg-surface md:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive(pathname, link.href) ? "text-accent" : "text-muted"
            }`}
          >
            <NavIcon d={link.icon} />
            {link.short ?? link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
