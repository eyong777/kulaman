"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";
import { categorySchema, schoolSchema, userSchema } from "@/lib/validators";
import type { ActionState } from "@/types/actions";

export async function upsertSchool(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile(["admin"]);
  const id = formData.get("id")?.toString();
  const parsed = schoolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid school details." };

  const supabase = await createClient();
  const payload = { ...parsed.data, profile_completed: true };
  const query = id
    ? supabase.from("schools").update(payload).eq("id", id)
    : supabase.from("schools").insert(payload);
  const { error } = await query;
  if (error) return { error: error.message };

  await logActivity({ action: id ? "updated_school" : "created_school", entity_type: "school", entity_id: id ?? null });
  revalidatePath("/admin/schools");
  return { success: "School saved." };
}

export async function upsertCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile(["admin"]);
  const id = formData.get("id")?.toString();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid category details." };

  const supabase = await createClient();
  const query = id
    ? supabase.from("report_categories").update(parsed.data).eq("id", id)
    : supabase.from("report_categories").insert(parsed.data);
  const { error } = await query;
  if (error) return { error: error.message };

  await logActivity({
    action: id ? "updated_report_category" : "created_report_category",
    entity_type: "report_category",
    entity_id: id ?? null
  });
  revalidatePath("/admin/categories");
  return { success: "Category saved." };
}

export async function createUser(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile(["admin"]);
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid user details." };

  if (parsed.data.role === "school_user" && !parsed.data.school_id) {
    return { error: "School users must be assigned to a school." };
  }

  const admin = createAdminClient();
  const tempPassword = crypto.randomUUID().slice(0, 12) + "Aa1!";
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      school_id: parsed.data.school_id,
      must_change_password: true
    }
  });
  if (error || !data.user) return { error: error?.message ?? "Unable to create user." };

  const { error: profileError } = await admin.from("users").upsert({
    id: data.user.id,
    email: parsed.data.email,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    school_id: parsed.data.school_id || null,
    is_active: parsed.data.is_active
  });
  if (profileError) return { error: profileError.message };

  await logActivity({ action: "created_user", entity_type: "user", entity_id: data.user.id });
  revalidatePath("/admin/users");
  return { success: `User created. Temporary password: ${tempPassword}` };
}

export async function resetUserPassword(userId: string) {
  await requireProfile(["admin"]);
  const admin = createAdminClient();
  const { data: userProfile } = await admin.from("users").select("role").eq("id", userId).single();
  if (userProfile?.role === "admin") {
    return { error: "Admin accounts cannot be reset from the administrator panel." };
  }

  const newPassword = crypto.randomUUID().slice(0, 12) + "Aa1!";
  const { data: existing } = await admin.auth.admin.getUserById(userId);
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
    user_metadata: { ...(existing.user?.user_metadata ?? {}), must_change_password: true }
  });
  if (error) return { error: error.message };

  await logActivity({ action: "reset_password", entity_type: "user", entity_id: userId });
  return { success: `Temporary password: ${newPassword}` };
}

export async function setUserActive(userId: string, isActive: boolean) {
  await requireProfile(["admin"]);
  const supabase = await createClient();
  const { data: userProfile } = await supabase.from("users").select("role").eq("id", userId).single();
  if (userProfile?.role === "admin") {
    return { error: "Admin accounts cannot be disabled from the administrator panel." };
  }

  const { error } = await supabase.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: error.message };
  await logActivity({ action: isActive ? "activated_user" : "deactivated_user", entity_type: "user", entity_id: userId });
  revalidatePath("/admin/users");
  return { success: "User status updated." };
}

export async function deleteUserAccount(userId: string) {
  const profile = await requireProfile(["admin"]);
  if (profile.id === userId) {
    return { error: "You cannot delete your own admin account while signed in." };
  }

  const admin = createAdminClient();
  const { data: userProfile } = await admin.from("users").select("role").eq("id", userId).single();
  if (userProfile?.role === "admin") {
    return { error: "Admin accounts cannot be deleted from the administrator panel." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return {
      error:
        error.message.includes("Database error")
          ? "Delete blocked by linked records. Run migration 0003_allow_user_deletion_history.sql, then try again."
          : error.message
    };
  }

  await logActivity({ action: "deleted_user", entity_type: "user", entity_id: userId });
  revalidatePath("/admin/users");
  return { success: "User deleted." };
}
