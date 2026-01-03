# Migration SQL - Ajout des nouvelles colonnes

## À exécuter dans Supabase SQL Editor

```sql
-- 1. Ajouter la colonne tarif dans la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tarif DECIMAL(10,2) DEFAULT NULL;

-- 2. Ajouter les colonnes dans la table patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profession VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pays VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT NULL;

-- 3. Ajouter les colonnes de paiement dans la table consultations
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) CHECK (payment_type IN ('normal', 'gratuit', 'assurance')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_patient_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_reimbursed_amount DECIMAL(10,2) DEFAULT NULL;

-- 4. Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_id ON consultations(appointment_id);

-- 5. Vérification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'patients', 'consultations')
ORDER BY table_name, ordinal_position;
```

## Notes importantes

- Exécutez ce script dans l'éditeur SQL de Supabase (SQL Editor)
- Le script utilise `IF NOT EXISTS` pour éviter les erreurs si les colonnes existent déjà
- Les contraintes CHECK garantissent l'intégrité des données pour payment_type
- Les index améliorent les performances de recherche par téléphone et nom
