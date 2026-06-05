import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SchoolProfileForm } from "@/components/forms/resource-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { getSchool } from "@/lib/queries";

export default async function SchoolProfilePage() {
  const profile = await requireProfile(["school_user"]);
  if (!profile.school_id) {
    return (
      <>
        <PageHeader title="School Profile" description="Your account must be assigned to a school before editing a profile." icon={Building2} />
      </>
    );
  }
  const school = await getSchool(profile.school_id);
  return (
    <>
      <PageHeader title="School Profile" description="Keep your official school contact information accurate for reporting." icon={Building2} />
      <Card>
        <CardHeader>
          <CardTitle>{school.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolProfileForm school={school} />
        </CardContent>
      </Card>
    </>
  );
}
