import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Consultation = Database['public']['Tables']['consultations']['Row'];

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

  // Récupérer consultation par appointment_id
  async getByAppointmentId(appointmentId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

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
