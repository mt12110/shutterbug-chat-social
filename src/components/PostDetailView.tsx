
import { useState } from 'react';
import { X, Heart, MessageCircle, Send, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useLikes } from '@/hooks/useLikes';
import { useToast } from '@/hooks/use-toast';

interface PostDetailViewProps {
  post: {
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
  };
  onClose: () => void;
  onShowComments: (postId: string) => void;
  onShowShare: (postId: string) => void;
}

const PostDetailView = ({ post, onClose, onShowComments, onShowShare }: PostDetailViewProps) => {
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const { toast } = useToast();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleLike = async () => {
    const wasLiked = isLiked(post.id);
    const result = await toggleLike(post.id);
    if (!result.error) {
      toast({
        title: wasLiked ? "Unliked!" : "Liked!",
        description: wasLiked ? "Removed from favorites" : "Added to favorites"
      });
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {/* Media Section */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {post.image_url ? (
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="flex items-center justify-center h-96 text-white">
                      <p>Failed to load image</p>
                    </div>
                  ) : (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="max-h-[90vh] max-w-full object-contain"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ display: imageLoading ? 'none' : 'block' }}
                    />
                  )}
                </div>
              ) : post.video_url ? (
                <video 
                  src={post.video_url} 
                  className="max-h-[90vh] max-w-full object-contain"
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-white">
                  <p>No media</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="w-96 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {post.profiles?.avatar_url && <AvatarImage src={post.profiles.avatar_url} />}
                    <AvatarFallback>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.profiles?.display_name || post.profiles?.username || 'Unknown User'}</p>
                    {post.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption */}
              <div className="flex-1 p-4">
                {post.caption && (
                  <div className="mb-4">
                    <p className="text-sm">{post.caption}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${isLiked(post.id) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-600'}`}
                    onClick={handleLike}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${isLiked(post.id) ? 'fill-current' : ''}`} />
                    {getLikeCount(post.id)}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => onShowComments(post.id)}
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    Comment
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => onShowShare(post.id)}
                  >
                    <Send className="w-5 h-5 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailView;
