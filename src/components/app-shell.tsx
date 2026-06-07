import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, roleLabels } from "@/lib/constants";
import { signOut } from "@/actions/auth";
import { FooterCredit } from "@/components/footer-credit";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserProfile } from "@/types/database";

export function AppShell({ profile, children }: { profile: UserProfile; children: React.ReactNode }) {
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
            <SidebarNavigation role={profile.role} />
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
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <MobileNavigation profile={profile} />
              </div>
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
