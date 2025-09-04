import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { NotificationSettings } from "@/components/dashboard/notification-settings";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and app settings
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ThemeToggle />
          </div>
          <div className="space-y-6">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}