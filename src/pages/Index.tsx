import { useState, useEffect } from "react";
import { Send, Image, MessageCircle, Heart, User, Plus, Mic, Clock, Zap, Settings, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import Profile from "@/components/Profile";
import Comments from "@/components/Comments";
import Share from "@/components/Share";
import VoiceMessage from "@/components/VoiceMessage";
import ProfileEditModal from "@/components/ProfileEditModal";
import FileUpload from "@/components/FileUpload";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("feed");
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentView, setCurrentView] = useState("main");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showComments, setShowComments] = useState<number | null>(null);
  const [showShare, setShowShare] = useState<number | null>(null);
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              username,
              display_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
        } else {
          setPosts(data || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Mock data for chats (will be replaced with real data later)
  const chats = [
    {
      id: 1,
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Hey! How was your day?",
      time: "2m ago",
      unread: 2,
      online: true
    }
  ];

  const messages = [
    { id: 1, text: "Hey! How's it going?", sent: false, time: "10:30 AM" },
    { id: 2, text: "Pretty good! Just working on some projects", sent: true, time: "10:32 AM" }
  ];

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    
    toast({
      title: likedPosts.includes(postId) ? "Unliked!" : "Liked!",
      description: likedPosts.includes(postId) ? "Removed from favorites" : "Added to favorites",
    });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
      toast({
        title: "Message sent!",
        description: "Your message has been delivered",
      });
    }
  };

  const openProfile = (username: string) => {
    setSelectedUserId(username);
    setCurrentView("profile");
  };

  const sendVoiceMessage = (audioBlob: Blob) => {
    console.log("Sending voice message:", audioBlob);
    setShowVoiceMessage(false);
    toast({
      title: "Voice message sent!",
      description: "Your voice message has been delivered",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleFileUploadComplete = () => {
    setShowFileUpload(false);
    // Refresh posts
    window.location.reload();
  };

  if (currentView === "profile") {
    return (
      <Profile 
        userId={selectedUserId} 
        onBack={() => setCurrentView("main")} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            PulseChat
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "feed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("feed")}
              className={activeTab === "feed" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
            >
              <Image className="w-4 h-4 mr-1" />
              Feed
            </Button>
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("chat")}
              className={activeTab === "chat" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center gap-2 ml-4">
              <Avatar className="w-8 h-8 cursor-pointer" onClick={() => setShowProfileEdit(true)}>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showFileUpload && (
          <div className="mb-6">
            <FileUpload 
              onUploadComplete={handleFileUploadComplete}
              onCancel={() => setShowFileUpload(false)}
            />
          </div>
        )}

        {activeTab === "feed" && (
          <div className="space-y-6">
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
                    onClick={() => setShowFileUpload(true)}
                    readOnly
                  />
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => setShowFileUpload(true)}
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
                      <Avatar className="cursor-pointer" onClick={() => openProfile(post.profiles?.username || '')}>
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 cursor-pointer" onClick={() => openProfile(post.profiles?.username || '')}>
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
                            likedPosts.includes(post.id) 
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`w-5 h-5 mr-1 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                          {post.likes_count + (likedPosts.includes(post.id) ? 1 : 0)}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          onClick={() => setShowComments(post.id)}
                        >
                          <MessageCircle className="w-5 h-5 mr-1" />
                          Comment
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setShowShare(post.id)}
                        >
                          <Send className="w-5 h-5 mr-1" />
                          Share
                        </Button>
                      </div>
                      {post.caption && (
                        <p className="text-gray-800">
                          <span className="font-semibold cursor-pointer" onClick={() => openProfile(post.profiles?.username || '')}>
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
        )}

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Chat List */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-0 h-full">
                <div className="p-4 border-b border-purple-100">
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="overflow-y-auto h-full">
                  {chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-purple-50 cursor-pointer transition-colors hover:bg-purple-50 ${
                        selectedChat?.id === chat.id ? "bg-purple-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate">{chat.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">{chat.time}</span>
                              {chat.unread > 0 && (
                                <Badge className="bg-purple-600 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                                  {chat.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <div className="md:col-span-2">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {selectedChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-purple-100 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedChat.avatar} />
                          <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedChat.name}</p>
                          <p className="text-sm text-green-500">
                            {selectedChat.online ? "Online" : "Last seen recently"}
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
                          >
                            <div 
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.sent 
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <p className={`text-xs mt-1 ${
                                message.sent ? "text-purple-100" : "text-gray-500"
                              }`}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-purple-100 space-y-3">
                        {showVoiceMessage && (
                          <VoiceMessage 
                            onSend={sendVoiceMessage}
                            onCancel={() => setShowVoiceMessage(false)}
                          />
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600"
                            onClick={() => setShowVoiceMessage(!showVoiceMessage)}
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-purple-600">
                            <Image className="w-5 h-5" />
                          </Button>
                          <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..." 
                            className="flex-1 border-purple-200 focus:border-purple-400"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          />
                          <Button 
                            onClick={sendMessage}
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-purple-300" />
                        <p>Select a chat to start messaging</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showComments && (
        <Comments 
          postId={showComments} 
          onClose={() => setShowComments(null)} 
        />
      )}
      
      {showShare && (
        <Share 
          postId={showShare} 
          onClose={() => setShowShare(null)} 
        />
      )}

      {showProfileEdit && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          profile={profile}
        />
      )}
    </div>
  );
};

export default Index;
