import { FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardContent className="grid place-items-center py-12 text-center">
        <FileSearch className="mb-3 size-10 text-muted-foreground" />
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
