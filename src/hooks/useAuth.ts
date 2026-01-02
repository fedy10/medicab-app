import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/services/supabaseService';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    console.log('🔄 useAuth: Initialisation...');

    // Timeout de sécurité augmenté à 5 secondes
    const timeoutId = setTimeout(() => {
      if (mounted && authState.loading) {
        console.warn('⚠️ Timeout lors de la vérification de session (5s écoulées)');
        setAuthState({
          user: null,
          profile: null,
          loading: false,
        });
      }
    }, 5000);  // 5 secondes au lieu de 3

    // Récupérer la session actuelle
    authService.getCurrentSession()
      .then((session) => {
        if (!mounted) return;
        
        clearTimeout(timeoutId);
        
        console.log('✅ Session récupérée:', session ? 'Connecté' : 'Non connecté');
        
        if (session) {
          setAuthState({
            user: session.user,
            profile: session.profile,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
          });
        }
      })
      .catch((error) => {
        if (!mounted) return;
        
        clearTimeout(timeoutId);
        console.error('❌ Erreur lors de la récupération de session:', error);
        
        setAuthState({
          user: null,
          profile: null,
          loading: false,
        });
      });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setAuthState({
            user: session.user,
            profile: profile || null,
            loading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return await authService.login(email, password);
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role: 'doctor' | 'secretary';
    phone?: string;
    address?: string;
    specialty?: string;
    assignedDoctorId?: string;
  }) => {
    return await authService.register(data);
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setAuthState({
        user: null,
        profile: null,
        loading: false,
      });
    }
    return result;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) return { success: false, error: 'Non authentifié' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState({
        ...authState,
        profile: data,
      });

      return { success: true, profile: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    isAuthenticated: !!authState.user,
    login,
    register,
    logout,
    updateProfile,
  };
}