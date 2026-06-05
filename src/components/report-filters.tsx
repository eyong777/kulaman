import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReportCategory, School } from "@/types/database";

export function ReportFilters({
  schools,
  categories,
  showSchools = true
}: {
  schools: School[];
  categories: ReportCategory[];
  showSchools?: boolean;
}) {
  return (
    <form className="mb-4 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
      {showSchools ? (
        <Select name="schoolId">
          <option value="">All schools</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </Select>
      ) : null}
      <Select name="categoryId">
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Select name="status">
        <option value="">All status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </Select>
      <Input name="from" type="date" aria-label="From date" />
      <Input name="to" type="date" aria-label="To date" />
      <Button className="md:col-span-5">Apply filters</Button>
    </form>
  );
}
