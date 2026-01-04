import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];

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
