import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

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
