import { ChartBar } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader } from "@/components/page-header";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";

export default async function SchoolHeadDashboardPage() {
  await requireProfile(["school_head"]);
  const stats = await getDashboardStats();
  return (
    <>
      <PageHeader title="School Head Dashboard" description="Review submissions from all public schools and monitor report compliance." icon={ChartBar} />
      <DashboardOverview stats={stats} />
    </>
  );
}
