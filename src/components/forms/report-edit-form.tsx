"use client";

import { useActionState } from "react";
import { updatePendingReport } from "@/actions/reports";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/actions";
import type { Report, ReportCategory } from "@/types/database";

export function ReportEditForm({ report, categories }: { report: Report; categories: ReportCategory[] }) {
  const [state, action] = useActionState<ActionState, FormData>(updatePendingReport, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit pending report</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div> : null}
          {state?.success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>
          ) : null}
          <input type="hidden" name="report_id" value={report.id} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={report.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select id="category_id" name="category_id" defaultValue={report.category_id} required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reporting_period">Reporting period</Label>
            <Input id="reporting_period" name="reporting_period" type="month" defaultValue={report.reporting_period ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={report.description ?? ""} />
          </div>
          <SubmitButton>Save changes</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
