"use client";

import { login } from "@/app/actions/auth";
import { FormError } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function LoginForm() {
  const [state, onSubmit, pending] = useFormAction(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      <FormError message={state?.error} />
      <button className="btn btn-primary w-full py-2" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
