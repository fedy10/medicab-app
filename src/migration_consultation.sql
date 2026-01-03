-- Migration SQL - Gestion complète des consultations et paiements
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes de paiement dans la table appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) CHECK (payment_type IN ('normal', 'gratuit', 'assurance')) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_patient_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_reimbursed_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- 2. Ajouter une référence au rendez-vous dans consultations si pas déjà fait
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- 3. Ajouter les colonnes de paiement dans consultations si pas déjà fait
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) CHECK (payment_type IN ('normal', 'gratuit', 'assurance')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_patient_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_reimbursed_amount DECIMAL(10,2) DEFAULT NULL;

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_appointments_payment_type ON appointments(payment_type);
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_id ON consultations(appointment_id);

-- 5. Vérification finale
SELECT 'Colonnes appointments:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('payment_type', 'payment_amount', 'insurance_patient_amount', 'insurance_reimbursed_amount', 'is_paid')
ORDER BY ordinal_position;

SELECT 'Colonnes consultations:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'consultations' 
  AND column_name IN ('appointment_id', 'payment_type', 'payment_amount', 'insurance_patient_amount', 'insurance_reimbursed_amount')
ORDER BY ordinal_position;
