/**
 * Services Supabase - Point d'entrée central
 * 
 * Architecture modulaire par entité :
 * - authService : Authentification et gestion des utilisateurs
 * - profileService : Gestion des profils (médecins, secrétaires, admin)
 * - patientService : Gestion des patients
 * - appointmentService : Gestion des rendez-vous
 * - consultationService : Gestion des consultations
 * - chatService : Messagerie instantanée
 * - referralService : Lettres d'orientation entre médecins
 * - notificationService : Notifications système
 * - revenueService : Gestion des revenus et statistiques financières
 */

// Export de tous les services
export { authService } from './authService';
export { profileService } from './profileService';
export { patientService } from './patientService';
export { appointmentService } from './appointmentService';
export { consultationService } from './consultationService';
export { chatService } from './chatService';
export { referralService } from './referralService';
export { notificationService } from './notificationService';
export { revenueService } from './revenueService';

// Export des types communs
import type { Database } from '../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ReferralLetter = Database['public']['Tables']['referral_letters']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Revenue = Database['public']['Tables']['revenues']['Row'];

// Interfaces additionnelles
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

// Export du client Supabase pour cas spéciaux
export { supabase } from '../supabase';
