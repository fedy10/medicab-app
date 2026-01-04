import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

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

  // Récupérer un patient par numéro de téléphone
  async getByPhone(phone: string, doctorId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .eq('doctor_id', doctorId)
      .maybeSingle();

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
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
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
