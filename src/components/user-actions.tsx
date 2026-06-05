"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, Power, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAccount, resetUserPassword, setUserActive } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function UserActions({
  userId,
  isActive,
  canManage = true
}: {
  userId: string;
  isActive: boolean;
  canManage?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied.");
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {!canManage ? (
        <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          Protected
        </span>
      ) : null}
      {password ? (
        <Card className="w-full max-w-sm border-emerald-200 bg-emerald-50 p-3 text-left shadow-none">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-800">Temporary password</p>
            <Button type="button" size="icon" variant="ghost" onClick={() => setPassword("")}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input value={password} readOnly onFocus={(event) => event.currentTarget.select()} className="bg-white font-mono" />
            <Button type="button" onClick={copyPassword}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy
            </Button>
          </div>
        </Card>
      ) : null}
      {canManage ? (
      <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await resetUserPassword(userId);
            if (result?.error) {
              toast.error(result.error);
              return;
            }
            const generated = result?.success?.replace("Temporary password: ", "") ?? "";
            setPassword(generated);
            toast.success("Temporary password generated.");
          })
        }
      >
        <KeyRound className="size-4" />
        Reset
      </Button>
      <Button
        size="sm"
        variant={isActive ? "destructive" : "secondary"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await setUserActive(userId, !isActive);
            result?.error ? toast.error(result.error) : toast.success(result?.success);
          })
        }
      >
        <Power className="size-4" />
        {isActive ? "Disable" : "Enable"}
      </Button>
        <ConfirmButton
          message="This will permanently delete the user's login account. Report history will remain, but the submitter/reviewer may show as Unknown."
          action={() =>
            startTransition(async () => {
              const result = await deleteUserAccount(userId);
              result?.error ? toast.error(result.error) : toast.success(result?.success);
            })
          }
        >
          <Trash2 className="size-4" />
          Delete
        </ConfirmButton>
      </div>
      ) : null}
    </div>
  );
}
