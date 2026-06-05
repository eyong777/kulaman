import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, adminNavItems, roleLabels, schoolHeadNavItems, schoolUserNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import { FooterCredit } from "@/components/footer-credit";
import { NotificationBadge } from "@/components/notification-badge";
import type { UserProfile } from "@/types/database";

export function AppShell({ profile, children }: { profile: UserProfile; children: React.ReactNode }) {
  const navItems =
    profile.role === "admin" ? adminNavItems : profile.role === "school_head" ? schoolHeadNavItems : schoolUserNavItems;

  if (!profile.is_active) redirect("/login");

  return (
    <div className="min-h-screen bg-background/90">
      <div className="gov-band h-1.5" />
      <div className="flex min-h-[calc(100vh-6px)]">
        <aside className="hidden w-72 border-r bg-white/92 lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b p-5">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-6" />
                </span>
                <span>
                  <span className="block text-sm font-bold leading-tight text-primary">Kulaman SDO</span>
                  <span className="block text-xs text-muted-foreground">Reports Management</span>
                </span>
              </Link>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary hover:text-primary"
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Notifications" ? <NotificationBadge /> : null}
                </Link>
              ))}
            </nav>
            <div className="border-t p-4">
              <div className="mb-3 rounded-md bg-secondary p-3">
                <p className="text-sm font-semibold">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[profile.role]}</p>
              </div>
              <form action={signOut}>
                <Button className="w-full" variant="outline">
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-white/92 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">DepEd Kulaman District</p>
                <h1 className="text-sm font-semibold sm:text-base">{APP_NAME}</h1>
              </div>
              <details className="relative lg:hidden">
                <summary className="list-none">
                  <Button type="button" variant="outline" size="icon">
                    <Menu className="size-5" />
                  </Button>
                </summary>
                <Card className="absolute right-0 mt-2 w-72 p-2">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href as Route} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm">
                      <item.icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.label === "Notifications" ? <NotificationBadge /> : null}
                    </Link>
                  ))}
                  <form action={signOut} className="mt-2 border-t pt-2">
                    <Button className="w-full" variant="outline">
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </form>
                </Card>
              </details>
            </div>
          </header>
          <main className="flex flex-1 flex-col">
            <div className="flex-1 px-4 py-6 lg:px-8">{children}</div>
            <FooterCredit className="mx-4 mb-4 bg-white/70 lg:mx-8" />
          </main>
        </div>
      </div>
    </div>
  );
}
