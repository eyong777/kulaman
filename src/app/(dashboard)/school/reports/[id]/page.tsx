import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportDetail } from "@/components/report-detail";
import { requireProfile } from "@/lib/auth";
import { getCategories, getReport } from "@/lib/queries";

export default async function SchoolReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile(["school_user"]);
  const { id } = await params;
  const [{ report, files }, categories] = await Promise.all([getReport(id), getCategories(false)]);
  return (
    <>
      <PageHeader title="Report Details" description="Open files, download submitted documents, and view reviewer remarks." icon={FileCheck2} />
      <ReportDetail report={report} files={files} role={profile.role} categories={categories} deleteRedirectTo="/school/reports" />
    </>
  );
}
