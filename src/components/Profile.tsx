
import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Heart, MessageCircle, Send, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { useFollows } from "@/hooks/useFollows";

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
}

const Profile = ({ userId, onBack }: ProfileProps) => {
  const { user } = useAuth();
  const { getLikeCount } = useLikes();
  const { following, toggleFollow } = useFollows();
  const [activeTab, setActiveTab] = useState("posts");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);

  const isFollowing = following.some(follow => follow.following?.username === userId);

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

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      setUserPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleFollow = async () => {
    if (!userProfile) return;
    await toggleFollow(userProfile.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Post</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <Avatar>
                  {userProfile.avatar_url && <AvatarImage src={userProfile.avatar_url} />}
                  <AvatarFallback>{(userProfile.display_name || userProfile.username || 'U')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {userProfile.display_name || userProfile.username || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedPost.location || 'Unknown location'} • {new Date(selectedPost.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Post Media */}
              {(selectedPost.image_url || selectedPost.video_url) && (
                <div className="relative">
                  {selectedPost.image_url ? (
                    <img src={selectedPost.image_url} alt="Post" className="w-full h-auto object-cover" />
                  ) : selectedPost.video_url ? (
                    <video src={selectedPost.video_url} className="w-full h-auto object-cover" controls />
                  ) : null}
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="w-5 h-5" />
                    <span>{getLikeCount(selectedPost.id)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedPost.comments_count || 0}</span>
                  </div>
                </div>
                {selectedPost.caption && (
                  <p className="text-gray-800">{selectedPost.caption}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">{userProfile.username}</h1>
          </div>
          {user?.id === userProfile.id && (
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Info */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
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
                  <h2 className="text-2xl font-bold text-gray-900">{userProfile.display_name || userProfile.username}</h2>
                </div>
                {userProfile.bio && <p className="text-gray-600 mb-4">{userProfile.bio}</p>}
                
                <div className="flex gap-6 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{userPosts.length}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{userProfile.followers_count || 0}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{userProfile.following_count || 0}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>

                {user?.id !== userProfile.id && (
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "border-blue-200" : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex border-b border-blue-100 mb-6">
          <Button 
            variant="ghost" 
            className={`flex-1 ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 ${activeTab === 'tagged' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => setActiveTab('tagged')}
          >
            Tagged
          </Button>
        </div>

        {/* Posts Grid */}
        {userPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Image className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <p className="text-lg font-medium mb-2">No posts yet</p>
            <p className="text-sm">This user hasn't shared anything yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPosts.map((post) => (
              <div 
                key={post.id} 
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt="Post" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : post.video_url ? (
                  <video 
                    src={post.video_url} 
                    className="w-full h-full object-cover rounded-lg"
                    muted
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{getLikeCount(post.id)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
