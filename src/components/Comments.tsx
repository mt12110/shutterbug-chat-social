
import { useState } from "react";
import { Send, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";

interface CommentsProps {
  postId: string;
  onClose: () => void;
}

const Comments = ({ postId, onClose }: CommentsProps) => {
  const { user } = useAuth();
  const { comments, loading, addComment } = useComments(postId);
  const [newComment, setNewComment] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setAdding(true);
    const result = await addComment(newComment.trim());
    if (!result.error) {
      setNewComment("");
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="bg-white w-full max-w-md">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-4 p-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    {comment.user?.avatar_url && (
                      <AvatarImage src={comment.user.avatar_url} />
                    )}
                    <AvatarFallback>
                      {(comment.user?.display_name || comment.user?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.user?.display_name || comment.user?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-800">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {user?.user_metadata?.avatar_url && (
                <AvatarImage src={user.user_metadata.avatar_url} />
              )}
              <AvatarFallback>
                {(user?.email || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..." 
              className="flex-1 border-purple-200 focus:border-purple-400"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              disabled={adding}
            />
            <Button 
              onClick={handleAddComment}
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={adding || !newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Comments;
