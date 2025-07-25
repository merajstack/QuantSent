import { useState } from "react";
import { Clock, Bell, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    priceAlerts: true,
    sentimentAlerts: false,
    dailyTime: "09:00",
    weeklyTime: "monday"
  });
  const { toast } = useToast();

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // TODO: Save to API
    // await axios.put('/api/user/notification-settings', { [key]: value });
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alert Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Price Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when stock prices hit your targets
              </div>
            </div>
            <Switch
              checked={settings.priceAlerts}
              onCheckedChange={(checked) => handleSettingChange("priceAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sentiment Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Alerts when sentiment changes significantly
              </div>
            </div>
            <Switch
              checked={settings.sentimentAlerts}
              onCheckedChange={(checked) => handleSettingChange("sentimentAlerts", checked)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Daily Report Time
            </Label>
            <Select
              value={settings.dailyTime}
              onValueChange={(value) => handleSettingChange("dailyTime", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Weekly Summary Day
            </Label>
            <Select
              value={settings.weeklyTime}
              onValueChange={(value) => handleSettingChange("weeklyTime", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}