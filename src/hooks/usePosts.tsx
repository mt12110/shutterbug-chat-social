
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
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        toast({
          title: "Error loading posts",
          description: postsError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Then get profiles for all users
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine posts with profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesData?.find(profile => profile.id === post.user_id) || null
      })) || [];

      setPosts(postsWithProfiles);
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
    is_disappearing?: boolean;
  }) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
          likes_count: 0,
          comments_count: 0
        })
        .select()
        .single();

      if (postError) {
        toast({
          title: "Error creating post",
          description: postError.message,
          variant: "destructive"
        });
        return { error: postError };
      }

      // Get the profile for this user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const postWithProfile = {
        ...newPost,
        profiles: profileData || null
      };

      setPosts(prev => [postWithProfile, ...prev]);
      toast({
        title: "Post created",
        description: "Your post has been shared successfully"
      });
      return { data: postWithProfile };
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
