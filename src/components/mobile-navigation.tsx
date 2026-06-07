"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { Loader2, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/notification-badge";
import { adminNavItems, roleLabels, schoolHeadNavItems, schoolUserNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/database";

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  const isDashboard = href === "/admin" || href === "/school-head" || href === "/school";
  return !isDashboard && pathname.startsWith(`${href}/`);
}

export function MobileNavigation({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const navItems =
    profile.role === "admin" ? adminNavItems : profile.role === "school_head" ? schoolHeadNavItems : schoolUserNavItems;

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href as Route));
  }, [navItems, router]);

  useEffect(() => {
    setPendingHref(null);
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-[60] bg-slate-950/35"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-4 top-20 z-[70] w-[min(calc(100vw-2rem),22rem)] rounded-lg border bg-card p-3 text-card-foreground shadow-xl">
            <div className="mb-3 rounded-md bg-secondary p-3">
              <p className="text-sm font-semibold">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                (() => {
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
                        "flex min-h-11 touch-manipulation items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-[background-color,color,transform] duration-100 hover:bg-secondary hover:text-primary active:scale-[0.99] dark:text-slate-200",
                        active ? "bg-secondary text-primary" : null,
                        loading ? "bg-secondary/80 text-primary" : null
                      )}
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <item.icon className="size-4" />}
                      <span className="flex-1">{item.label}</span>
                      {item.label === "Notifications" ? <NotificationBadge /> : null}
                    </Link>
                  );
                })()
              ))}
            </nav>
            <form action={signOut} className="mt-3 border-t pt-3">
              <Button className="w-full" variant="outline">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
