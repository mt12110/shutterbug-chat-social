
import { useState } from "react";
import { Send, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface CommentsProps {
  postId: number;
  onClose: () => void;
}

const Comments = ({ postId, onClose }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "alex_chen",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
      text: "Amazing shot! 🔥",
      time: "2h ago",
      likes: 12
    },
    {
      id: 2,
      user: "maria_silva",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face",
      text: "Love the colors in this photo!",
      time: "1h ago",
      likes: 8
    },
    {
      id: 3,
      user: "david_park",
      avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop&crop=face",
      text: "Where was this taken? Looks incredible!",
      time: "30m ago",
      likes: 5
    }
  ]);

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: "you",
        avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face",
        text: newComment,
        time: "now",
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

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
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-semibold text-sm text-gray-900">{comment.user}</p>
                    <p className="text-sm text-gray-800">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{comment.time}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-gray-500">
                      <Heart className="w-3 h-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-gray-500">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>
            <Input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..." 
              className="flex-1 border-purple-200 focus:border-purple-400"
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <Button 
              onClick={addComment}
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
