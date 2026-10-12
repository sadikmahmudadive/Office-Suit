"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { BoardArt, KeyArt, TeamArt } from "./auth-art";
import { Logo } from "./logo";

const SCENES = {
  "/login": {
    Art: BoardArt,
    title: "Welcome back.",
    text: "Pick up where your team left off: what's due, what's in progress, and what got done.",
  },
  "/register": {
    Art: TeamArt,
    title: "Bring your team's work together.",
    text: "Plan upcoming work, log what you did each day, and share a weekly summary in one click.",
  },
  "/reset-password": {
    Art: KeyArt,
    title: "Let's get you back in.",
    text: "Choose a new password and you'll be signed in straight away.",
  },
} as const;

const FEATURES = ["Task board with drag and drop", "Daily work log and meeting notes", "Weekly summaries, ready to send"];

// The panel is always ink, so the logo uses its light variant here.
const lightLogo = { "--logo-field": "#f3f2f2", "--logo-line": "#201e1d" } as CSSProperties;

/** The illustrated brand panel beside the sign-in forms (a compact banner on phones). */
export function AuthShowcase() {
  const pathname = usePathname();
  const scene = SCENES[pathname as keyof typeof SCENES] ?? SCENES["/login"];
  const { Art } = scene;

  return (
    <>
      <aside className="auth-panel sticky top-0 hidden h-screen overflow-hidden p-10 text-brand-paper lg:flex lg:flex-col xl:p-12" style={lightLogo}>
        <Logo size={34} />
        {/* The illustration takes whatever height is left, so the panel always fits one screen. */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-6">
          <Art className="h-full max-h-[460px] w-auto max-w-full" />
        </div>
        <div className="max-w-lg shrink-0">
          <h2 className="font-brand text-4xl leading-tight font-extrabold tracking-[-0.03em] xl:text-5xl">{scene.title}</h2>
          <p className="mt-3 text-base text-brand-paper/70">{scene.text}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-full bg-brand-paper/10 px-3 py-1.5 text-sm">
                <span className="size-2 rounded-full bg-brand-red" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Phones and tablets: a short illustrated banner above the form */}
      <div className="auth-panel relative overflow-hidden px-4 pt-5 pb-2 text-brand-paper lg:hidden" style={lightLogo}>
        <Logo size={28} />
        <Art className="mx-auto mt-2 h-40 w-auto max-w-full sm:h-52" />
      </div>
    </>
  );
}
