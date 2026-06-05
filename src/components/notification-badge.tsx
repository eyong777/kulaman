"use client";

import { useEffect, useState } from "react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      try {
        const response = await fetch("/api/notifications/unread", {
          cache: "no-store"
        });
        if (!response.ok) return;
        const data = (await response.json()) as { count?: number };
        if (active) setCount(data.count ?? 0);
      } catch {
        if (active) setCount(0);
      }
    }

    loadCount();
    const interval = window.setInterval(loadCount, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!count) return null;

  return (
    <span className="grid min-w-5 place-items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
