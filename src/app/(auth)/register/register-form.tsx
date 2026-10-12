"use client";

import { register } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { FormError } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function RegisterForm({ needsInviteCode }: { needsInviteCode: boolean }) {
  const [state, onSubmit, pending] = useFormAction(register);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" autoComplete="name" required className="input" />
      </div>
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
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      {needsInviteCode && (
        <div>
          <label htmlFor="inviteCode" className="label">
            Team invite code
          </label>
          <input id="inviteCode" name="inviteCode" required className="input" />
        </div>
      )}
      <FormError message={state?.error} />
      <button className="btn btn-primary w-full py-2.5" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
