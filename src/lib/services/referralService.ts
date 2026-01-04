import { supabase } from '../supabase';
import type { Database } from '../database.types';

type ReferralLetter = Database['public']['Tables']['referral_letters']['Row'];

// ============================================
// REFERRAL SERVICE
// ============================================

export const referralService = {
  // Récupérer toutes les orientations
  async getAll(doctorId?: string) {
    let query = supabase
      .from('referral_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (doctorId) {
      query = query.or(`from_doctor_id.eq.${doctorId},to_doctor_id.eq.${doctorId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Récupérer les orientations d'un médecin (envoyées)
  async getSentByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('referral_letters')
      .select('*')
      .eq('from_doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les orientations reçues par un médecin
  async getReceivedByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('referral_letters')
      .select('*')
      .eq('to_doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les orientations d'un patient
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('referral_letters')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une orientation par ID
  async getById(id: string) {
    const { data, error} = await supabase
      .from('referral_letters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une orientation
  async create(referral: Database['public']['Tables']['referral_letters']['Insert']) {
    const { data, error } = await supabase
      .from('referral_letters')
      .insert(referral)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une orientation
  async update(id: string, updates: Database['public']['Tables']['referral_letters']['Update']) {
    const { data, error } = await supabase
      .from('referral_letters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une orientation
  async delete(id: string) {
    const { error } = await supabase
      .from('referral_letters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Marquer une orientation comme vue (par le médecin destinataire)
  async markAsViewed(id: string, userId: string) {
    const { error } = await supabase.rpc('mark_referral_as_viewed', {
      p_referral_id: id,
      p_user_id: userId,
    });

    if (error) throw error;
  },

  // Marquer tous les messages d'une orientation comme lus
  async markMessagesAsRead(referralId: string, userId: string) {
    const { error } = await supabase.rpc('mark_referral_messages_as_read', {
      p_referral_id: referralId,
      p_user_id: userId,
    });

    if (error) throw error;
  },

  // Envoyer un message dans le chat d'une orientation (digital)
  async sendReferralMessage(
    referralId: string,
    senderId: string,
    senderName: string,
    recipientId: string,
    content: string,
    files?: any[]
  ) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        referral_id: referralId,
        sender_id: senderId,
        sender_name: senderName,
        recipient_id: recipientId,
        content,
        files: files || null,
        context: 'referral',
        message_type: 'normal',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les messages d'une orientation
  async getReferralMessages(referralId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('referral_id', referralId)
      .eq('context', 'referral')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Ajouter une réponse du médecin destinataire
  async addResponse(referralId: string, responseContent: string) {
    const { data, error } = await supabase
      .from('referral_letters')
      .update({
        response_content: responseContent,
        responded_at: new Date().toISOString(),
        status: 'received',
      })
      .eq('id', referralId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les statistiques d'orientation d'un médecin
  async getStats(doctorId: string) {
    const { data, error } = await supabase.rpc('get_referral_stats', {
      p_doctor_id: doctorId,
    });

    if (error) throw error;
    return data?.[0] || {
      total_sent: 0,
      total_received: 0,
      pending_sent: 0,
      pending_received: 0,
      total_unread_messages: 0,
      specialties_sent: {},
      specialties_received: {},
    };
  },

  // Compter les messages non lus dans toutes les orientations
  async countUnreadMessages(doctorId: string) {
    const { data, error } = await supabase
      .from('referral_letters')
      .select('unread_messages')
      .eq('to_doctor_id', doctorId);

    if (error) throw error;
    
    const total = (data || []).reduce((sum, ref) => sum + (ref.unread_messages || 0), 0);
    return total;
  },

  // S'abonner aux nouveaux messages d'une orientation (temps réel)
  subscribeToReferralMessages(referralId: string, callback: (message: any) => void) {
    return supabase
      .channel(`referral_${referralId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `referral_id=eq.${referralId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },
};
