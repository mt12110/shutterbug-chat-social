
import { useState, useEffect } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { useFollows } from "@/hooks/useFollows";
import ProfileHeader from "./ProfileHeader";
import ProfileNavigation from "./ProfileNavigation";
import ProfilePostsGrid from "./ProfilePostsGrid";
import PostDetailView from "./PostDetailView";

interface ProfileProps {
  userId: string;
  onBack: () => void;
}

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

interface UserPost {
  id: string;
  caption?: string;
  image_url?: string;
  video_url?: string;
  location?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const Profile = ({ userId, onBack }: ProfileProps) => {
  const { user } = useAuth();
  const { getLikeCount } = useLikes();
  const { followUser, unfollowUser, isFollowing } = useFollows();
  const [activeTab, setActiveTab] = useState("posts");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);

  const userIsFollowing = userProfile ? isFollowing(userProfile.id) : false;

  const fetchUserProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setUserProfile(profileData);

      // Fetch user's posts with profile data
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      // Add profile data to each post
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: {
          username: profileData.username,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url
        }
      })) || [];

      setUserPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!userProfile) return;
    
    if (userIsFollowing) {
      await unfollowUser(userProfile.id);
    } else {
      await followUser(userProfile.id);
    }
  };

  const handleShowComments = (postId: string) => {
    console.log('Show comments for post:', postId);
    // TODO: Implement comments functionality
  };

  const handleShowShare = (postId: string) => {
    console.log('Show share for post:', postId);
    // TODO: Implement share functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <PostDetailView
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onShowComments={handleShowComments}
        onShowShare={handleShowShare}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{userProfile.username}</h1>
          </div>
          {user?.id === userProfile.id && (
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader
          userProfile={userProfile}
          postsCount={userPosts.length}
          isOwnProfile={user?.id === userProfile.id}
          isFollowing={userIsFollowing}
          onFollowToggle={handleFollowToggle}
        />

        <ProfileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <ProfilePostsGrid
          posts={userPosts}
          getLikeCount={getLikeCount}
          onPostClick={setSelectedPost}
        />
      </div>
    </div>
  );
};

export default Profile;
