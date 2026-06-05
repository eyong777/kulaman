import { ListChecks } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CategoryForm } from "@/components/forms/resource-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireProfile(["admin"]);
  const params = await searchParams;
  const categories = await getCategories();
  const selected = categories.find((category) => category.id === params.edit);
  return (
    <>
      <PageHeader title="Categories" description="Maintain report categories available to schools during upload." icon={ListChecks} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description ?? "No description"}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "success" : "outline"}>{category.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/categories?edit=${category.id}#category-form`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <div id="category-form" className="scroll-mt-24">
          <CategoryForm category={selected} />
        </div>
      </div>
    </>
  );
}
