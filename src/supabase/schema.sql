-- ============================================
-- SCHEMA SUPABASE - MEDICAB
-- Application de Gestion de Cabinet Médical
-- ============================================

-- Activer Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-jwt-token-with-at-least-32-characters-long';

-- ============================================
-- 1. TABLE PROFILES (Utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'secretary')),
  phone TEXT,
  address TEXT,
  specialty TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  assigned_doctor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Index pour performances
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_assigned_doctor ON public.profiles(assigned_doctor_id);

-- ============================================
-- 2. TABLE PATIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  email TEXT,
  address TEXT,
  diseases JSONB DEFAULT '[]'::jsonb,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_patients_doctor ON public.patients(doctor_id);
CREATE INDEX idx_patients_name ON public.patients(name);

-- ============================================
-- 3. TABLE APPOINTMENTS (Rendez-vous)
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'follow-up', 'emergency')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- ============================================
-- 4. TABLE CONSULTATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_consultations_doctor ON public.consultations(doctor_id);
CREATE INDEX idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX idx_consultations_date ON public.consultations(date);

-- ============================================
-- 5. TABLE CHAT_MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_recipient ON public.chat_messages(recipient_id);
CREATE INDEX idx_chat_timestamp ON public.chat_messages(timestamp);
CREATE INDEX idx_chat_conversation ON public.chat_messages(sender_id, recipient_id);

-- ============================================
-- 6. TABLE REFERRAL_LETTERS (Orientations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.referral_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  from_doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_doctor_name TEXT NOT NULL,
  to_doctor_id UUID REFERENCES public.profiles(id),
  to_doctor_name TEXT,
  specialty TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('print', 'digital')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received')),
  files JSONB DEFAULT '[]'::jsonb,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_referral_letters_updated_at
BEFORE UPDATE ON public.referral_letters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_referrals_from_doctor ON public.referral_letters(from_doctor_id);
CREATE INDEX idx_referrals_to_doctor ON public.referral_letters(to_doctor_id);
CREATE INDEX idx_referrals_patient ON public.referral_letters(patient_id);
CREATE INDEX idx_referrals_status ON public.referral_letters(status);

-- ============================================
-- 7. TABLE NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'appointment', 'referral', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at);

-- ============================================
-- 8. TABLE REVENUES (Revenus)
-- ============================================
CREATE TABLE IF NOT EXISTS public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'procedure', 'other')),
  description TEXT NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  patient_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenues_doctor ON public.revenues(doctor_id);
CREATE INDEX idx_revenues_date ON public.revenues(date);
CREATE INDEX idx_revenues_patient ON public.revenues(patient_id);

-- ============================================
-- 9. TABLE MEDICAL_FILES (Fichiers médicaux)
-- ============================================
CREATE TABLE IF NOT EXISTS public.medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_files_patient ON public.medical_files(patient_id);
CREATE INDEX idx_medical_files_uploaded_by ON public.medical_files(uploaded_by);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES PROFILES
-- ============================================
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les médecins peuvent voir leurs secrétaires
CREATE POLICY "Doctors can view their secretaries"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'doctor'
  ) AND assigned_doctor_id = auth.uid()
);

-- Les secrétaires peuvent voir leur médecin
CREATE POLICY "Secretaries can view their doctor"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'secretary' AND assigned_doctor_id = profiles.id
  )
);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- POLICIES PATIENTS
-- ============================================
-- Les médecins peuvent voir leurs patients
CREATE POLICY "Doctors can view their patients"
ON public.patients FOR SELECT
USING (doctor_id = auth.uid());

-- Les secrétaires peuvent voir les patients de leur médecin
CREATE POLICY "Secretaries can view doctor's patients"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'secretary' 
      AND assigned_doctor_id = patients.doctor_id
  )
);

-- Les médecins peuvent gérer leurs patients
CREATE POLICY "Doctors can manage their patients"
ON public.patients FOR ALL
USING (doctor_id = auth.uid());

-- Les secrétaires peuvent ajouter/modifier les patients de leur médecin
CREATE POLICY "Secretaries can manage doctor's patients"
ON public.patients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'secretary' 
      AND assigned_doctor_id = patients.doctor_id
  )
);

-- ============================================
-- POLICIES APPOINTMENTS
-- ============================================
CREATE POLICY "Users can view related appointments"
ON public.appointments FOR SELECT
USING (
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'secretary' 
      AND assigned_doctor_id = appointments.doctor_id
  )
);

CREATE POLICY "Users can manage related appointments"
ON public.appointments FOR ALL
USING (
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'secretary' 
      AND assigned_doctor_id = appointments.doctor_id
  )
);

-- ============================================
-- POLICIES CONSULTATIONS
-- ============================================
CREATE POLICY "Doctors can view their consultations"
ON public.consultations FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can manage their consultations"
ON public.consultations FOR ALL
USING (doctor_id = auth.uid());

-- ============================================
-- POLICIES CHAT_MESSAGES
-- ============================================
CREATE POLICY "Users can view their messages"
ON public.chat_messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
USING (sender_id = auth.uid());

-- ============================================
-- POLICIES REFERRAL_LETTERS
-- ============================================
CREATE POLICY "Doctors can view related referrals"
ON public.referral_letters FOR SELECT
USING (from_doctor_id = auth.uid() OR to_doctor_id = auth.uid());

CREATE POLICY "Doctors can create referrals"
ON public.referral_letters FOR INSERT
WITH CHECK (from_doctor_id = auth.uid());

CREATE POLICY "Doctors can update their referrals"
ON public.referral_letters FOR UPDATE
USING (from_doctor_id = auth.uid() OR to_doctor_id = auth.uid());

-- ============================================
-- POLICIES NOTIFICATIONS
-- ============================================
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
ON public.notifications FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- POLICIES REVENUES
-- ============================================
CREATE POLICY "Doctors can view their revenues"
ON public.revenues FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can manage their revenues"
ON public.revenues FOR ALL
USING (doctor_id = auth.uid());

CREATE POLICY "Admins can view all revenues"
ON public.revenues FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- POLICIES MEDICAL_FILES
-- ============================================
CREATE POLICY "Users can view related files"
ON public.medical_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = medical_files.patient_id 
      AND (
        doctor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() 
            AND role = 'secretary' 
            AND assigned_doctor_id = patients.doctor_id
        )
      )
  )
);

CREATE POLICY "Users can manage related files"
ON public.medical_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = medical_files.patient_id 
      AND (
        doctor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() 
            AND role = 'secretary' 
            AND assigned_doctor_id = patients.doctor_id
        )
      )
  )
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Bucket pour les fichiers médicaux
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', false);

-- Policies pour le storage
CREATE POLICY "Users can view related medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files' AND
  EXISTS (
    SELECT 1 FROM public.medical_files mf
    JOIN public.patients p ON p.id = mf.patient_id
    WHERE mf.storage_path = storage.objects.name
      AND (
        p.doctor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles prof
          WHERE prof.id = auth.uid() 
            AND role = 'secretary' 
            AND assigned_doctor_id = p.doctor_id
        )
      )
  )
);

CREATE POLICY "Users can upload medical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files' AND
  auth.uid() IS NOT NULL
);

-- ============================================
-- FUNCTIONS UTILITAIRES
-- ============================================

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'doctor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================

-- Note: Les utilisateurs seront créés via Supabase Auth
-- Vous devrez les créer manuellement ou via l'interface Supabase
-- avec les emails suivants et ensuite mettre à jour leurs profils:
-- - admin@medicab.tn (admin)
-- - dr.ben.ali@medicab.tn (doctor)
-- - fatma.sec@medicab.tn (secretary)
