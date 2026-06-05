import { Bell } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { NotificationList } from "@/components/notification-list";
import { requireProfile } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";

export default async function SchoolHeadNotificationsPage() {
  const profile = await requireProfile(["school_head"]);
  const notifications = await getNotifications(profile.id);
  return (
    <>
      <PageHeader title="Notifications" description="Review updates and system messages assigned to your account." icon={Bell} />
      <NotificationList notifications={notifications} />
    </>
  );
}
