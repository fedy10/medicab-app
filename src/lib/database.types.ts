export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'doctor' | 'secretary'
          phone: string | null
          address: string | null
          specialty: string | null
          status: 'active' | 'suspended'
          assigned_doctor_id: string | null
          tarif: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'admin' | 'doctor' | 'secretary'
          phone?: string | null
          address?: string | null
          specialty?: string | null
          status?: 'active' | 'suspended'
          assigned_doctor_id?: string | null
          tarif?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'doctor' | 'secretary'
          phone?: string | null
          address?: string | null
          specialty?: string | null
          status?: 'active' | 'suspended'
          assigned_doctor_id?: string | null
          tarif?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          age: number | null
          phone: string | null
          email: string | null
          address: string | null
          diseases: Json | null
          doctor_id: string
          birth_date: string | null
          profession: string | null
          pays: string | null
          region: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age?: number | null
          phone?: string | null
          email?: string | null
          address?: string | null
          diseases?: Json | null
          doctor_id: string
          birth_date?: string | null
          profession?: string | null
          pays?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number | null
          phone?: string | null
          email?: string | null
          address?: string | null
          diseases?: Json | null
          doctor_id?: string
          birth_date?: string | null
          profession?: string | null
          pays?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          patient_name: string
          doctor_id: string
          date: string
          time: string
          duration: number
          type: 'consultation' | 'follow-up' | 'emergency'
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          patient_name: string
          doctor_id: string
          date: string
          time: string
          duration?: number
          type: 'consultation' | 'follow-up' | 'emergency'
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          patient_name?: string
          doctor_id?: string
          date?: string
          time?: string
          duration?: number
          type?: 'consultation' | 'follow-up' | 'emergency'
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          patient_id: string
          patient_name: string
          doctor_id: string
          date: string
          time: string
          symptoms: string | null
          diagnosis: string | null
          prescription: string | null
          notes: string | null
          files: Json | null
          appointment_id: string | null
          payment_type: 'normal' | 'gratuit' | 'assurance' | null
          payment_amount: number | null
          insurance_patient_amount: number | null
          insurance_reimbursed_amount: number | null
          created_at: string
          updated_at: string
          // Nouveaux champs pour analyses et imagerie
          analysis: string | null
          imaging: string | null
          modification_history: Json | null
        }
        Insert: {
          id?: string
          patient_id: string
          patient_name: string
          doctor_id: string
          date: string
          time: string
          symptoms?: string | null
          diagnosis?: string | null
          prescription?: string | null
          notes?: string | null
          files?: Json | null
          appointment_id?: string | null
          payment_type?: 'normal' | 'gratuit' | 'assurance' | null
          payment_amount?: number | null
          insurance_patient_amount?: number | null
          insurance_reimbursed_amount?: number | null
          created_at?: string
          updated_at?: string
          analysis?: string | null
          imaging?: string | null
          modification_history?: Json | null
        }
        Update: {
          id?: string
          patient_id?: string
          patient_name?: string
          doctor_id?: string
          date?: string
          time?: string
          symptoms?: string | null
          diagnosis?: string | null
          prescription?: string | null
          notes?: string | null
          files?: Json | null
          appointment_id?: string | null
          payment_type?: 'normal' | 'gratuit' | 'assurance' | null
          payment_amount?: number | null
          insurance_patient_amount?: number | null
          insurance_reimbursed_amount?: number | null
          created_at?: string
          updated_at?: string
          analysis?: string | null
          imaging?: string | null
          modification_history?: Json | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          sender_name: string
          recipient_id: string
          content: string
          timestamp: string
          read: boolean
          edited: boolean
          edited_at: string | null
          files: Json | null
          created_at: string
          // Nouveaux champs pour les orientations
          referral_id: string | null
          message_type: 'normal' | 'system' | 'file_upload'
          context: 'general' | 'referral'
        }
        Insert: {
          id?: string
          sender_id: string
          sender_name: string
          recipient_id: string
          content: string
          timestamp?: string
          read?: boolean
          edited?: boolean
          edited_at?: string | null
          files?: Json | null
          created_at?: string
          referral_id?: string | null
          message_type?: 'normal' | 'system' | 'file_upload'
          context?: 'general' | 'referral'
        }
        Update: {
          id?: string
          sender_id?: string
          sender_name?: string
          recipient_id?: string
          content?: string
          timestamp?: string
          read?: boolean
          edited?: boolean
          edited_at?: string | null
          files?: Json | null
          created_at?: string
          referral_id?: string | null
          message_type?: 'normal' | 'system' | 'file_upload'
          context?: 'general' | 'referral'
        }
      }
      referral_letters: {
        Row: {
          id: string
          patient_id: string
          patient_name: string
          from_doctor_id: string
          from_doctor_name: string
          to_doctor_id: string | null
          to_doctor_name: string | null
          specialty: string
          type: 'print' | 'digital'
          content: string
          status: 'pending' | 'sent' | 'received'
          files: Json | null
          chat_messages: Json | null
          created_at: string
          updated_at: string
          // Nouveaux champs pour contexte patient
          patient_phone: string | null
          patient_age: number | null
          patient_gender: 'male' | 'female' | null
          patient_address: string | null
          // Nouveaux champs pour orientation
          reason: string | null
          consultation_id: string | null
          unread_messages: number
          viewed_at: string | null
          response_content: string | null
          responded_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          patient_name: string
          from_doctor_id: string
          from_doctor_name: string
          to_doctor_id?: string | null
          to_doctor_name?: string | null
          specialty: string
          type: 'print' | 'digital'
          content: string
          status?: 'pending' | 'sent' | 'received'
          files?: Json | null
          chat_messages?: Json | null
          created_at?: string
          updated_at?: string
          patient_phone?: string | null
          patient_age?: number | null
          patient_gender?: 'male' | 'female' | null
          patient_address?: string | null
          reason?: string | null
          consultation_id?: string | null
          unread_messages?: number
          viewed_at?: string | null
          response_content?: string | null
          responded_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          patient_name?: string
          from_doctor_id?: string
          from_doctor_name?: string
          to_doctor_id?: string | null
          to_doctor_name?: string | null
          specialty?: string
          type?: 'print' | 'digital'
          content?: string
          status?: 'pending' | 'sent' | 'received'
          files?: Json | null
          chat_messages?: Json | null
          created_at?: string
          updated_at?: string
          patient_phone?: string | null
          patient_age?: number | null
          patient_gender?: 'male' | 'female' | null
          patient_address?: string | null
          reason?: string | null
          consultation_id?: string | null
          unread_messages?: number
          viewed_at?: string | null
          response_content?: string | null
          responded_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'appointment' | 'referral' | 'system'
          title: string
          message: string
          read: boolean
          link: string | null
          created_at: string
          // Nouveaux champs
          referral_id: string | null
          metadata: Json | null
          action_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'appointment' | 'referral' | 'system'
          title: string
          message: string
          read?: boolean
          link?: string | null
          created_at?: string
          referral_id?: string | null
          metadata?: Json | null
          action_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'appointment' | 'referral' | 'system'
          title?: string
          message?: string
          read?: boolean
          link?: string | null
          created_at?: string
          referral_id?: string | null
          metadata?: Json | null
          action_date?: string | null
        }
      }
      revenues: {
        Row: {
          id: string
          doctor_id: string
          amount: number
          date: string
          type: 'consultation' | 'procedure' | 'other'
          description: string
          patient_id: string | null
          patient_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          amount: number
          date: string
          type: 'consultation' | 'procedure' | 'other'
          description: string
          patient_id?: string | null
          patient_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          amount?: number
          date?: string
          type?: 'consultation' | 'procedure' | 'other'
          description?: string
          patient_id?: string | null
          patient_name?: string | null
          created_at?: string
        }
      }
      medical_files: {
        Row: {
          id: string
          patient_id: string
          name: string
          type: string
          size: number
          storage_path: string
          uploaded_by: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          type: string
          size: number
          storage_path: string
          uploaded_by: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          type?: string
          size?: number
          storage_path?: string
          uploaded_by?: string
          uploaded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'doctor' | 'secretary'
      user_status: 'active' | 'suspended'
      appointment_type: 'consultation' | 'follow-up' | 'emergency'
      appointment_status: 'scheduled' | 'completed' | 'cancelled'
      referral_type: 'print' | 'digital'
      referral_status: 'pending' | 'sent' | 'received'
      notification_type: 'message' | 'appointment' | 'referral' | 'system'
      revenue_type: 'consultation' | 'procedure' | 'other'
    }
  }
}