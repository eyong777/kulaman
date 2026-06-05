"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { changePasswordFromSettings } from "@/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/types/actions";

export function PasswordSettingsForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePasswordFromSettings, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5" />
          Change password
        </CardTitle>
        <CardDescription>Update your account password using your current password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="max-w-xl space-y-4">
          {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
          {state?.success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="current_password">Current password</Label>
            <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input id="new_password" name="new_password" type="password" autoComplete="new-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required />
          </div>
          <SubmitButton>Change password</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
