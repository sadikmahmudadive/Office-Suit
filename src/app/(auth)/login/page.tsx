import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-brand text-3xl font-extrabold tracking-[-0.03em]">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Good to see you again. Enter your details to continue.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        New to the team?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
