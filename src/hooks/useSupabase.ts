import { useState, useEffect, useCallback } from 'react';
import {
  patientService,
  appointmentService,
  consultationService,
  profileService,
  revenueService,
  chatService,
  referralService,
  notificationService,
} from '../lib/services/supabaseService';

/**
 * Hook personnalisé pour charger et gérer les données Supabase
 * Gère automatiquement le loading et les erreurs
 */

// ============================================
// PATIENTS HOOK
// ============================================

export function usePatients(doctorId?: string) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getByDoctor(doctorId);
      setPatients(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement patients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const createPatient = async (patientData: any) => {
    try {
      const newPatient = await patientService.create(patientData);
      setPatients((prev) => [newPatient, ...prev]);
      return newPatient;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updatePatient = async (id: string, updates: any) => {
    try {
      const updated = await patientService.update(id, updates);
      setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await patientService.delete(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    patients,
    loading,
    error,
    refresh: loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
}

// ============================================
// APPOINTMENTS HOOK
// ============================================

export function useAppointments(doctorId?: string, filters?: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getByDoctor(doctorId, filters);
      setAppointments(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement rendez-vous:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const createAppointment = async (appointmentData: any) => {
    try {
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments((prev) => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateAppointment = async (id: string, updates: any) => {
    try {
      const updated = await appointmentService.update(id, updates);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentService.delete(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      const updated = await appointmentService.markAsCompleted(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const updated = await appointmentService.cancel(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    appointments,
    loading,
    error,
    refresh: loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    markAsCompleted,
    cancelAppointment,
  };
}

// ============================================
// CONSULTATIONS HOOK
// ============================================

export function useConsultations(doctorId?: string, filters?: any) {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConsultations = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await consultationService.getByDoctor(doctorId, filters);
      setConsultations(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement consultations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, filters]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const createConsultation = async (consultationData: any) => {
    try {
      const newConsultation = await consultationService.create(consultationData);
      setConsultations((prev) => [newConsultation, ...prev]);
      return newConsultation;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateConsultation = async (id: string, updates: any) => {
    try {
      const updated = await consultationService.update(id, updates);
      setConsultations((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteConsultation = async (id: string) => {
    try {
      await consultationService.delete(id);
      setConsultations((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    consultations,
    loading,
    error,
    refresh: loadConsultations,
    createConsultation,
    updateConsultation,
    deleteConsultation,
  };
}

// ============================================
// REVENUES HOOK
// ============================================

export function useRevenues(doctorId?: string) {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenues = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [revenuesData, statsData] = await Promise.all([
        revenueService.getAll(doctorId),
        revenueService.getStats(doctorId),
      ]);
      setRevenues(revenuesData);
      setStats(statsData);
    } catch (err: any) {
      console.error('❌ Erreur chargement revenus:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadRevenues();
  }, [loadRevenues]);

  const createRevenue = async (revenueData: any) => {
    try {
      const newRevenue = await revenueService.create(revenueData);
      setRevenues((prev) => [newRevenue, ...prev]);
      await loadRevenues(); // Recharger les stats
      return newRevenue;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateRevenue = async (id: string, updates: any) => {
    try {
      const updated = await revenueService.update(id, updates);
      setRevenues((prev) => prev.map((r) => (r.id === id ? updated : r)));
      await loadRevenues(); // Recharger les stats
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteRevenue = async (id: string) => {
    try {
      await revenueService.delete(id);
      setRevenues((prev) => prev.filter((r) => r.id !== id));
      await loadRevenues(); // Recharger les stats
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    revenues,
    stats,
    loading,
    error,
    refresh: loadRevenues,
    createRevenue,
    updateRevenue,
    deleteRevenue,
  };
}

// ============================================
// PROFILES HOOK (Admin)
// ============================================

export function useProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allProfiles, allDoctors] = await Promise.all([
        profileService.getAll(),
        profileService.getAllDoctors(),
      ]);
      setProfiles(allProfiles);
      setDoctors(allDoctors);
    } catch (err: any) {
      console.error('❌ Erreur chargement profils:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const updateProfile = async (id: string, updates: any) => {
    try {
      const updated = await profileService.update(id, updates);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateStatus = async (id: string, status: 'active' | 'suspended') => {
    try {
      const updated = await profileService.updateStatus(id, status);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await profileService.delete(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    profiles,
    doctors,
    loading,
    error,
    refresh: loadProfiles,
    updateProfile,
    updateStatus,
    deleteProfile,
  };
}

// ============================================
// CHAT HOOK
// ============================================

export function useChat(userId?: string, otherUserId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!userId || !otherUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getMessages(userId, otherUserId);
      setMessages(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, otherUserId]);

  useEffect(() => {
    loadMessages();

    // S'abonner aux nouveaux messages en temps réel
    if (!userId) return;

    const subscription = chatService.subscribeToMessages(userId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadMessages, userId]);

  const sendMessage = async (content: string, files?: any[]) => {
    if (!userId || !otherUserId) return;

    try {
      const message = await chatService.sendMessage({
        sender_id: userId,
        sender_name: '', // À compléter avec le nom de l'utilisateur
        recipient_id: otherUserId,
        content,
        files: files || [],
      });
      setMessages((prev) => [...prev, message]);
      return message;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      const updated = await chatService.editMessage(messageId, content);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    messages,
    loading,
    error,
    refresh: loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}

// ============================================
// NOTIFICATIONS HOOK
// ============================================

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [notifs, count] = await Promise.all([
        notificationService.getByUser(userId),
        notificationService.countUnread(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('❌ Erreur chargement notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.delete(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      await loadNotifications(); // Recharger le compteur
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: loadNotifications,
    markAsRead,
    deleteNotification,
  };
}
