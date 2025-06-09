
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export const useLikes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching likes:', error);
        return;
      }

      setLikes(data || []);
    } catch (error: any) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return { error: 'No user found' };

    try {
      // Check if already liked
      const existingLike = likes.find(like => like.post_id === postId && like.user_id === user.id);

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) {
          console.error('Unlike error:', error);
          return { error };
        }

        setLikes(prev => prev.filter(like => like.id !== existingLike.id));
        return { data: { action: 'unliked' } };
      } else {
        // Like
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })
          .select()
          .single();

        if (error) {
          console.error('Like error:', error);
          return { error };
        }

        setLikes(prev => [...prev, data]);
        return { data: { action: 'liked' } };
      }
    } catch (error: any) {
      console.error('Toggle like error:', error);
      return { error };
    }
  };

  const isLiked = (postId: string) => {
    if (!user) return false;
    return likes.some(like => like.post_id === postId && like.user_id === user.id);
  };

  const getLikeCount = (postId: string) => {
    return likes.filter(like => like.post_id === postId).length;
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  return {
    likes,
    loading,
    toggleLike,
    isLiked,
    getLikeCount,
    fetchLikes
  };
};
