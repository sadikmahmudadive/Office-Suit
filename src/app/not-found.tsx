import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-muted">This page doesn&apos;t exist, or the item was deleted.</p>
      <Link href="/" className="btn btn-primary mt-2">
        Go to dashboard
      </Link>
    </main>
  );
}
