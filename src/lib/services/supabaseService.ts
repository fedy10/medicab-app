import { supabase } from '../supabase';
import type { Database } from '../database.types';

// ============================================
// TYPES
// ============================================

type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ReferralLetter = Database['public']['Tables']['referral_letters']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Revenue = Database['public']['Tables']['revenues']['Row'];

export interface ChronicDisease {
  id: string;
  name: string;
  emoji: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

// ============================================
// AUTHENTICATION SERVICE
// ============================================

export const authService = {
  // Connexion
  async login(email: string, password: string) {
    try {
      console.log('🔑 Connexion Supabase...', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou mot de passe incorrect' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Email not confirmed' };
        } else {
          return { success: false, error: error.message };
        }
      }

      if (!data.user) {
        console.error('❌ Pas d\'utilisateur dans la réponse');
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      // Vérifier si l'email est confirmé
      if (!data.user.email_confirmed_at) {
        console.warn('⚠️ Email non confirmé');
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: '⚠️ Veuillez vérifier votre email. Un lien de confirmation vous a été envoyé.' 
        };
      }

      console.log('🔍 Récupération du profil...');

      // Récupérer le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
        return { success: false, error: 'Profil introuvable' };
      }

      // Vérifier si le compte est suspendu
      if (profile.status === 'suspended') {
        console.warn('⚠️ Compte suspendu');
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: '⚠️ Votre compte a été suspendu. Contactez l\'administrateur.' 
        };
      }

      console.log('✅ Connexion réussie !');
      
      return {
        success: true,
        user: data.user,
        profile: profile,
      };
    } catch (error: any) {
      console.error('💥 Exception login:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  },

  // Inscription
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'doctor' | 'secretary';
    phone?: string;
    address?: string;
    specialty?: string;
    assignedDoctorId?: string;
  }) {
    try {
      console.log('📝 Inscription...', userData.email);

      // Créer l'utilisateur dans auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Utilisateur non créé' };
      }

      // Mettre à jour le profil avec les infos complètes
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          phone: userData.phone || null,
          address: userData.address || null,
          specialty: userData.specialty || null,
          assigned_doctor_id: userData.assignedDoctorId || null,
          status: userData.role === 'doctor' ? 'suspended' : 'active', // Médecins en attente de validation
        })
        .eq('id', data.user.id)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erreur mise à jour profil:', profileError);
        return { success: false, error: 'Erreur création profil' };
      }

      console.log('✅ Inscription réussie');

      return {
        success: true,
        user: data.user,
        profile: profile,
      };
    } catch (error: any) {
      console.error('💥 Exception inscription:', error);
      return { success: false, error: error.message || 'Erreur d\'inscription' };
    }
  },

  // Déconnexion
  async logout() {
    try {
      console.log('👋 Déconnexion...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion:', error);
        throw error;
      }
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('💥 Exception déconnexion:', error);
      throw error;
    }
  },

  // Récupérer la session actuelle
  async getCurrentSession() {
    try {
      console.log('🔍 getCurrentSession: Début...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('📦 getSession terminé:', session ? 'Session trouvée' : 'Pas de session', error || '');
      
      if (error) {
        console.error('❌ Erreur getSession:', error);
        return null;
      }
      
      if (!session) {
        console.log('✅ Pas de session active');
        return null;
      }

      console.log('👤 Récupération du profil pour:', session.user.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
        return null;
      }

      console.log('✅ Session et profil récupérés avec succès');
      
      return {
        user: session.user,
        profile: profile || null,
      };
    } catch (error) {
      console.error('💥 Exception dans getCurrentSession:', error);
      return null;
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      callback(session);
    });
  },
};

// ============================================
// PROFILE SERVICE
// ============================================

