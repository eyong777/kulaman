"use client";

import * as React from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { attachReportFile, createReport } from "@/actions/reports";
import { createClient } from "@/lib/supabase/browser";
import { ACCEPTED_REPORT_EXTENSIONS, ACCEPTED_REPORT_TYPES, MAX_FILE_SIZE, REPORT_BUCKET } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ReportCategory, School } from "@/types/database";

type UploadItem = { file: File; progress: number; status: "ready" | "uploading" | "done" | "error" };

export function ReportUploadForm({
  categories,
  schools,
  canChooseSchool = false
}: {
  categories: ReportCategory[];
  schools?: School[];
  canChooseSchool?: boolean;
}) {
  const [files, setFiles] = React.useState<UploadItem[]>([]);
  const [pending, setPending] = React.useState(false);

  function addFiles(fileList: FileList | null) {
    const incoming = Array.from(fileList ?? []);
    const valid: UploadItem[] = [];
    for (const file of incoming) {
      if (!ACCEPTED_REPORT_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not an allowed file type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than ${formatBytes(MAX_FILE_SIZE)}.`);
        continue;
      }
      valid.push({ file, progress: 0, status: "ready" });
    }
    setFiles((current) => [...current, ...valid]);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!files.length) {
      toast.error("Attach at least one file before submitting.");
      return;
    }

    setPending(true);
    const formData = new FormData(form);
    const result = await createReport(null, formData);
    if (result?.error || !result?.reportId || !result.schoolId) {
      toast.error(result?.error ?? "Unable to create report.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    for (const item of files) {
      const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${result.schoolId}/${result.reportId}/${crypto.randomUUID()}-${safeName}`;
      try {
        setFiles((current) =>
          current.map((entry) =>
            entry.file === item.file ? { ...entry, progress: 20, status: "uploading" } : entry
          )
        );
        const { error: uploadError } = await supabase.storage.from(REPORT_BUCKET).upload(storagePath, item.file, {
          cacheControl: "3600",
          contentType: item.file.type,
          upsert: false
        });
        if (uploadError) throw uploadError;
        setFiles((current) =>
          current.map((entry) =>
            entry.file === item.file ? { ...entry, progress: 100, status: "done" } : entry
          )
        );
      } catch (error) {
        setFiles((current) =>
          current.map((entry) => (entry.file === item.file ? { ...entry, status: "error" } : entry))
        );
        toast.error(error instanceof Error ? error.message : "Upload failed.");
        setPending(false);
        return;
      }

      const fileForm = new FormData();
      fileForm.set("report_id", result.reportId);
      fileForm.set("file_name", item.file.name);
      fileForm.set("file_type", item.file.type);
      fileForm.set("file_size", String(item.file.size));
      fileForm.set("storage_path", storagePath);
      const attached = await attachReportFile(null, fileForm);
      if (attached?.error) toast.error(attached.error);
    }

    toast.success("Report uploaded for review.");
    setPending(false);
    setFiles([]);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload report</CardTitle>
        <CardDescription>Accepted files: PDF, Word, Excel, PNG, JPG, JPEG. Maximum size is {formatBytes(MAX_FILE_SIZE)} per file.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Report title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select id="category_id" name="category_id" required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            {canChooseSchool ? (
              <div className="space-y-2">
                <Label htmlFor="school_id">School</Label>
                <Select id="school_id" name="school_id" required>
                  <option value="">Select school</option>
                  {schools?.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="reporting_period">Reporting period</Label>
              <Input id="reporting_period" name="reporting_period" type="month" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div
            className="rounded-lg border-2 border-dashed bg-secondary/45 p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
          >
            <FileUp className="mx-auto mb-3 size-10 text-primary" />
            <p className="font-medium">Drag files here or browse from your device</p>
            <p className="mt-1 text-sm text-muted-foreground">Files are stored in a private Supabase bucket.</p>
            <Input className="mx-auto mt-4 max-w-sm" type="file" multiple accept={ACCEPTED_REPORT_EXTENSIONS} onChange={(event) => addFiles(event.target.files)} />
          </div>
          {files.length ? (
            <div className="space-y-2">
              {files.map((item) => (
                <div key={`${item.file.name}-${item.file.size}`} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFiles((current) => current.filter((entry) => entry !== item))}
                      disabled={pending}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <Button disabled={pending} type="submit">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
            Submit report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
