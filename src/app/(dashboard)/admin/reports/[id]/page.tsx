import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportDetail } from "@/components/report-detail";
import { requireProfile } from "@/lib/auth";
import { getReport } from "@/lib/queries";

export default async function AdminReportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile(["admin"]);
  const { id } = await params;
  const { report, files } = await getReport(id);
  return (
    <>
      <PageHeader title="Report Review" description="Inspect submitted files and record an approval decision." icon={ClipboardCheck} />
      <ReportDetail report={report} files={files} role={profile.role} deleteRedirectTo="/admin/reports" />
    </>
  );
}
