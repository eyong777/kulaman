import { Activity, Building2, CheckCircle2, Clock3, Files, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { MonthlySubmissionsChart } from "@/components/charts/monthly-submissions-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import type { ActivityLog } from "@/types/database";

export function DashboardOverview({
  stats,
  showSchools = true
}: {
  stats: {
    totalSchools: number;
    totalReports: number;
    pending: number;
    approved: number;
    rejected: number;
    byCategory: { name: string; total: number }[];
    monthly: { month: string; total: number }[];
    activity: ActivityLog[];
  };
  showSchools?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {showSchools ? <StatCard label="Total Schools" value={stats.totalSchools} icon={Building2} /> : null}
        <StatCard label="Total Reports" value={stats.totalReports} icon={Files} />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} tone="amber" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlySubmissionsChart data={stats.monthly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={stats.byCategory.length ? stats.byCategory : [{ name: "No reports", total: 1 }]} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {stats.activity.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{item.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{item.users?.full_name ?? "System"} on {item.entity_type}</p>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(item.created_at), "MMM d, yyyy h:mm a")}</span>
              </div>
            ))}
            {!stats.activity.length ? <p className="py-6 text-sm text-muted-foreground">No activity yet.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
