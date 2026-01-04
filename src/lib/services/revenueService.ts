import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Revenue = Database['public']['Tables']['revenues']['Row'];

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
