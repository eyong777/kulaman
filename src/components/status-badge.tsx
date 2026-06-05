import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/types/database";

export function StatusBadge({ status }: { status: ReportStatus }) {
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}
