import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  icon: Icon,
  action
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        {Icon ? (
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" />
          </div>
        ) : null}
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-slate-950">{title}</h2>
          {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild>
      <a href={href}>{children}</a>
    </Button>
  );
}
