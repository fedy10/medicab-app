import { supabase } from '../supabase';
import type { Database } from '../database.types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

// ============================================
// CHAT SERVICE
// ============================================

export const chatService = {
  // Récupérer les conversations d'un utilisateur
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les messages entre deux utilisateurs
  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Envoyer un message
  async sendMessage(message: Database['public']['Tables']['chat_messages']['Insert']) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer les messages comme lus
  async markAsRead(userId: string, otherUserId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Supprimer un message
  async deleteMessage(id: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Modifier un message
  async editMessage(id: string, content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content, edited: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Compter les messages non lus
  async countUnread(userId: string) {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // S'abonner aux nouveaux messages (temps réel)
  subscribeToMessages(userId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  },
};
