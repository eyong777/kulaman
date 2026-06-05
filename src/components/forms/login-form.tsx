"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ActionState } from "@/types/actions";

export function LoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(signIn, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-4" autoComplete="off">
      {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <SubmitButton className="w-full">Sign in</SubmitButton>
      <Button asChild variant="link" className="w-full">
        <Link href="/forgot-password">Forgot password?</Link>
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(requestPasswordReset, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
      {state?.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <SubmitButton className="w-full">Send reset link</SubmitButton>
      <Button asChild variant="link" className="w-full">
        <Link href="/login">Back to login</Link>
      </Button>
    </form>
  );
}
