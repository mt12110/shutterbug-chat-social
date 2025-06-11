
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
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

interface PostDetailViewProps {
  post: UserPost;
  userProfile: UserProfile;
  getLikeCount: (postId: string) => number;
  onBack: () => void;
}

const PostDetailView = ({ post, userProfile, getLikeCount, onBack }: PostDetailViewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Post</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="bg-card/70 backdrop-blur-sm border-border shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <Avatar>
                {userProfile.avatar_url && <AvatarImage src={userProfile.avatar_url} />}
                <AvatarFallback>{(userProfile.display_name || userProfile.username || 'U')[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {userProfile.display_name || userProfile.username || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">{post.location || 'Unknown location'} • {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Post Media */}
            {(post.image_url || post.video_url) && (
              <div className="relative">
                {post.image_url ? (
                  <img src={post.image_url} alt="Post" className="w-full h-auto object-cover" />
                ) : post.video_url ? (
                  <video src={post.video_url} className="w-full h-auto object-cover" controls />
                ) : null}
              </div>
            )}

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="w-5 h-5" />
                  <span>{getLikeCount(post.id)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments_count || 0}</span>
                </div>
              </div>
              {post.caption && (
                <p className="text-foreground">{post.caption}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetailView;
