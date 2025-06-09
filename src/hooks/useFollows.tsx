
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  following?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useFollows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollows = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching follows for user:', user.id);
      
      // Get followers - use raw SQL query since types aren't synced
      const { data: followersData, error: followersError } = await supabase
        .rpc('get_followers', { user_id: user.id })
        .then(() => ({ data: null, error: { message: 'Function not found' } }))
        .catch(async () => {
          // Fallback to direct table query
          return await supabase
            .from('follows' as any)
            .select('*')
            .eq('following_id', user.id);
        });

      // Get following - use raw SQL query since types aren't synced  
      const { data: followingData, error: followingError } = await supabase
        .rpc('get_following', { user_id: user.id })
        .then(() => ({ data: null, error: { message: 'Function not found' } }))
        .catch(async () => {
          // Fallback to direct table query
          return await supabase
            .from('follows' as any)
            .select('*')
            .eq('follower_id', user.id);
        });

      if (followersError && !followersError.message.includes('Function not found')) {
        console.error('Error fetching followers:', followersError);
      }
      
      if (followingError && !followingError.message.includes('Function not found')) {
        console.error('Error fetching following:', followingError);
      }

      // Get profiles for followers and following
      const followerIds = followersData?.map((f: any) => f.follower_id) || [];
      const followingIds = followingData?.map((f: any) => f.following_id) || [];
      const allUserIds = [...new Set([...followerIds, ...followingIds])];

      let profilesData = [];
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', allUserIds);
        profilesData = profiles || [];
      }

      const followersWithProfiles = followersData?.map((follow: any) => ({
        ...follow,
        follower: profilesData?.find((profile: any) => profile.id === follow.follower_id) || null
      })) || [];

      const followingWithProfiles = followingData?.map((follow: any) => ({
        ...follow,
        following: profilesData?.find((profile: any) => profile.id === follow.following_id) || null
      })) || [];

      setFollowers(followersWithProfiles);
      setFollowing(followingWithProfiles);
    } catch (error: any) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('follows' as any)
        .insert({
          follower_id: user.id,
          following_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Follow error:', error);
        toast({
          title: "Error following user",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Success",
        description: "You are now following this user"
      });

      fetchFollows(); // Refresh the lists
      return { data };
    } catch (error: any) {
      console.error('Follow error:', error);
      toast({
        title: "Error following user",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('follows' as any)
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Unfollow error:', error);
        toast({
          title: "Error unfollowing user",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Success",
        description: "You have unfollowed this user"
      });

      fetchFollows(); // Refresh the lists
      return { data: true };
    } catch (error: any) {
      console.error('Unfollow error:', error);
      toast({
        title: "Error unfollowing user",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const isFollowing = (userId: string) => {
    return following.some(follow => follow.following_id === userId);
  };

  useEffect(() => {
    fetchFollows();
  }, [user]);

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    fetchFollows
  };
};
