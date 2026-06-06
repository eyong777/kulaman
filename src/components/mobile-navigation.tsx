"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/notification-badge";
import { adminNavItems, roleLabels, schoolHeadNavItems, schoolUserNavItems } from "@/lib/constants";
import type { UserProfile } from "@/types/database";

export function MobileNavigation({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false);
  const navItems =
    profile.role === "admin" ? adminNavItems : profile.role === "school_head" ? schoolHeadNavItems : schoolUserNavItems;

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
          <div className="fixed right-4 top-20 z-[70] w-[min(calc(100vw-2rem),22rem)] rounded-lg border bg-white p-3 shadow-xl">
            <div className="mb-3 rounded-md bg-secondary p-3">
              <p className="text-sm font-semibold">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-secondary hover:text-primary"
                >
                  <item.icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Notifications" ? <NotificationBadge /> : null}
                </Link>
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
