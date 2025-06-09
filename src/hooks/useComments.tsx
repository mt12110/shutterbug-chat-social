
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useComments = (postId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      // Get profiles for comment authors
      const userIds = [...new Set(commentsData?.map((comment: any) => comment.user_id) || [])];
      let profilesData = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds);
        profilesData = profiles || [];
      }

      const commentsWithProfiles = commentsData?.map((comment: any) => ({
        ...comment,
        user: profilesData?.find((profile: any) => profile.id === comment.user_id) || null
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !postId) return { error: 'No user or post found' };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Add comment error:', error);
        toast({
          title: "Error adding comment",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const commentWithProfile = {
        ...data,
        user: profileData || null
      };

      setComments(prev => [...prev, commentWithProfile]);
      return { data: commentWithProfile };
    } catch (error: any) {
      console.error('Add comment error:', error);
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    fetchComments
  };
};
