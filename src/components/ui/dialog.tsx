"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConfirmButton({
  children,
  message,
  action,
  variant = "destructive"
}: {
  children: React.ReactNode;
  message: string;
  action: () => void | Promise<void>;
  variant?: "default" | "destructive" | "outline";
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    await action();
    setPending(false);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant={variant} size="sm" onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <Card className="w-full max-w-md p-5">
            <h2 className="text-lg font-semibold">Confirm action</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="button" variant={variant} onClick={onConfirm} disabled={pending}>
                {pending ? "Working..." : "Confirm"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
