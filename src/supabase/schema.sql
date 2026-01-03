-- ============================================
-- SCHEMA SUPABASE - MEDICAB (Version Optimisée)
-- Application de Gestion de Cabinet Médical
-- ============================================

-- ============================================
-- 1. STRUCTURE DES TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'secretary')),
    phone TEXT, address TEXT, specialty TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    assigned_doctor_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, age INTEGER, phone TEXT, email TEXT, address TEXT,
    diseases JSONB DEFAULT '[]'::jsonb,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL, time TIME NOT NULL, duration INTEGER NOT NULL DEFAULT 30,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'follow-up', 'emergency')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT, created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL, time TIME NOT NULL, symptoms TEXT, diagnosis TEXT, 
    prescription TEXT, notes TEXT, files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    from_doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_doctor_name TEXT NOT NULL,
    to_doctor_id UUID REFERENCES public.profiles(id),
    to_doctor_name TEXT, specialty TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('print', 'digital')),
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received')),
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL, timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE, edited BOOLEAN NOT NULL DEFAULT FALSE,
    files JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'appointment', 'referral', 'system')),
    title TEXT NOT NULL, message TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL, date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'procedure', 'other')),
    description TEXT NOT NULL, patient_id UUID REFERENCES public.patients(id),
    patient_name TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. FONCTIONS SÉCURISÉES (SEARCH_PATH & SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
SELECT role FROM public.profiles WHERE id = user_uuid; $$;

CREATE OR REPLACE FUNCTION public.check_is_admin(user_uuid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = 'admin'); $$;

CREATE OR REPLACE FUNCTION public.get_assigned_doctor_id(user_uuid UUID)
RETURNS UUID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
SELECT assigned_doctor_id FROM public.profiles WHERE id = user_uuid; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'), COALESCE(NEW.raw_user_meta_data->>'role', 'doctor'));
    RETURN NEW;
END; $$;

-- ============================================
-- 3. TRIGGERS & INDEX
-- ============================================

CREATE TRIGGER tr_upd_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_upd_patients BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_upd_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_upd_consultations BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_upd_referrals BEFORE UPDATE ON public.referral_letters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_doctor ON public.profiles(assigned_doctor_id);

CREATE INDEX IF NOT EXISTS idx_patients_doctor ON public.patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(date);

CREATE INDEX IF NOT EXISTS idx_chat_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON public.chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON public.chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_referrals_from_doctor ON public.referral_letters(from_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_to_doctor ON public.referral_letters(to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.referral_letters(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referral_letters(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_revenues_doctor ON public.revenues(doctor_id);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON public.revenues(date);
CREATE INDEX IF NOT EXISTS idx_revenues_patient ON public.revenues(patient_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) - ACTIVATION TOTALE
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES RLS (Sans récursion)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Profiles_Select" ON public.profiles;
CREATE POLICY "Profiles_Select" ON public.profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  public.check_is_admin(auth.uid()) OR 
  assigned_doctor_id = auth.uid() OR 
  id = public.get_assigned_doctor_id(auth.uid())
);

DROP POLICY IF EXISTS "Profiles_Update_Own" ON public.profiles;
CREATE POLICY "Profiles_Update_Own" ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles_Update_Admin" ON public.profiles;
CREATE POLICY "Profiles_Update_Admin" ON public.profiles FOR UPDATE 
USING (public.check_is_admin(auth.uid()));

-- Patients & Appointments (Médecin + Sa secrétaire)
DROP POLICY IF EXISTS "Med_Access_Patients" ON public.patients;
CREATE POLICY "Med_Access_Patients" ON public.patients FOR ALL 
USING (
  doctor_id = auth.uid() OR 
  doctor_id = public.get_assigned_doctor_id(auth.uid())
);

DROP POLICY IF EXISTS "Med_Access_Appts" ON public.appointments;
CREATE POLICY "Med_Access_Appts" ON public.appointments FOR ALL 
USING (
  doctor_id = auth.uid() OR 
  doctor_id = public.get_assigned_doctor_id(auth.uid())
);

-- Données Cliniques (Docteur uniquement pour les consultations)
DROP POLICY IF EXISTS "Doc_Only_Consults" ON public.consultations;
CREATE POLICY "Doc_Only_Consults" ON public.consultations FOR ALL 
USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doc_Only_Referrals" ON public.referral_letters;
CREATE POLICY "Doc_Only_Referrals" ON public.referral_letters FOR ALL 
USING (from_doctor_id = auth.uid() OR to_doctor_id = auth.uid());

-- Chat
DROP POLICY IF EXISTS "Chat_Select" ON public.chat_messages;
CREATE POLICY "Chat_Select" ON public.chat_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Chat_Insert" ON public.chat_messages;
CREATE POLICY "Chat_Insert" ON public.chat_messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND (
        (public.check_is_admin(auth.uid()) AND public.get_user_role(recipient_id) = 'doctor') OR
        (public.get_user_role(auth.uid()) = 'doctor' AND public.get_user_role(recipient_id) IN ('admin', 'doctor')) OR
        (public.get_user_role(auth.uid()) = 'doctor' AND public.get_assigned_doctor_id(recipient_id) = auth.uid()) OR
        (public.get_user_role(auth.uid()) = 'secretary' AND recipient_id = public.get_assigned_doctor_id(auth.uid()))
    )
);

DROP POLICY IF EXISTS "Chat_Update" ON public.chat_messages;
CREATE POLICY "Chat_Update" ON public.chat_messages FOR UPDATE 
USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Chat_Delete" ON public.chat_messages;
CREATE POLICY "Chat_Delete" ON public.chat_messages FOR DELETE 
USING (sender_id = auth.uid());

-- Notifications & Revenues
DROP POLICY IF EXISTS "Notif_Self" ON public.notifications;
CREATE POLICY "Notif_Self" ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Rev_Doc" ON public.revenues;
CREATE POLICY "Rev_Doc" ON public.revenues FOR ALL 
USING (doctor_id = auth.uid());

-- ============================================
-- 6. STORAGE (Optionnel - pour les fichiers médicaux)
-- ============================================

-- Créer le bucket pour les fichiers médicaux (à exécuter via l'interface si nécessaire)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false) ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DU SCHÉMA
-- ============================================
-- Après exécution de ce schéma :
-- 1. Vérifiez que toutes les tables sont créées
-- 2. Créez votre premier compte via l'application
-- 3. Modifiez manuellement le rôle en 'admin' dans Supabase
-- 4. Reconnectez-vous et profitez de l'application !
-- ============================================
