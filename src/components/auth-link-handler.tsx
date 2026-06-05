"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/browser";

export function AuthLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuthLink() {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!error) {
          router.replace("/update-password");
        }
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        router.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=/update-password` as Route);
      }
    }

    handleAuthLink();
  }, [router]);

  return null;
}
