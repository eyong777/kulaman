"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { reviewReport } from "@/actions/reports";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/actions";

export function ReportReviewForm({ reportId }: { reportId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(reviewReport, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review decision</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
          {state?.success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>
          ) : null}
          <input type="hidden" name="report_id" value={reportId} />
          <div className="space-y-2">
            <Label htmlFor="status">Decision</Label>
            <Select id="status" name="status" defaultValue="approved">
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review_remarks">Remarks</Label>
            <Textarea id="review_remarks" name="review_remarks" placeholder="Add reviewer remarks or return instructions." />
          </div>
          <div className="flex gap-2">
            <SubmitButton>
              <CheckCircle2 className="size-4" />
              Save decision
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
