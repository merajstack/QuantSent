import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { UserProfile } from "@/components/profile/user-profile";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LogoutSection } from "@/components/settings/logout-section";
import { NotificationSettings } from "@/components/dashboard/notification-settings";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UserProfile />
            <ThemeToggle />
          </div>
          <div className="space-y-6">
            <NotificationSettings />
            <LogoutSection />
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}