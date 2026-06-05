"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSignedInDestination, handleSupabaseAuthLink } from "@/lib/auth-link-client";

export function AuthConfirmClient() {
  const router = useRouter();
  const [message, setMessage] = useState("Preparing your account...");

  useEffect(() => {
    async function confirm() {
      const linkResult = await handleSupabaseAuthLink();
      if (linkResult.handled) {
        router.replace(linkResult.redirectTo);
        return;
      }

      if (linkResult.error) {
        setMessage(linkResult.error);
        return;
      }

      const signedInDestination = await getSignedInDestination();
      if (signedInDestination) {
        router.replace(signedInDestination);
        return;
      }

      setMessage("The invitation link is missing its login token. Please request a new invitation.");
    }

    confirm();
  }, [router]);

  return <p className="text-sm text-muted-foreground">{message}</p>;
}
