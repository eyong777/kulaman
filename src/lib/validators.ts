import { z } from "zod";
import { ACCEPTED_REPORT_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export const schoolSchema = z.object({
  school_id: z.string().min(2, "School ID is required.").max(32),
  name: z.string().min(2, "School name is required.").max(160),
  district: z.string().max(120).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  head_name: z.string().max(120).optional().nullable(),
  contact_email: z.string().email("Enter a valid email.").optional().or(z.literal("")).nullable(),
  contact_phone: z.string().max(32).optional().nullable(),
  enrollment_count: z.coerce.number().int().min(0).optional().nullable()
});

export const userSchema = z.object({
  email: z.string().min(2, "Enter a login ID or email.").max(160),
  full_name: z.string().min(2).max(120),
  role: z.enum(["admin", "school_head", "school_user"]),
  school_id: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().uuid().optional().nullable()
  ),
  is_active: z.preprocess((value) => value === true || value === "true", z.boolean()).default(true)
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(240).optional().nullable(),
  is_active: z.preprocess((value) => value === true || value === "true", z.boolean()).default(true)
});

export const reportSchema = z.object({
  title: z.string().min(3, "Report title is required.").max(160),
  description: z.string().max(600).optional().nullable(),
  category_id: z.string().uuid("Choose a report category."),
  reporting_period: z.string().optional().nullable()
});

export const reportReviewSchema = z.object({
  report_id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  review_remarks: z.string().max(800).optional().nullable()
});

export const reportFileSchema = z.object({
  report_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_type: z.string().refine((type) => ACCEPTED_REPORT_TYPES.includes(type), "Unsupported file type."),
  file_size: z.number().max(MAX_FILE_SIZE, "File is larger than 25 MB."),
  storage_path: z.string().min(1)
});

export const settingsSchema = z.object({
  full_name: z.string().min(2).max(120)
});
