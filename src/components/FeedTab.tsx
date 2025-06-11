
import { useState } from "react";
import { Plus, Image, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useLikes } from "@/hooks/useLikes";
import CreatePost from "./CreatePost";
import type { Profile } from "@/hooks/useProfile";

interface FeedTabProps {
  profile: Profile | null;
  onOpenProfile: (username: string) => void;
  onShowComments: (postId: string) => void;
  onShowShare: (postId: string) => void;
}

const FeedTab = ({
  profile,
  onOpenProfile,
  onShowComments,
  onShowShare
}: FeedTabProps) => {
  const {
    posts,
    loading: postsLoading
  } = usePosts();
  const {
    likes,
    toggleLike,
    isLiked,
    getLikeCount
  } = useLikes();
  const {
    toast
  } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLike = async (postId: string) => {
    const wasLiked = isLiked(postId);
    const result = await toggleLike(postId);
    if (!result.error) {
      toast({
        title: wasLiked ? "Unliked!" : "Liked!",
        description: wasLiked ? "Removed from favorites" : "Added to favorites"
      });
    }
  };

  // Filter posts based on user interests for personalized feed
  const getFilteredPosts = () => {
    if (!profile?.interests || profile.interests.length === 0) {
      return posts; // Show all posts if no interests set
    }
    return posts.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;

      // Score posts based on interest matching
      profile.interests?.forEach(interest => {
        if (a.caption?.toLowerCase().includes(interest.toLowerCase()) || a.location?.toLowerCase().includes(interest.toLowerCase())) {
          aScore += 1;
        }
        if (b.caption?.toLowerCase().includes(interest.toLowerCase()) || b.location?.toLowerCase().includes(interest.toLowerCase())) {
          bScore += 1;
        }
      });

      // Posts with higher interest scores appear first
      if (aScore !== bScore) {
        return bScore - aScore;
      }

      // If scores are equal, sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };
  
  const filteredPosts = getFilteredPosts();
  
  return <div className="space-y-6">
      {showCreatePost && <div className="mb-6">
          <CreatePost onClose={() => setShowCreatePost(false)} />
        </div>}

      {/* Create Post */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Input placeholder="Share something amazing..." className="flex-1 border-blue-200 focus:border-blue-400" onClick={() => setShowCreatePost(true)} readOnly />
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700" onClick={() => setShowCreatePost(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {postsLoading ? <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div> : filteredPosts.length === 0 ? <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-4 text-blue-300" />
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-sm">Be the first to share something amazing!</p>
            </div>
          </CardContent>
        </Card> : filteredPosts.map(post => <Card key={post.id} className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <Avatar className="cursor-pointer" onClick={() => onOpenProfile(post.profiles?.username || '')}>
                  {post.profiles?.avatar_url && <AvatarImage src={post.profiles.avatar_url} />}
                  <AvatarFallback>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 cursor-pointer" onClick={() => onOpenProfile(post.profiles?.username || '')}>
                      {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{post.location || 'Unknown location'} • {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Post Media */}
              {(post.image_url || post.video_url) && <div className="relative">
                  {post.image_url ? <img src={post.image_url} alt="Post" className="w-full h-80 object-cover" /> : post.video_url ? <video src={post.video_url} className="w-full h-80 object-cover" controls /> : null}
                </div>}

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-2">
                  <Button variant="ghost" size="sm" className={`${isLiked(post.id) ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`} onClick={() => handleLike(post.id)}>
                    <Heart className={`w-5 h-5 mr-1 ${isLiked(post.id) ? 'fill-current' : ''}`} />
                    {getLikeCount(post.id)}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onShowComments(post.id)}>
                    <MessageCircle className="w-5 h-5 mr-1" />
                    Comment
                  </Button>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50" onClick={() => onShowShare(post.id)}>
                    <Send className="w-5 h-5 mr-1" />
                    Share
                  </Button>
                </div>
                {post.caption && <p className="text-gray-800">
                    {post.caption}
                  </p>}
              </div>
            </CardContent>
          </Card>)}
    </div>;
};

export default FeedTab;
