import { FilePlus2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportUploadForm } from "@/components/forms/report-upload-form";
import { requireProfile } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export default async function UploadReportPage() {
  await requireProfile(["school_user"]);
  const categories = await getCategories(false);
  return (
    <>
      <PageHeader title="Upload Report" description="Submit required documents to the district review queue." icon={FilePlus2} />
      <ReportUploadForm categories={categories} />
    </>
  );
}
