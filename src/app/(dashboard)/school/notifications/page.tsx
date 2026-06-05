import { Bell } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { NotificationList } from "@/components/notification-list";
import { requireProfile } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";

export default async function SchoolNotificationsPage() {
  const profile = await requireProfile(["school_user"]);
  const notifications = await getNotifications(profile.id);
  return (
    <>
      <PageHeader title="Notifications" description="Approval, rejection, and follow-up notices for your submitted reports." icon={Bell} />
      <NotificationList notifications={notifications} />
    </>
  );
}
