
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  caption?: string;
  image_url?: string;
  video_url?: string;
  location?: string;
  mood?: string;
  is_disappearing?: boolean;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at?: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error loading posts",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setPosts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: {
    caption?: string;
    image_url?: string;
    video_url?: string;
    location?: string;
    mood?: string;
    is_disappearing?: boolean;
  }) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
          likes_count: 0,
          comments_count: 0
        })
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        toast({
          title: "Error creating post",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      setPosts(prev => [data, ...prev]);
      toast({
        title: "Post created",
        description: "Your post has been shared successfully"
      });
      return { data };
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    fetchPosts,
    createPost
  };
};
