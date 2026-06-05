"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const query = supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  if (profile.role !== "admin") query.eq("recipient_id", profile.id);
  const { error } = await query;
  if (error) return { error: error.message };
  revalidatePath("/admin/notifications");
  revalidatePath("/school/notifications");
  revalidatePath("/school-head/notifications");
  return { success: "Notification marked read." };
}
