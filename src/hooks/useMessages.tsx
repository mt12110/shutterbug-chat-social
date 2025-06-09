
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useMessages = (otherUserId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user || !otherUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get profiles for message senders
      const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', senderIds);

      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        sender: profilesData?.find(profile => profile.id === message.sender_id) || null
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !otherUserId) return { error: 'No user or recipient found' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          content
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Get sender profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const messageWithProfile = {
        ...data,
        sender: profileData || null
      };

      setMessages(prev => [...prev, messageWithProfile]);
      return { data: messageWithProfile };
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, otherUserId]);

  return {
    messages,
    loading,
    sendMessage,
    fetchMessages
  };
};
