"use client";

import { useActionState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ActionState } from "@/types/actions";

export function UpdatePasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(updatePassword, null);
  if (state?.success) toast.success(state.success);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
      {state?.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm password</Label>
        <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required />
      </div>
      <SubmitButton className="w-full">Update password</SubmitButton>
      {state?.success ? (
        <Button asChild className="w-full" variant="outline">
          <Link href="/">Continue</Link>
        </Button>
      ) : null}
    </form>
  );
}
