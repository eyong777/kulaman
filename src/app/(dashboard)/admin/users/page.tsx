import { Users } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/forms/resource-forms";
import { UserActions } from "@/components/user-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { roleLabels } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { getSchools, getUsers } from "@/lib/queries";

export default async function UsersManagementPage() {
  await requireProfile(["admin"]);
  const [users, schools] = await Promise.all([getUsers(), getSchools()]);
  return (
    <>
      <PageHeader title="Users Management" description="Create users, assign schools, manage the School Head account, and reset passwords." icon={Users} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>{roleLabels[user.role]}</TableCell>
                  <TableCell>{user.schools?.name ?? "Not assigned"}</TableCell>
                  <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-3">
                      <Badge variant={user.is_active ? "success" : "destructive"}>{user.is_active ? "Active" : "Inactive"}</Badge>
                      <UserActions userId={user.id} isActive={user.is_active} canManage={user.role !== "admin"} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <UserForm schools={schools} />
      </div>
    </>
  );
}