export const profileService = {
  // Récupérer tous les profils (admin)
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un profil par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer tous les médecins
  async getAllDoctors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer tous les médecins actifs
  async getActiveDoctors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les secrétaires d'un médecin
  async getSecretariesByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'secretary')
      .eq('assigned_doctor_id', doctorId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Mettre à jour un profil
  async update(id: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Changer le statut d'un médecin (admin)
  async updateStatus(id: string, status: 'active' | 'suspended') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un profil (admin)
  async delete(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// PATIENT SERVICE
// ============================================

export const patientService = {
  // Récupérer tous les patients d'un médecin
  async getByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un patient par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un patient
  async create(patient: Database['public']['Tables']['patients']['Insert']) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un patient
  async update(id: string, updates: Database['public']['Tables']['patients']['Update']) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un patient
  async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des patients
  async search(doctorId: string, query: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Statistiques patients
  async getStats(doctorId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId);

    if (error) throw error;

    const patients = data || [];
    const total = patients.length;
    const withDiseases = patients.filter((p) => {
      const diseases = p.diseases as any[];
      return diseases && diseases.length > 0;
    }).length;

    return { total, withDiseases };
  },
};

// ============================================
// APPOINTMENT SERVICE
// ============================================

export const appointmentService = {
  // Récupérer tous les rendez-vous d'un médecin
  async getByDoctor(doctorId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Récupérer les rendez-vous d'un patient
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un rendez-vous par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un rendez-vous
  async create(appointment: Database['public']['Tables']['appointments']['Insert']) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un rendez-vous
  async update(id: string, updates: Database['public']['Tables']['appointments']['Update']) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un rendez-vous
  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Marquer comme complété
  async markAsCompleted(id: string) {
    return this.update(id, { status: 'completed' });
  },

  // Annuler un rendez-vous
  async cancel(id: string) {
    return this.update(id, { status: 'cancelled' });
  },

  // Statistiques rendez-vous
  async getStats(doctorId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const appointments = data || [];
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === 'scheduled').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

    return { total, scheduled, completed, cancelled };
  },

  // Vérifier les conflits d'horaire
  async checkConflict(doctorId: string, date: string, time: string, duration: number, excludeId?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Vérifier les chevauchements d'horaire
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    return (data || []).some((apt) => {
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + apt.duration;

      return (
        (startMinutes >= aptStart && startMinutes < aptEnd) ||
        (endMinutes > aptStart && endMinutes <= aptEnd) ||
        (startMinutes <= aptStart && endMinutes >= aptEnd)
      );
    });
  },
};

// ============================================
// CONSULTATION SERVICE
// ============================================

export const consultationService = {
  // Récupérer toutes les consultations d'un médecin
  async getByDoctor(doctorId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('consultations')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Récupérer les consultations d'un patient
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une consultation par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une consultation
  async create(consultation: Database['public']['Tables']['consultations']['Insert']) {
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une consultation
  async update(id: string, updates: Database['public']['Tables']['consultations']['Update']) {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une consultation
  async delete(id: string) {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Statistiques consultations
  async getStats(doctorId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('consultations')
      .select('*')
      .eq('doctor_id', doctorId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const consultations = data || [];
    const total = consultations.length;

    return { total, consultations };
  },
};

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

  // Récupérer une orientation par ID
  async getById(id: string) {
    const { data, error } = await supabase
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
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Créer une notification
  async create(notification: Database['public']['Tables']['notifications']['Insert']) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer comme lue
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une notification
  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Compter les notifications non lues
  async countUnread(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },
};

// ============================================
// REVENUE SERVICE
// ============================================

export const revenueService = {
  // Récupérer tous les revenus
  async getAll(doctorId?: string) {
    let query = supabase
      .from('revenues')
      .select('*')
      .order('date', { ascending: false });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Récupérer un revenu par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('revenues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un revenu
  async create(revenue: Database['public']['Tables']['revenues']['Insert']) {
    const { data, error } = await supabase
      .from('revenues')
      .insert(revenue)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un revenu
  async update(id: string, updates: Database['public']['Tables']['revenues']['Update']) {
    const { data, error } = await supabase
      .from('revenues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un revenu
  async delete(id: string) {
    const { error } = await supabase
      .from('revenues')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Statistiques de revenus
  async getStats(doctorId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('revenues')
      .select('*')
      .eq('doctor_id', doctorId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const revenues = data || [];
    const total = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const count = revenues.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average, revenues };
  },

  // Revenus par période
  async getByPeriod(doctorId: string, period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return this.getStats(
      doctorId,
      startDate.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );
  },
};
