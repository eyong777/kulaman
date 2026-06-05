import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportFilters } from "@/components/report-filters";
import { ReportTable } from "@/components/report-table";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { getCategories, getReports, getSchools } from "@/lib/queries";

export default async function MyReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireProfile(["school_user"]);
  const params = await searchParams;
  const [reports, schools, categories] = await Promise.all([
    getReports({ ...params, schoolId: profile.school_id ?? undefined }),
    getSchools(),
    getCategories(false)
  ]);

  return (
    <>
      <PageHeader title="My Reports" description="View submitted reports and monitor approval or rejection status." icon={FileCheck2} />
      <ReportFilters schools={schools} categories={categories} showSchools={false} />
      {reports.length ? <ReportTable reports={reports} basePath="/school/reports" /> : <EmptyState title="No submitted reports" description="Upload a report to begin the review workflow." />}
    </>
  );
}
