import { Download, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ReportReviewForm } from "@/components/forms/report-review-form";
import { ReportEditForm } from "@/components/forms/report-edit-form";
import { DeleteReportButton } from "@/components/delete-report-button";
import { formatBytes } from "@/lib/utils";
import type { Report, ReportCategory, ReportFile, UserRole } from "@/types/database";

export function ReportDetail({
  report,
  files,
  role,
  categories = [],
  deleteRedirectTo
}: {
  report: Report;
  files: ReportFile[];
  role: UserRole;
  categories?: ReportCategory[];
  deleteRedirectTo: string;
}) {
  const canReview = role === "admin" || role === "school_head";
  const canDelete = role === "admin" || (role === "school_user" && report.status === "pending");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{report.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submitted by {report.submitter?.full_name ?? "Unknown"} on {format(new Date(report.created_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="School" value={report.schools?.name ?? "Unassigned"} />
              <Info label="Category" value={report.report_categories?.name ?? "Uncategorized"} />
              <Info label="Period" value={report.reporting_period ?? "Not set"} />
            </div>
            <Info label="Description" value={report.description ?? "No description provided."} />
            {report.review_remarks ? <Info label="Review remarks" value={report.review_remarks} /> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md bg-secondary text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">{file.file_type} · {formatBytes(file.file_size)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {file.signed_url ? (
                    <>
                      <Button asChild size="sm" variant="outline">
                        <a href={file.signed_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                          Open
                        </a>
                      </Button>
                      <Button asChild size="sm">
                        <a href={file.signed_url} download>
                          <Download className="size-4" />
                          Download
                        </a>
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            {!files.length ? <p className="text-sm text-muted-foreground">No files attached.</p> : null}
          </CardContent>
        </Card>
      </div>
      <aside className="space-y-4">
        {canReview ? <ReportReviewForm reportId={report.id} /> : null}
        {role === "school_user" && report.status === "pending" ? <ReportEditForm report={report} categories={categories} /> : null}
        {canDelete ? <DeleteReportButton reportId={report.id} redirectTo={deleteRedirectTo} /> : null}
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
