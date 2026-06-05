"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { REPORT_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";
import { reportFileSchema, reportReviewSchema, reportSchema, schoolSchema } from "@/lib/validators";
import type { ActionState } from "@/types/actions";
import type { ReportStatus } from "@/types/database";

export async function createReport(_: unknown, formData: FormData) {
  const profile = await requireProfile(["admin", "school_user"]);
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid report." };

  const schoolId = profile.role === "admin" ? formData.get("school_id")?.toString() : profile.school_id;
  if (!schoolId) return { error: "A school must be assigned before uploading reports." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      ...parsed.data,
      school_id: schoolId,
      submitted_by: profile.id,
      status: "pending"
    })
    .select("id, school_id")
    .single();

  if (error || !data) return { error: error?.message ?? "Unable to create report." };

  await logActivity({ action: "created_report", entity_type: "report", entity_id: data.id });
  revalidatePath("/school/reports");
  return { success: "Report created.", reportId: data.id, schoolId: data.school_id };
}

export async function attachReportFile(_: unknown, formData: FormData) {
  await requireProfile(["admin", "school_user"]);
  const parsed = reportFileSchema.safeParse({
    report_id: formData.get("report_id"),
    file_name: formData.get("file_name"),
    file_type: formData.get("file_type"),
    file_size: Number(formData.get("file_size")),
    storage_path: formData.get("storage_path")
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid file." };

  const supabase = await createClient();
  const { error } = await supabase.from("report_files").insert(parsed.data);
  if (error) return { error: error.message };

  await logActivity({
    action: "uploaded_report_file",
    entity_type: "report",
    entity_id: parsed.data.report_id,
    metadata: { file_name: parsed.data.file_name }
  });
  revalidatePath("/school/reports");
  return { success: "File registered." };
}

export async function updatePendingReport(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile(["school_user"]);
  const reportId = formData.get("report_id")?.toString();
  if (!reportId) return { error: "Missing report ID." };
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid report." };

  const supabase = await createClient();
  const { error } = await supabase.from("reports").update(parsed.data).eq("id", reportId).eq("status", "pending");
  if (error) return { error: error.message };

  await logActivity({ action: "updated_pending_report", entity_type: "report", entity_id: reportId });
  revalidatePath(`/school/reports/${reportId}`);
  revalidatePath("/school/reports");
  return { success: "Report updated." };
}

export async function reviewReport(_: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile(["admin", "school_head"]);
  const parsed = reportReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid review." };

  const supabase = await createClient();
  const { data: report, error: updateError } = await supabase
    .from("reports")
    .update({
      status: parsed.data.status as ReportStatus,
      review_remarks: parsed.data.review_remarks || null,
      reviewer_id: profile.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", parsed.data.report_id)
    .select("id, submitted_by, title")
    .single();
  if (updateError || !report) return { error: updateError?.message ?? "Unable to review report." };

  if (report.submitted_by) {
    await supabase.from("notifications").insert({
      recipient_id: report.submitted_by,
      report_id: report.id,
      title: `Report ${parsed.data.status}`,
      body:
        parsed.data.status === "approved"
          ? `"${report.title}" has been approved.`
          : `"${report.title}" has been rejected. Please review the remarks.`
    });
  }

  await logActivity({
    action: parsed.data.status === "approved" ? "approved_report" : "rejected_report",
    entity_type: "report",
    entity_id: parsed.data.report_id
  });
  revalidatePath("/admin/reports");
  revalidatePath("/school-head/reports");
  return { success: "Review saved." };
}

export async function deleteReport(reportId: string) {
  await requireProfile(["admin", "school_user"]);
  const supabase = await createClient();
  const { data: files } = await supabase.from("report_files").select("storage_path").eq("report_id", reportId);
  if (files?.length) {
    await supabase.storage.from(REPORT_BUCKET).remove(files.map((file) => file.storage_path));
  }
  const { error } = await supabase.from("reports").delete().eq("id", reportId);
  if (error) return { error: error.message };

  await logActivity({ action: "deleted_report", entity_type: "report", entity_id: reportId });
  revalidatePath("/admin/reports");
  revalidatePath("/school/reports");
  return { success: "Report deleted." };
}

export async function updateSchoolProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile(["school_user"]);
  if (!profile.school_id) return { error: "No school is assigned to this account." };

  const parsed = schoolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid school profile." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("schools")
    .update({ ...parsed.data, profile_completed: true })
    .eq("id", profile.school_id);
  if (error) return { error: error.message };
  await logActivity({ action: "updated_school_profile", entity_type: "school", entity_id: profile.school_id });
  revalidatePath("/school/profile");
  return { success: "School profile updated." };
}
