
import { Image, MessageCircle, Compass, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/hooks/useProfile";

interface AppHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile | null;
  onShowProfileEdit: () => void;
}

const AppHeader = ({ activeTab, setActiveTab, profile, onShowProfileEdit }: AppHeaderProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          PulseChat
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "feed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("feed")}
            className={activeTab === "feed" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <Image className="w-4 h-4 mr-1" />
            Feed
          </Button>
          <Button
            variant={activeTab === "explore" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("explore")}
            className={activeTab === "explore" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <Compass className="w-4 h-4 mr-1" />
            Explore
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className={activeTab === "chat" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </Button>
          
          <div className="flex items-center gap-2 ml-4">
            <Avatar className="w-8 h-8 cursor-pointer" onClick={onShowProfileEdit}>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
