import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile, UserRole } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data } = await supabase
    .from("users")
    .select("*, schools(id,name,school_id)")
    .eq("id", user.id)
    .maybeSingle();

  return data as UserProfile | null;
}

export async function requireProfile(allowedRoles?: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect(roleHome(profile.role));
  }

  return profile;
}

export function roleHome(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "school_head") return "/school-head";
  return "/school";
}

export function canReview(role: UserRole) {
  return role === "admin" || role === "school_head";
}
