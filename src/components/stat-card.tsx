import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "bg-secondary text-primary",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal">{value}</p>
        </div>
        <div className={`grid size-12 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}
