
import { useState } from "react";
import { MessageCircle, Send, Image, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import VoiceMessage from "./VoiceMessage";

const ChatTab = () => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);

  // Mock data for chats
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

  const sendVoiceMessage = (audioBlob: Blob) => {
    console.log("Sending voice message:", audioBlob);
    setShowVoiceMessage(false);
    toast({
      title: "Voice message sent!",
      description: "Your voice message has been delivered",
    });
  };

  return (
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
  );
};

export default ChatTab;
