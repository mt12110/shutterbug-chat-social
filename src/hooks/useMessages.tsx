
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
      console.log('Fetching messages between:', user.id, 'and', otherUserId);
      
      const { data: messagesData, error } = await supabase
        .from('messages' as any)
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get profiles for message senders
      const senderIds = [...new Set(messagesData?.map((msg: any) => msg.sender_id) || [])];
      let profilesData = [];
      
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', senderIds);
        profilesData = profiles || [];
      }

      const messagesWithProfiles = messagesData?.map((message: any) => ({
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        content: message.content,
        created_at: message.created_at,
        read_at: message.read_at,
        sender: profilesData?.find((profile: any) => profile.id === message.sender_id) || null
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
        .from('messages' as any)
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          content
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Send message error:', error);
        toast({
          title: "Error sending message",
          description: error?.message || 'Failed to send message',
          variant: "destructive"
        });
        return { error };
      }

      // Type guard to ensure data has the expected structure
      if (data === null || typeof data !== 'object' || !('id' in data)) {
        console.error('Invalid data structure:', data);
        toast({
          title: "Error sending message",
          description: 'Invalid response from server',
          variant: "destructive"
        });
        return { error: 'Invalid response' };
      }

      // Get sender profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const messageWithProfile = {
        id: (data as any).id,
        sender_id: (data as any).sender_id,
        receiver_id: (data as any).receiver_id,
        content: (data as any).content,
        created_at: (data as any).created_at,
        read_at: (data as any).read_at,
        sender: profileData || null
      };

      setMessages(prev => [...prev, messageWithProfile]);
      return { data: messageWithProfile };
    } catch (error: any) {
      console.error('Send message error:', error);
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
