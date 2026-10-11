"use client";

import { startTransition, useActionState, type FormEvent } from "react";

type FormState = { error?: string; success?: string } | undefined;

/**
 * Like useActionState, but submits through onSubmit instead of <form action>,
 * so React doesn't clear the inputs when the server sends back an error.
 */
export function useFormAction(action: (state: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, undefined);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return [state, onSubmit, pending] as const;
}
