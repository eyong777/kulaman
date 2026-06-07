"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { Loader2 } from "lucide-react";
import { NotificationBadge } from "@/components/notification-badge";
import { adminNavItems, schoolHeadNavItems, schoolUserNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

function navItemsForRole(role: UserRole) {
  if (role === "admin") return adminNavItems;
  if (role === "school_head") return schoolHeadNavItems;
  return schoolUserNavItems;
}

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  const isDashboard = href === "/admin" || href === "/school-head" || href === "/school";
  return !isDashboard && pathname.startsWith(`${href}/`);
}

export function SidebarNavigation({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const navItems = navItemsForRole(role);

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href as Route));
  }, [navItems, router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        const loading = pendingHref === item.href && !active;

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            prefetch
            aria-current={active ? "page" : undefined}
            onPointerDown={() => setPendingHref(item.href)}
            onClick={() => setPendingHref(item.href)}
            className={cn(
              "flex min-h-11 touch-manipulation items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-[background-color,color,transform] duration-100 hover:bg-secondary hover:text-primary active:scale-[0.99] dark:text-slate-200",
              active ? "bg-secondary text-primary" : null,
              loading ? "bg-secondary/80 text-primary" : null
            )}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <item.icon className="size-4" />}
            <span className="flex-1">{item.label}</span>
            {item.label === "Notifications" ? <NotificationBadge /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
