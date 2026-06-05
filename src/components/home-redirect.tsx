"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSignedInDestination, handleSupabaseAuthLink } from "@/lib/auth-link-client";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      const linkResult = await handleSupabaseAuthLink();
      if (linkResult.handled) {
        router.replace(linkResult.redirectTo);
        return;
      }

      const signedInDestination = await getSignedInDestination();
      router.replace(signedInDestination ?? "/login");
    }

    routeUser();
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <p className="text-sm text-muted-foreground">Opening your account...</p>
    </main>
  );
}
