"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { forgotPasswordSchema, loginSchema, settingsSchema } from "@/lib/validators";
import { roleHome } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import type { ActionState } from "@/types/actions";

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid login details." };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !authData.user) return { error: error?.message ?? "Invalid login credentials." };

  const { data: profile } = await supabase.from("users").select("role,is_active").eq("id", authData.user.id).single();
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This account profile is missing. Contact the administrator." };
  }
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account is inactive. Contact the administrator." };
  }

  await logActivity({ action: "signed_in", entity_type: "user", metadata: { email: parsed.data.email } });
  if (authData.user.user_metadata?.must_change_password) {
    redirect("/update-password");
  }
  redirect(roleHome(profile.role));
}

export async function requestPasswordReset(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email address." };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/update-password`
  });

  if (error) return { error: error.message };
  return { success: "Password reset instructions have been sent." };
}

export async function signOut() {
  const supabase = await createClient();
  await logActivity({ action: "signed_out", entity_type: "user" });
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateOwnSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase.from("users").update(parsed.data).eq("id", user.id);
  if (error) return { error: error.message };
  await logActivity({ action: "updated_settings", entity_type: "user", entity_id: user.id });
  return { success: "Settings updated." };
}

export async function updatePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirm_password")?.toString() ?? "";

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to update your password." };

  const { error } = await supabase.auth.updateUser({
    password,
    data: { ...user.user_metadata, must_change_password: false }
  });
  if (error) return { error: error.message };

  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, must_change_password: false }
    });
  } catch {
    // Browser-session password updates still succeed; admin metadata cleanup is best-effort.
  }

  await logActivity({ action: "updated_password", entity_type: "user", entity_id: user.id });
  return { success: "Password updated. You can continue to your dashboard." };
}

export async function changePasswordFromSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const currentPassword = formData.get("current_password")?.toString() ?? "";
  const newPassword = formData.get("new_password")?.toString() ?? "";
  const confirmPassword = formData.get("confirm_password")?.toString() ?? "";

  if (currentPassword.length < 1) return { error: "Enter your current password." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "You must be signed in to change your password." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyError) return { error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  await logActivity({ action: "changed_password", entity_type: "user", entity_id: user.id });
  return { success: "Password changed." };
}
