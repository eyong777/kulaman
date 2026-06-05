import "server-only";

import { subMonths, format } from "date-fns";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { REPORT_BUCKET } from "@/lib/constants";
import type { ActivityLog, Notification, Report, ReportCategory, ReportFile, School, UserProfile } from "@/types/database";

export async function getDashboardStats(schoolId?: string | null) {
  const supabase = await createClient();
  const reportQuery = supabase.from("reports").select("id,status,category_id,created_at,report_categories(name)");
  if (schoolId) reportQuery.eq("school_id", schoolId);

  const [{ count: totalSchools }, { data: reports }, { data: activity }] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }),
    reportQuery,
    supabase
      .from("activity_logs")
      .select("*, users(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  const reportRows = (reports ?? []) as unknown as (Report & { report_categories?: { name: string } | null })[];
  const pending = reportRows.filter((report) => report.status === "pending").length;
  const approved = reportRows.filter((report) => report.status === "approved").length;
  const rejected = reportRows.filter((report) => report.status === "rejected").length;

  const byCategory = Object.values(
    reportRows.reduce<Record<string, { name: string; total: number }>>((acc, report) => {
      const name = report.report_categories?.name ?? "Uncategorized";
      acc[name] = { name, total: (acc[name]?.total ?? 0) + 1 };
      return acc;
    }, {})
  );

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(new Date(), 5 - index);
    return { month: format(date, "MMM"), key: format(date, "yyyy-MM"), total: 0 };
  });
  for (const report of reportRows) {
    const key = format(new Date(report.created_at), "yyyy-MM");
    const bucket = months.find((month) => month.key === key);
    if (bucket) bucket.total += 1;
  }

  return {
    totalSchools: totalSchools ?? 0,
    totalReports: reportRows.length,
    pending,
    approved,
    rejected,
    byCategory,
    monthly: months.map(({ month, total }) => ({ month, total })),
    activity: (activity ?? []) as ActivityLog[]
  };
}

export async function getReports(filters?: {
  schoolId?: string;
  categoryId?: string;
  status?: string;
  from?: string;
  to?: string;
  submittedBy?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("reports")
    .select(
      "*, schools(id,name,school_id,district), report_categories(id,name), submitter:users!reports_submitted_by_fkey(id,full_name,email), reviewer:users!reports_reviewer_id_fkey(id,full_name,email)"
    )
    .order("created_at", { ascending: false });

  if (filters?.schoolId) query = query.eq("school_id", filters.schoolId);
  if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.from) query = query.gte("created_at", filters.from);
  if (filters?.to) query = query.lte("created_at", filters.to);
  if (filters?.submittedBy) query = query.eq("submitted_by", filters.submittedBy);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Report[];
}

export async function getReport(id: string) {
  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .select(
      "*, schools(id,name,school_id,district), report_categories(id,name), submitter:users!reports_submitted_by_fkey(id,full_name,email), reviewer:users!reports_reviewer_id_fkey(id,full_name,email)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!report) notFound();

  const { data: files } = await supabase.from("report_files").select("*").eq("report_id", id).order("created_at");
  const signedFiles = await Promise.all(
    ((files ?? []) as ReportFile[]).map(async (file) => {
      const { data } = await supabase.storage.from(REPORT_BUCKET).createSignedUrl(file.storage_path, 60 * 10);
      return { ...file, signed_url: data?.signedUrl };
    })
  );

  return { report: report as Report, files: signedFiles };
}

export async function getSchools() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("schools").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as School[];
}

export async function getSchool(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("schools").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as School;
}

export async function getCategories(includeInactive = true) {
  const supabase = await createClient();
  let query = supabase.from("report_categories").select("*").order("name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ReportCategory[];
}

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("users").select("*, schools(id,name,school_id)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserProfile[];
}

export async function getNotifications(recipientId?: string) {
  const supabase = await createClient();
  let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
  if (recipientId) query = query.eq("recipient_id", recipientId);
  const { data, error } = await query.limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getActivityLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, users(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityLog[];
}
