"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/browser";

export function AuthConfirmClient() {
  const router = useRouter();
  const [message, setMessage] = useState("Preparing your account...");

  useEffect(() => {
    async function confirm() {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.replace("/update-password");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        router.replace(`/auth/callback?code=${code}&next=/update-password` as Route);
        return;
      }

      setMessage("The invitation link is missing its login token. Please request a new invitation.");
    }

    confirm();
  }, [router]);

  return <p className="text-sm text-muted-foreground">{message}</p>;
}
