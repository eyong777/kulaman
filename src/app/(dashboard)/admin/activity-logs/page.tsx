import { Activity } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { getActivityLogs } from "@/lib/queries";

export default async function ActivityLogsPage() {
  await requireProfile(["admin"]);
  const logs = await getActivityLogs();
  return (
    <>
      <PageHeader title="Activity Logs" description="Audit trail for sign-ins, uploads, reviews, user changes, and profile updates." icon={Activity} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action.replace(/_/g, " ")}</TableCell>
                <TableCell>{log.users?.full_name ?? "System"}</TableCell>
                <TableCell>{log.entity_type}</TableCell>
                <TableCell>{format(new Date(log.created_at), "MMM d, yyyy h:mm a")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
