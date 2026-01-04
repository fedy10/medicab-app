import { supabase } from '../supabase';

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
      console.error('❌ Erreur inattendue:', error);
      return {
        success: false,
        error: 'Une erreur est survenue. Veuillez réessayer.',
      };
    }
  },

  // Inscription
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'doctor' | 'secretary';
    specialty?: string;
    phone?: string;
    address?: string;
    assignedDoctorId?: string;
  }) {
    try {
      console.log('📝 Inscription Supabase...', userData.email);

      // 1. Créer l'utilisateur
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role,
          },
        },
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Cet email est déjà utilisé' };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Erreur lors de la création du compte' };
      }

      // 2. Créer le profil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        specialty: userData.specialty || null,
        phone: userData.phone || null,
        address: userData.address || null,
        assigned_doctor_id: userData.assignedDoctorId || null,
        status: userData.role === 'doctor' ? 'pending' : 'active', // Médecins en attente de validation
      });

      if (profileError) {
        console.error('❌ Erreur création profil:', profileError);
        return { success: false, error: 'Erreur lors de la création du profil' };
      }

      console.log('✅ Inscription réussie !');

      return {
        success: true,
        message: '✅ Compte créé ! Veuillez vérifier votre email pour confirmer votre inscription.',
      };
    } catch (error: any) {
      console.error('❌ Erreur inattendue:', error);
      return {
        success: false,
        error: 'Une erreur est survenue. Veuillez réessayer.',
      };
    }
  },

  // Déconnexion
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer l'utilisateur connecté
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer la session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session };
    } catch (error: any) {
      console.error('❌ Erreur récupération session:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer la session avec le profil
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (!session || !session.user) {
        return null;
      }

      // Récupérer le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
        return null;
      }

      return {
        user: session.user,
        profile: profile,
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération session complète:', error);
      return null;
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { 
        success: true, 
        message: 'Un email de réinitialisation a été envoyé' 
      };
    } catch (error: any) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour le mot de passe
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { 
        success: true, 
        message: 'Mot de passe mis à jour avec succès' 
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour mot de passe:', error);
      return { success: false, error: error.message };
    }
  },
};