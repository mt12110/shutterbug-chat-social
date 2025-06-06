
import { useState } from "react";
import { ArrowLeft, Camera, Heart, MessageCircle, Send, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileProps {
  userId: string;
  onBack: () => void;
}

const Profile = ({ userId, onBack }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState("posts");

  // Mock user data - in real app this would come from props or API
  const user = {
    id: userId,
    username: "sarah_travels",
    displayName: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
    bio: "✈️ Travel enthusiast | 📸 Photography lover | 🌍 Exploring the world",
    followers: 1234,
    following: 567,
    posts: 89,
    mood: "🌅 Feeling adventurous",
    isOnline: true,
    lastSeen: "2 minutes ago"
  };

  const stories = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
      timestamp: "2h ago",
      viewed: false
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
      timestamp: "5h ago",
      viewed: true
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
      timestamp: "1d ago",
      viewed: false
    }
  ];

  const userPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=300&fit=crop",
      likes: 124,
      comments: 12
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop",
      likes: 256,
      comments: 24
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=300&h=300&fit=crop",
      likes: 189,
      comments: 18
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Info */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {user.mood}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">{user.bio}</p>
                
                <div className="flex gap-6 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.posts}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.followers}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.following}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="border-purple-200">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stories */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Stories</h3>
            <div className="flex gap-4 overflow-x-auto">
              {stories.map((story) => (
                <div key={story.id} className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full p-1 ${
                    story.viewed ? 'bg-gray-300' : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    <img 
                      src={story.image} 
                      alt="Story" 
                      className="w-full h-full rounded-full object-cover cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">{story.timestamp}</p>
                </div>
              ))}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center cursor-pointer hover:bg-purple-50">
                  <Plus className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">Add</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-100 mb-6">
          <Button 
            variant="ghost" 
            className={`flex-1 ${activeTab === 'posts' ? 'border-b-2 border-purple-600 text-purple-600' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 ${activeTab === 'tagged' ? 'border-b-2 border-purple-600 text-purple-600' : ''}`}
            onClick={() => setActiveTab('tagged')}
          >
            Tagged
          </Button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-2">
          {userPosts.map((post) => (
            <div key={post.id} className="relative aspect-square group cursor-pointer">
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
