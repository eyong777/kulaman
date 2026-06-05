export type UserRole = "admin" | "school_head" | "school_user";
export type ReportStatus = "pending" | "approved" | "rejected";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface School {
  id: string;
  school_id: string;
  name: string;
  district: string | null;
  address: string | null;
  head_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  enrollment_count: number | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id: string | null;
  is_active: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  schools?: Pick<School, "id" | "name" | "school_id"> | null;
}

export interface ReportCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  school_id: string;
  category_id: string;
  submitted_by: string | null;
  title: string;
  description: string | null;
  reporting_period: string | null;
  status: ReportStatus;
  reviewer_id: string | null;
  reviewed_at: string | null;
  review_remarks: string | null;
  created_at: string;
  updated_at: string;
  schools?: Pick<School, "id" | "name" | "school_id" | "district"> | null;
  report_categories?: Pick<ReportCategory, "id" | "name"> | null;
  submitter?: Pick<UserProfile, "id" | "full_name" | "email"> | null;
  reviewer?: Pick<UserProfile, "id" | "full_name" | "email"> | null;
}

export interface ReportFile {
  id: string;
  report_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  signed_url?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  report_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
  users?: Pick<UserProfile, "full_name" | "email"> | null;
}
