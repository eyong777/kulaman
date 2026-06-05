import {
  Activity,
  Bell,
  Building2,
  ChartBar,
  ClipboardCheck,
  FileCheck2,
  FilePlus2,
  Files,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";

export const APP_NAME = "Kulaman School Reports Management System";
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const REPORT_BUCKET = "reports";

export const ACCEPTED_REPORT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg"
];

export const ACCEPTED_REPORT_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/schools", label: "Schools", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: Files },
  { href: "/admin/categories", label: "Categories", icon: ListChecks },
  { href: "/admin/activity-logs", label: "Activity Logs", icon: Activity },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export const schoolHeadNavItems = [
  { href: "/school-head", label: "Dashboard", icon: ChartBar },
  { href: "/school-head/reports", label: "All Reports", icon: ClipboardCheck },
  { href: "/school-head/notifications", label: "Notifications", icon: Bell },
  { href: "/school-head/settings", label: "Settings", icon: Settings }
];

export const schoolUserNavItems = [
  { href: "/school", label: "Dashboard", icon: LayoutDashboard },
  { href: "/school/upload", label: "Upload Report", icon: FilePlus2 },
  { href: "/school/reports", label: "My Reports", icon: FileCheck2 },
  { href: "/school/profile", label: "School Profile", icon: Building2 },
  { href: "/school/notifications", label: "Notifications", icon: Bell },
  { href: "/school/settings", label: "Settings", icon: Settings }
];

export const roleLabels = {
  admin: "Admin",
  school_head: "School Head",
  school_user: "School User"
} as const;

export const defaultCategories = [
  "Monthly Accomplishment Report",
  "School Governance Report",
  "Enrollment Report",
  "Financial Liquidation",
  "Learning Recovery Report",
  "Facilities and Maintenance",
  "Incident Report",
  "Other Compliance Report"
];

export const statusIcon = ShieldCheck;
