
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

interface MessagesListProps {
  otherUserId: string;
  otherUserName: string;
  onBack: () => void;
}

const MessagesList = ({ otherUserId, otherUserName, onBack }: MessagesListProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(otherUserId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    const result = await sendMessage(newMessage.trim());
    if (!result.error) {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <CardTitle className="text-lg">Chat with {otherUserName}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_id !== user?.id && (
                  <Avatar className="w-8 h-8">
                    {message.sender?.avatar_url && (
                      <AvatarImage src={message.sender.avatar_url} />
                    )}
                    <AvatarFallback>
                      {(message.sender?.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
