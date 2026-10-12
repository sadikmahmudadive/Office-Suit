import { AuthShowcase } from "@/components/auth-showcase";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <AuthShowcase />
      <div className="flex items-start justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-12">
        <div className="auth-form w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
