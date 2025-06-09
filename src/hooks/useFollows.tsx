
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
      // Get followers
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('*')
        .eq('following_id', user.id);

      // Get following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);

      if (followersError || followingError) {
        console.error('Error fetching follows:', followersError || followingError);
        return;
      }

      // Get profiles for followers
      const followerIds = followersData?.map(f => f.follower_id) || [];
      const followingIds = followingData?.map(f => f.following_id) || [];
      const allUserIds = [...new Set([...followerIds, ...followingIds])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', allUserIds);

      const followersWithProfiles = followersData?.map(follow => ({
        ...follow,
        follower: profilesData?.find(profile => profile.id === follow.follower_id) || null
      })) || [];

      const followingWithProfiles = followingData?.map(follow => ({
        ...follow,
        following: profilesData?.find(profile => profile.id === follow.following_id) || null
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
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        })
        .select()
        .single();

      if (error) {
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
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
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
