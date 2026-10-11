import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Brand typeface, used for the wordmark only.
const archivo = Archivo({ subsets: ["latin"], weight: ["800"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: { default: "Office Suit", template: "%s · Office Suit" },
  description: "Team notes, work log and task tracking.",
  applicationName: "Office Suit",
  appleWebApp: { title: "Office Suit" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181b21" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${archivo.variable}`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
