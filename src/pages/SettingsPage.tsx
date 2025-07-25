import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmailNotifications } from "@/components/dashboard/email-notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/dashboard/notification-settings";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage your email alerts and notification preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmailNotifications />
          <NotificationSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}