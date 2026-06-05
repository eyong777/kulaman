"use client";

import type { Route } from "next";
import { createClient } from "@/lib/supabase/browser";

type AuthLinkResult =
  | {
      handled: true;
      redirectTo: Route;
    }
  | {
      handled: false;
      error?: string;
    };

function getUrlParams() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    get(name: string) {
      return search.get(name) ?? hash.get(name);
    }
  };
}

function dashboardForRole(role: string): Route {
  if (role === "admin") return "/admin";
  if (role === "school_head") return "/school-head";
  return "/school";
}

export async function handleSupabaseAuthLink(): Promise<AuthLinkResult> {
  const supabase = createClient();
  const params = getUrlParams();
  const linkError = params.get("error_description") ?? params.get("error");

  if (linkError) {
    return { handled: false, error: linkError.replaceAll("+", " ") };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) return { handled: false, error: error.message };
    return { handled: true, redirectTo: "/update-password" };
  }

  const tokenHash = params.get("token_hash");
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (params.get("type") ?? "invite") as "invite"
    });

    if (error) return { handled: false, error: error.message };
    return { handled: true, redirectTo: "/update-password" };
  }

  const code = params.get("code");
  if (code) {
    return {
      handled: true,
      redirectTo: `/auth/callback?code=${encodeURIComponent(code)}&next=/update-password` as Route
    };
  }

  return { handled: false };
}

export async function getSignedInDestination(): Promise<Route | null> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  if (user.user_metadata?.must_change_password) {
    return "/update-password";
  }

  const { data: profile } = await supabase.from("users").select("role,is_active").eq("id", user.id).maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return "/login";
  }

  return dashboardForRole(profile.role);
}
