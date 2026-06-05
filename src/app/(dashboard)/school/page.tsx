import { LayoutDashboard } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader } from "@/components/page-header";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";

export default async function SchoolDashboardPage() {
  const profile = await requireProfile(["school_user"]);
  const stats = await getDashboardStats(profile.school_id);
  return (
    <>
      <PageHeader title="School Dashboard" description="Track your submitted reports, approvals, and required follow-ups." icon={LayoutDashboard} />
      <DashboardOverview stats={stats} showSchools={false} />
    </>
  );
}
