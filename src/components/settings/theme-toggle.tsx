import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    
    // Save preference to localStorage
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    
    // Apply theme to document
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDark ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-primary" />
          )}
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize your visual experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Dark Mode</Label>
            <div className="text-sm text-muted-foreground">
              Switch between light and dark themes
            </div>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
          />
        </div>
        
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="h-8 w-8 text-primary" />
            ) : (
              <Sun className="h-8 w-8 text-primary" />
            )}
            <div>
              <h4 className="font-medium">
                {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isDark 
                  ? "Easy on the eyes during night time" 
                  : "Clean and bright interface"
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}