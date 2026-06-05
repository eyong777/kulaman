import { Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/forms/resource-forms";
import { PasswordSettingsForm } from "@/components/forms/password-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const profile = await requireProfile(["admin"]);
  return (
    <>
      <PageHeader title="Settings" description="Manage your account display information." icon={Settings} />
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
