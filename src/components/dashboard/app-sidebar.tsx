import { useState } from "react";
import { 
  TrendingUp, 
  Search, 
  Star, 
  Mail, 
  Settings, 
  BarChart3, 
  DollarSign,
  PieChart,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import quantsentHero from "@/assets/quantsent-hero.jpg";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Stock Search", url: "/search", icon: Search },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "News Feed", url: "/news", icon: Activity },
  { title: "Alerts", url: "/alerts", icon: Mail },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-finance" 
      : "hover:bg-muted/50 text-foreground";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                QuantSent
              </h2>
              <p className="text-xs text-muted-foreground">
                AI Market Sentiment
              </p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${getNavClass({ isActive })}
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Live Markets</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Market opens in 2h 15m
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}