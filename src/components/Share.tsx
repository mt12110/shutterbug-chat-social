
import { useState } from "react";
import { Send, X, Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ShareProps {
  postId: number;
  onClose: () => void;
}

const Share = ({ postId, onClose }: ShareProps) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const friends = [
    {
      id: 1,
      name: "Alex Chen",
      username: "alex_chen",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
      selected: false
    },
    {
      id: 2,
      name: "Maria Silva",
      username: "maria_silva",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face",
      selected: false
    },
    {
      id: 3,
      name: "David Park",
      username: "david_park",
      avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop&crop=face",
      selected: false
    }
  ];

  const [selectedFriends, setSelectedFriends] = useState(friends);

  const toggleFriend = (id: number) => {
    setSelectedFriends(prev => 
      prev.map(friend => 
        friend.id === id ? { ...friend, selected: !friend.selected } : friend
      )
    );
  };

  const sharePost = () => {
    const selected = selectedFriends.filter(f => f.selected);
    if (selected.length > 0) {
      toast({
        title: "Post shared!",
        description: `Shared with ${selected.length} friend${selected.length > 1 ? 's' : ''}`,
      });
      onClose();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://pulsechat.app/post/${postId}`);
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
              {selectedFriends.map((friend) => (
                <div 
                  key={friend.id} 
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    friend.selected ? 'bg-purple-100 border border-purple-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFriend(friend.id)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-500">@{friend.username}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    friend.selected 
                      ? 'bg-purple-600 border-purple-600' 
                      : 'border-gray-300'
                  }`}>
                    {friend.selected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t">
          <Button 
            onClick={sharePost}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={selectedFriends.filter(f => f.selected).length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Share ({selectedFriends.filter(f => f.selected).length})
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Share;
