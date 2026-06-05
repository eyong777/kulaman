import { Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/forms/resource-forms";
import { PasswordSettingsForm } from "@/components/forms/password-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";

export default async function SchoolSettingsPage() {
  const profile = await requireProfile(["school_user"]);
  return (
    <>
      <PageHeader title="Settings" description="Manage your school user account information." icon={Settings} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm profile={profile} />
          </CardContent>
        </Card>
        <PasswordSettingsForm />
      </div>
    </>
  );
}
