"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReport } from "@/actions/reports";
import { ConfirmButton } from "@/components/ui/dialog";

export function DeleteReportButton({ reportId, redirectTo }: { reportId: string; redirectTo: string }) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  return (
    <ConfirmButton
      message="This will remove the report and its stored files. This action cannot be undone."
      action={() =>
        startTransition(async () => {
          const result = await deleteReport(reportId);
          if (result?.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Report deleted.");
          router.replace(redirectTo);
          router.refresh();
        })
      }
    >
      <Trash2 className="size-4" />
      Delete
    </ConfirmButton>
  );
}
