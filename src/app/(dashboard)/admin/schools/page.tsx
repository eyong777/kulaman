import { Building2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SchoolForm } from "@/components/forms/resource-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { getSchools } from "@/lib/queries";

export default async function SchoolsManagementPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireProfile(["admin"]);
  const params = await searchParams;
  const schools = await getSchools();
  const selected = schools.find((school) => school.id === params.edit);
  return (
    <>
      <PageHeader title="Schools Management" description="Manage the 25 public schools and their official profile data." icon={Building2} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div className="font-medium">{school.name}</div>
                    <div className="text-xs text-muted-foreground">{school.school_id}</div>
                  </TableCell>
                  <TableCell>{school.district ?? "Not set"}</TableCell>
                  <TableCell>{school.head_name ?? "Not set"}</TableCell>
                  <TableCell>{school.contact_email ?? school.contact_phone ?? "Not set"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/schools?edit=${school.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <SchoolForm school={selected} />
      </div>
    </>
  );
}
