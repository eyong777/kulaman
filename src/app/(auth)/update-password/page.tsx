import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update password</CardTitle>
        <CardDescription>Create your own password before continuing to the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
