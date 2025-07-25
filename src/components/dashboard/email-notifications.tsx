import { useState } from "react";
import { Mail, Settings, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function EmailNotifications() {
  const [dailyEmails, setDailyEmails] = useState(true);
  const [alertEmails, setAlertEmails] = useState(false);
  const { toast } = useToast();

  const handleDailyToggle = (enabled: boolean) => {
    setDailyEmails(enabled);
    toast({
      title: "Daily Email Settings",
      description: `Daily market sentiment emails ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleAlertToggle = (enabled: boolean) => {
    setAlertEmails(enabled);
    toast({
      title: "Alert Email Settings", 
      description: `Instant sentiment alerts ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Stay updated with personalized market sentiment alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-finance-gold" />
            <div>
              <div className="font-medium">Daily Market Summary</div>
              <div className="text-sm text-muted-foreground">
                Get daily sentiment analysis at 9 AM EST
              </div>
            </div>
          </div>
          <Switch
            checked={dailyEmails}
            onCheckedChange={handleDailyToggle}
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-accent" />
            <div>
              <div className="font-medium">Instant Alerts</div>
              <div className="text-sm text-muted-foreground">
                Real-time alerts for significant sentiment changes
              </div>
            </div>
          </div>
          <Switch
            checked={alertEmails}
            onCheckedChange={handleAlertToggle}
          />
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Premium Feature</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get personalized AI-powered market insights delivered to your inbox
          </p>
          <Button size="sm" className="bg-gradient-primary">
            Upgrade to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}