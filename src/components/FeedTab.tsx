
import { useState } from "react";
import { Plus, Image, Clock, Zap, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import CreatePost from "./CreatePost";
import type { Profile } from "@/hooks/useProfile";

interface FeedTabProps {
  profile: Profile | null;
  onOpenProfile: (username: string) => void;
  onShowComments: (postId: number) => void;
  onShowShare: (postId: number) => void;
}

const FeedTab = ({ profile, onOpenProfile, onShowComments, onShowShare }: FeedTabProps) => {
  const { posts, loading: postsLoading } = usePosts();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: string) => {
    const numericId = parseInt(postId);
    setLikedPosts(prev => 
      prev.includes(numericId) 
        ? prev.filter(id => id !== numericId)
        : [...prev, numericId]
    );
    
    toast({
      title: likedPosts.includes(numericId) ? "Unliked!" : "Liked!",
      description: likedPosts.includes(numericId) ? "Removed from favorites" : "Added to favorites",
    });
  };

  return (
    <div className="space-y-6">
      {showCreatePost && (
        <div className="mb-6">
          <CreatePost onClose={() => setShowCreatePost(false)} />
        </div>
      )}

      {/* Create Post */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Input 
              placeholder="Share something amazing..." 
              className="flex-1 border-purple-200 focus:border-purple-400"
              onClick={() => setShowCreatePost(true)}
              readOnly
            />
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {postsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-4 text-purple-300" />
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-sm">Be the first to share something amazing!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <Avatar className="cursor-pointer" onClick={() => onOpenProfile(post.profiles?.username || '')}>
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 cursor-pointer" onClick={() => onOpenProfile(post.profiles?.username || '')}>
                      {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                    </p>
                    {post.is_disappearing && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        <Clock className="w-3 h-3 mr-1" />
                        24h
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{post.location || 'Unknown location'} • {new Date(post.created_at).toLocaleDateString()}</p>
                  {post.mood && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs mt-1">
                      {post.mood}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Post Media */}
              {(post.image_url || post.video_url) && (
                <div className="relative">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="w-full h-80 object-cover"
                    />
                  ) : post.video_url ? (
                    <video 
                      src={post.video_url} 
                      className="w-full h-80 object-cover"
                      controls
                    />
                  ) : null}
                  {post.is_disappearing && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        Disappearing
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${
                      likedPosts.includes(parseInt(post.id)) 
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${likedPosts.includes(parseInt(post.id)) ? 'fill-current' : ''}`} />
                    {(post.likes_count || 0) + (likedPosts.includes(parseInt(post.id)) ? 1 : 0)}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => onShowComments(parseInt(post.id))}
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    Comment
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onShowShare(parseInt(post.id))}
                  >
                    <Send className="w-5 h-5 mr-1" />
                    Share
                  </Button>
                </div>
                {post.caption && (
                  <p className="text-gray-800">
                    <span className="font-semibold cursor-pointer" onClick={() => onOpenProfile(post.profiles?.username || '')}>
                      {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                    </span>{" "}
                    {post.caption}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default FeedTab;
