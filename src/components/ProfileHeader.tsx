
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

interface ProfileHeaderProps {
  userProfile: UserProfile;
  postsCount: number;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
}

const ProfileHeader = ({ 
  userProfile, 
  postsCount, 
  isOwnProfile, 
  isFollowing, 
  onFollowToggle 
}: ProfileHeaderProps) => {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              {userProfile.avatar_url && <AvatarImage src={userProfile.avatar_url} />}
              <AvatarFallback>{(userProfile.display_name || userProfile.username || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{userProfile.display_name || userProfile.username}</h2>
            </div>
            {userProfile.bio && <p className="text-muted-foreground mb-4">{userProfile.bio}</p>}
            
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-foreground">{postsCount}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{userProfile.followers_count || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{userProfile.following_count || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "border-border" : "bg-primary hover:bg-primary/90"}
                  onClick={onFollowToggle}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
