
import { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MessagesList from './MessagesList';

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

const ChatTab = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

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

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const filteredProfiles = profiles.filter(profile =>
    (profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     profile.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartChat = (profile: Profile) => {
    setSelectedUserId(profile.id);
    setSelectedUserName(profile.display_name || profile.username || 'Unknown User');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
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
              filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => handleStartChat(profile)}
                >
                  <Avatar>
                    {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
                    <AvatarFallback>
                      {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {profile.display_name || profile.username || 'Unknown User'}
                    </p>
                    {profile.username && profile.display_name !== profile.username && (
                      <p className="text-sm text-gray-500">@{profile.username}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatTab;
