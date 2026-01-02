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
type MedicalFile = Database['public']['Tables']['medical_files']['Row'];

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Profil non trouvé' };
    }

    // Vérifier si le compte est suspendu
    if (profile.status === 'suspended') {
      await supabase.auth.signOut();
      return { success: false, error: 'Votre compte a été suspendu. Contactez l\'administrateur.' };
    }

    return { success: true, user: data.user, profile };
  },

  // Inscription
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: 'doctor' | 'secretary';
    phone?: string;
    address?: string;
    specialty?: string;
    assignedDoctorId?: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    // Mettre à jour le profil avec les informations supplémentaires
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: data.phone,
        address: data.address,
        specialty: data.specialty,
        status: data.role === 'doctor' ? 'suspended' : 'active',
        assigned_doctor_id: data.assignedDoctorId,
      })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du profil:', updateError);
    }

    // Récupérer le profil complet
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return { success: true, user: authData.user, profile };
  },

  // Déconnexion
  async logout() {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message };
  },

  // Récupérer la session actuelle
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      user: session.user,
      profile: profile || null,
    };
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};

// ============================================
// PROFILE SERVICE
// ============================================

export const profileService = {
  // Récupérer tous les profils
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

  // Récupérer un profil par email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les profils par rôle
  async getByRole(role: 'admin' | 'doctor' | 'secretary') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les secrétaires d'un médecin
  async getSecretariesByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'secretary')
      .eq('assigned_doctor_id', doctorId);

    if (error) throw error;
    return data || [];
  },

  // Mettre à jour un profil
  async update(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Suspendre/Activer un utilisateur
  async updateStatus(id: string, status: 'active' | 'suspended') {
    return this.update(id, { status });
  },

  // Supprimer un profil
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
  // Récupérer tous les patients (avec filtre optionnel par médecin)
  async getAll(doctorId?: string) {
    let query = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
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

  // Créer un nouveau patient
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
};

// ============================================
// APPOINTMENT SERVICE
// ============================================

export const appointmentService = {
  // Récupérer tous les rendez-vous
  async getAll(doctorId?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
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

  // Récupérer les rendez-vous par date
  async getByDate(date: string, doctorId?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};

// ============================================
// CONSULTATION SERVICE
// ============================================

export const consultationService = {
  // Récupérer toutes les consultations
  async getAll(doctorId?: string) {
    let query = supabase
      .from('consultations')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
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

  // Récupérer les consultations d'un patient
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// CHAT SERVICE
// ============================================

export const chatService = {
  // Récupérer les messages entre deux utilisateurs
  async getMessages(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
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

  // Modifier un message
  async updateMessage(id: string, content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        content,
        edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un message
  async deleteMessage(id: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Marquer les messages comme lus
  async markAsRead(senderId: string, recipientId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('recipient_id', recipientId)
      .eq('read', false);

    if (error) throw error;
  },

  // Compter les messages non lus
  async countUnreadMessages(userId: string) {
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
};

// ============================================
// FILE STORAGE SERVICE
// ============================================

export const fileService = {
  // Upload un fichier
  async upload(file: File, patientId: string, uploadedBy: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Créer l'entrée dans la base de données
    const { data: fileData, error: fileError } = await supabase
      .from('medical_files')
      .insert({
        patient_id: patientId,
        name: file.name,
        type: file.type,
        size: file.size,
        storage_path: fileName,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    // Générer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('medical-files')
      .getPublicUrl(fileName);

    return {
      ...fileData,
      url: publicUrl,
    };
  },

  // Récupérer les fichiers d'un patient
  async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('medical_files')
      .select('*')
      .eq('patient_id', patientId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    // Ajouter les URLs
    return (data || []).map((file) => {
      const { data: { publicUrl } } = supabase.storage
        .from('medical-files')
        .getPublicUrl(file.storage_path);

      return {
        ...file,
        url: publicUrl,
      };
    });
  },

  // Supprimer un fichier
  async delete(fileId: string) {
    // Récupérer le fichier
    const { data: file, error: fetchError } = await supabase
      .from('medical_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    // Supprimer du storage
    const { error: storageError } = await supabase.storage
      .from('medical-files')
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    // Supprimer de la base
    const { error: dbError } = await supabase
      .from('medical_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
  },

  // Télécharger un fichier
  async download(storagePath: string) {
    const { data, error } = await supabase.storage
      .from('medical-files')
      .download(storagePath);

    if (error) throw error;
    return data;
  },
};
