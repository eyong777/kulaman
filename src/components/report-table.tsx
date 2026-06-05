import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import type { Report } from "@/types/database";

export function ReportTable({ reports, basePath }: { reports: Report[]; basePath: string }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <div className="font-medium">{report.title}</div>
                <div className="text-xs text-muted-foreground">{report.reporting_period || "No period set"}</div>
              </TableCell>
              <TableCell>{report.schools?.name ?? "Unassigned"}</TableCell>
              <TableCell>{report.report_categories?.name ?? "Uncategorized"}</TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell>{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/${report.id}` as Route}>
                      <Eye className="size-4" />
                      Open
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`${basePath}/${report.id}` as Route}>
                      <Download className="size-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
