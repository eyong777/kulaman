import { Files } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportFilters } from "@/components/report-filters";
import { ReportTable } from "@/components/report-table";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { getCategories, getReports, getSchools } from "@/lib/queries";

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireProfile(["admin"]);
  const params = await searchParams;
  const [reports, schools, categories] = await Promise.all([
    getReports(params),
    getSchools(),
    getCategories(false)
  ]);

  return (
    <>
      <PageHeader title="Reports Management" description="Open, download, approve, reject, or delete reports from all schools." icon={Files} />
      <ReportFilters schools={schools} categories={categories} />
      {reports.length ? <ReportTable reports={reports} basePath="/admin/reports" /> : <EmptyState title="No reports found" description="Try adjusting filters or wait for schools to submit reports." />}
    </>
  );
}
