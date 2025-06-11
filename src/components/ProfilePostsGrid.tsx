
import { Heart, MessageCircle, Image } from "lucide-react";

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

interface ProfilePostsGridProps {
  posts: UserPost[];
  getLikeCount: (postId: string) => number;
  onPostClick: (post: UserPost) => void;
}

const ProfilePostsGrid = ({ posts, getLikeCount, onPostClick }: ProfilePostsGridProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium mb-2">No posts yet</p>
        <p className="text-sm">This user hasn't shared anything yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="relative aspect-square group cursor-pointer"
          onClick={() => onPostClick(post)}
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
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground" />
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
  );
};

export default ProfilePostsGrid;
