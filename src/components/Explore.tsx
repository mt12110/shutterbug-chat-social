
import { useState, useEffect } from 'react';
import { Search, Users, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ExploreUser {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  interests?: string[];
  posts_count?: number;
  followers_count?: number;
}

const Explore = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(20);

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    !searchTerm || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsersWithSimilarInterests = () => {
    if (!profile?.interests?.length) return [];
    
    return users.filter(u => 
      u.interests?.some(interest => 
        profile.interests?.includes(interest)
      )
    ).slice(0, 6);
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Finding people...</p>
      </div>
    );
  }

  const similarInterestUsers = getUsersWithSimilarInterests();

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent focus:ring-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Similar Interests Section */}
      {similarInterestUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            People with similar interests
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similarInterestUsers.map((user) => (
              <Card key={user.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
                <CardContent className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{(user.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {user.display_name || user.username || 'Anonymous'}
                  </h4>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
                  )}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-3">
                    <span>{user.posts_count || 0} posts</span>
                    <span>{user.followers_count || 0} followers</span>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Follow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {searchTerm ? 'Search Results' : 'Discover People'}
        </h3>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{(user.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {user.display_name || user.username || 'Anonymous'}
                    </h4>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                    {user.bio && (
                      <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                    )}
                    {user.interests && user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.interests.slice(0, 3).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredUsers.length === 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-purple-300" />
                <p className="text-gray-500">
                  {searchTerm ? 'No users found matching your search' : 'No users to discover yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
