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