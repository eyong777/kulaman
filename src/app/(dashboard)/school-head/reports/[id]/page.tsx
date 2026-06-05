import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportDetail } from "@/components/report-detail";
import { requireProfile } from "@/lib/auth";
import { getReport } from "@/lib/queries";

export default async function SchoolHeadReportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile(["school_head"]);
  const { id } = await params;
  const { report, files } = await getReport(id);
  return (
    <>
      <PageHeader title="Review Report" description="Open files, download supporting documents, and record a review decision." icon={ClipboardCheck} />
      <ReportDetail report={report} files={files} role={profile.role} deleteRedirectTo="/school-head/reports" />
    </>
  );
}
