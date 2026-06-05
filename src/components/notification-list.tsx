"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { markNotificationRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Notification } from "@/types/database";

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = useTransition();

  if (!notifications.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">No notifications yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.is_read ? "opacity-80" : "border-primary/40"}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-muted-foreground">{notification.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{format(new Date(notification.created_at), "MMM d, yyyy h:mm a")}</p>
            </div>
            {!notification.is_read ? (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await markNotificationRead(notification.id);
                    result?.error ? toast.error(result.error) : toast.success("Marked read.");
                  })
                }
              >
                Mark read
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
