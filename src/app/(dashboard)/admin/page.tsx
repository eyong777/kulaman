import { LayoutDashboard } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader } from "@/components/page-header";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";

export default async function AdminDashboardPage() {
  await requireProfile(["admin"]);
  const stats = await getDashboardStats();
  return (
    <>
      <PageHeader title="Admin Dashboard" description="System-wide reporting, approvals, schools, and compliance activity." icon={LayoutDashboard} />
      <DashboardOverview stats={stats} />
    </>
  );
}
