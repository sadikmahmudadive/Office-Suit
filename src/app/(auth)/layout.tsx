export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-xl font-semibold tracking-tight">Office Notes</p>
        <div className="card p-6">{children}</div>
      </div>
    </main>
  );
}
