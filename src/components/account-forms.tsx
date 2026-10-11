"use client";

import { useState } from "react";
import { changePassword, updateProfile } from "@/app/actions/auth";
import { FormError } from "./ui";
import { useFormAction } from "./use-form-action";

function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok">
      {message}
    </p>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, onSubmit, pending] = useFormAction(updateProfile);
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" defaultValue={name} autoComplete="name" required className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" defaultValue={email} autoComplete="email" required className="input" />
      </div>
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  // Remount the inputs after a successful change so the passwords are cleared.
  const [fieldsKey, setFieldsKey] = useState(0);
  const [state, onSubmit, pending] = useFormAction(async (prev, formData) => {
    const result = await changePassword(prev, formData);
    if (result?.success) setFieldsKey((k) => k + 1);
    return result;
  });

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div key={fieldsKey} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="label">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="newPassword" className="label">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="input"
            />
          </div>
        </div>
      </div>
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </button>
      </div>
    </form>
  );
}
