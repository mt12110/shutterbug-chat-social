
import { useState, useEffect } from "react";
import { Send, X, Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useMessages } from "@/hooks/useMessages";

interface ShareProps {
  postId: string;
  onClose: () => void;
}

const Share = ({ postId, onClose }: ShareProps) => {
  const { user } = useAuth();
  const { following } = useFollows();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const toggleFriend = (userId: string) => {
    setSelectedFriends(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const sharePost = async () => {
    if (selectedFriends.length === 0) return;

    // For now, just show a success message
    // In a real app, you would send messages or notifications
    toast({
      title: "Post shared!",
      description: `Shared with ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}`,
    });
    onClose();
  };

  const copyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied!",
      description: "Post link copied to clipboard",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Share Post</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyLink}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={copyLink}
              >
                <Link className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-b">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)..." 
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Friends List */}
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Send to friends</h4>
            <div className="space-y-3">
              {following.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  You're not following anyone yet. Follow some users to share posts with them!
                </div>
              ) : (
                following.map((follow) => (
                  <div 
                    key={follow.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFriends.includes(follow.following_id) 
                        ? 'bg-purple-100 border border-purple-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleFriend(follow.following_id)}
                  >
                    <Avatar className="w-10 h-10">
                      {follow.following?.avatar_url && (
                        <AvatarImage src={follow.following.avatar_url} />
                      )}
                      <AvatarFallback>
                        {(follow.following?.display_name || follow.following?.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {follow.following?.display_name || follow.following?.username || 'Unknown User'}
                      </p>
                      {follow.following?.username && (
                        <p className="text-sm text-gray-500">@{follow.following.username}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedFriends.includes(follow.following_id)
                        ? 'bg-purple-600 border-purple-600' 
                        : 'border-gray-300'
                    }`}>
                      {selectedFriends.includes(follow.following_id) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t">
          <Button 
            onClick={sharePost}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={selectedFriends.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Share ({selectedFriends.length})
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Share;
