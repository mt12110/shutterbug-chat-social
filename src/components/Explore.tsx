
import { useState, useEffect } from 'react';
import { Search, UserPlus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

const Explore = () => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollows();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('followers_count', { ascending: false });

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
     profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFollowToggle = async (profileId: string) => {
    if (isFollowing(profileId)) {
      await unfollowUser(profileId);
    } else {
      await followUser(profileId);
    }
  };

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
            <Search className="w-5 h-5" />
            Discover People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name, username, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                {searchTerm ? 'No users found matching your search.' : 'No other users found.'}
              </div>
            ) : (
              filteredProfiles.map((profile) => (
                <Card key={profile.id} className="bg-white/50 border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="w-16 h-16">
                        {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        <AvatarFallback className="text-lg">
                          {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {profile.display_name || profile.username || 'Unknown User'}
                        </h3>
                        {profile.username && profile.display_name !== profile.username && (
                          <p className="text-sm text-gray-500">@{profile.username}</p>
                        )}
                      </div>
                      
                      {profile.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                      )}
                      
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold">{profile.posts_count || 0}</div>
                          <div>Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{profile.followers_count || 0}</div>
                          <div>Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{profile.following_count || 0}</div>
                          <div>Following</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <Button
                          variant={isFollowing(profile.id) ? "outline" : "default"}
                          size="sm"
                          className={`flex-1 ${
                            !isFollowing(profile.id) 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                              : ''
                          }`}
                          onClick={() => handleFollowToggle(profile.id)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {isFollowing(profile.id) ? 'Unfollow' : 'Follow'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Explore;
