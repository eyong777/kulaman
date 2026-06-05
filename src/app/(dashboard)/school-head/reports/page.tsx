import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportFilters } from "@/components/report-filters";
import { ReportTable } from "@/components/report-table";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { getCategories, getReports, getSchools } from "@/lib/queries";

export default async function SchoolHeadReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireProfile(["school_head"]);
  const params = await searchParams;
  const [reports, schools, categories] = await Promise.all([
    getReports(params),
    getSchools(),
    getCategories(false)
  ]);

  return (
    <>
      <PageHeader title="All School Reports" description="Filter by school, date, category, and status before opening a report for review." icon={ClipboardCheck} />
      <ReportFilters schools={schools} categories={categories} />
      {reports.length ? <ReportTable reports={reports} basePath="/school-head/reports" /> : <EmptyState title="No reports found" />}
    </>
  );
}
