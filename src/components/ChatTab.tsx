
import { useState, useEffect } from 'react';
import { MessageCircle, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MessagesList from './MessagesList';

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface MessageNotification {
  sender_id: string;
  count: number;
  latest_message: string;
  latest_time: string;
}

const ChatTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', user.id)
        .order('display_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, content, created_at')
        .eq('receiver_id', user.id)
        .eq('read_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Group notifications by sender
      const groupedNotifications: { [key: string]: MessageNotification } = {};
      
      data?.forEach(message => {
        if (!groupedNotifications[message.sender_id]) {
          groupedNotifications[message.sender_id] = {
            sender_id: message.sender_id,
            count: 0,
            latest_message: message.content,
            latest_time: message.created_at
          };
        }
        groupedNotifications[message.sender_id].count++;
      });

      setNotifications(Object.values(groupedNotifications));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchMessageNotifications();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessageNotifications();
          toast({
            title: "New message",
            description: "You have a new message!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredProfiles = profiles.filter(profile =>
    (profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     profile.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartChat = (profile: Profile) => {
    setSelectedUserId(profile.id);
    setSelectedUserName(profile.display_name || profile.username || 'Unknown User');
    
    // Mark messages as read when opening chat
    markMessagesAsRead(profile.id);
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .is('read_at', null);

      // Refresh notifications
      fetchMessageNotifications();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getNotificationForUser = (userId: string) => {
    return notifications.find(notif => notif.sender_id === userId);
  };

  if (selectedUserId) {
    return (
      <MessagesList
        otherUserId={selectedUserId}
        otherUserName={selectedUserName}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
            {notifications.length > 0 && (
              <Badge className="bg-red-500 text-white">
                {notifications.reduce((total, notif) => total + notif.count, 0)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users to chat with..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {filteredProfiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? 'No users found matching your search.' : 'No other users found.'}
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const notification = getNotificationForUser(profile.id);
                
                return (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors relative"
                    onClick={() => handleStartChat(profile)}
                  >
                    <Avatar>
                      {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
                      <AvatarFallback>
                        {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {profile.display_name || profile.username || 'Unknown User'}
                        </p>
                        {notification && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {notification.count}
                          </Badge>
                        )}
                      </div>
                      {profile.username && profile.display_name !== profile.username && (
                        <p className="text-sm text-gray-500">@{profile.username}</p>
                      )}
                      {notification && (
                        <p className="text-sm text-gray-600 truncate">
                          {notification.latest_message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {notification && (
                        <Bell className="w-4 h-4 text-blue-500" />
                      )}
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatTab;
