import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Edit, Save, X } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export function UserProfile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // For now, use user metadata since profiles table might not exist yet
        const displayName = user.user_metadata?.full_name || "";
        const phone = user.phone || "";
        
        setProfile({
          id: user.id,
          full_name: displayName,
          phone: phone
        });
        
        setEditForm({
          full_name: displayName,
          phone: phone
        });
      }
    };

    getUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For now, just update local state since profiles table might not exist yet
      setProfile({
        id: user.id,
        full_name: editForm.full_name,
        phone: editForm.phone
      });
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated locally",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      full_name: profile?.full_name || user?.user_metadata?.full_name || "",
      phone: profile?.phone || user?.phone || ""
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Please sign in to view your profile
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || "User";
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Manage your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{displayName}</h3>
            <Badge variant="secondary" className="text-xs">
              {user.email_confirmed_at ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md">
                {displayName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <div className="p-3 bg-muted/50 rounded-md flex items-center justify-between">
              <span>{user.email}</span>
              <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                {user.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter your phone number"
                type="tel"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md">
                {profile?.phone || user.phone || "Not provided"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <div className="p-3 bg-muted/50 rounded-md font-mono text-sm text-muted-foreground">
              {user.id}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <div className="p-3 bg-muted/50 rounded-md">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}