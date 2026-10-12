"use client";

import { resetPassword } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { FormError } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, onSubmit, pending] = useFormAction(resetPassword);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="label">
          New password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirm new password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <FormError message={state?.error} />
      <button className="btn btn-primary w-full py-2" disabled={pending}>
        {pending ? "Saving…" : "Set password and sign in"}
      </button>
    </form>
  );
}
