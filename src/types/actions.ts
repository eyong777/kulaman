export type ActionState = {
  error?: string;
  success?: string;
} | null;

export type ReportCreateState = {
  error?: string;
  success?: string;
  reportId?: string;
  schoolId?: string;
} | null;
