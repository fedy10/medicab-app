-- ============================================
-- QUICK SETUP - Comptes de Test pour MediCab
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor
-- pour créer rapidement des comptes de test
-- ============================================

-- IMPORTANT: Ce script utilise bcrypt pour hasher les mots de passe
-- Assurez-vous que l'extension pgcrypto est activée

-- Activer pgcrypto si nécessaire
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. ADMIN
-- ============================================

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Créer l'utilisateur admin dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@medicab.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Administrateur","role":"admin"}',
    NOW(),
    NOW(),
    '',
    ''
  ) RETURNING id INTO admin_id;

  -- Créer le profil admin
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    phone,
    address
  ) VALUES (
    admin_id,
    'admin@medicab.com',
    'Administrateur',
    'admin',
    'active',
    '+216 70 123 456',
    'Tunis, Tunisie'
  );

  RAISE NOTICE '✅ Admin créé: admin@medicab.com / Admin123!';
END $$;

-- ============================================
-- 2. MÉDECIN 1 - Cardiologue
-- ============================================

DO $$
DECLARE
  doctor1_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'dr.benali@medicab.com',
    crypt('Doctor123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Ahmed Ben Ali","role":"doctor"}',
    NOW(),
    NOW(),
    '',
    ''
  ) RETURNING id INTO doctor1_id;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    phone,
    address,
    specialty
  ) VALUES (
    doctor1_id,
    'dr.benali@medicab.com',
    'Dr. Ahmed Ben Ali',
    'doctor',
    'active',
    '+216 98 123 456',
    'Avenue Habib Bourguiba, Tunis',
    'Cardiologue'
  );

  RAISE NOTICE '✅ Médecin 1 créé: dr.benali@medicab.com / Doctor123!';
END $$;

-- ============================================
-- 3. MÉDECIN 2 - Pédiatre (En attente)
-- ============================================

DO $$
DECLARE
  doctor2_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'dr.gharbi@medicab.com',
    crypt('Doctor123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Leila Gharbi","role":"doctor"}',
    NOW(),
    NOW(),
    '',
    ''
  ) RETURNING id INTO doctor2_id;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    phone,
    address,
    specialty
  ) VALUES (
    doctor2_id,
    'dr.gharbi@medicab.com',
    'Dr. Leila Gharbi',
    'doctor',
    'suspended',  -- En attente de validation
    '+216 98 765 432',
    'Avenue de la Liberté, Sfax',
    'Pédiatre'
  );

  RAISE NOTICE '✅ Médecin 2 créé (suspendu): dr.gharbi@medicab.com / Doctor123!';
END $$;

-- ============================================
-- 4. SECRÉTAIRE
-- ============================================

DO $$
DECLARE
  secretary_id UUID;
  doctor1_id UUID;
BEGIN
  -- Récupérer l'ID du Dr. Ben Ali
  SELECT id INTO doctor1_id FROM public.profiles WHERE email = 'dr.benali@medicab.com';

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'fatma.sec@medicab.com',
    crypt('Secretary123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Fatma Trabelsi","role":"secretary"}',
    NOW(),
    NOW(),
    '',
    ''
  ) RETURNING id INTO secretary_id;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    phone,
    address,
    assigned_doctor_id
  ) VALUES (
    secretary_id,
    'fatma.sec@medicab.com',
    'Fatma Trabelsi',
    'secretary',
    'active',
    '+216 22 987 654',
    'Tunis, Tunisie',
    doctor1_id
  );

  RAISE NOTICE '✅ Secrétaire créée: fatma.sec@medicab.com / Secretary123!';
END $$;

-- ============================================
-- 5. PATIENTS DE TEST
-- ============================================

DO $$
DECLARE
  doctor1_id UUID;
  patient1_id UUID;
  patient2_id UUID;
  patient3_id UUID;
BEGIN
  -- Récupérer l'ID du Dr. Ben Ali
  SELECT id INTO doctor1_id FROM public.profiles WHERE email = 'dr.benali@medicab.com';

  -- Patient 1
  INSERT INTO public.patients (
    name, age, phone, email, address,
    diseases,
    doctor_id
  ) VALUES (
    'Mohamed Salah',
    45,
    '+216 99 111 222',
    'mohamed.salah@email.com',
    'Rue de la République, Tunis',
    '[{"id":"1","name":"Diabète Type 2","emoji":"🩺","diagnosedDate":"2023-01-15"}]'::jsonb,
    doctor1_id
  ) RETURNING id INTO patient1_id;

  -- Patient 2
  INSERT INTO public.patients (
    name, age, phone, email, address,
    diseases,
    doctor_id
  ) VALUES (
    'Amina Ben Salah',
    32,
    '+216 99 333 444',
    'amina.bensalah@email.com',
    'Avenue Bourguiba, Sfax',
    '[{"id":"2","name":"Hypertension","emoji":"💊","diagnosedDate":"2023-03-20"}]'::jsonb,
    doctor1_id
  ) RETURNING id INTO patient2_id;

  -- Patient 3
  INSERT INTO public.patients (
    name, age, phone, email, address,
    diseases,
    doctor_id
  ) VALUES (
    'Karim Mansour',
    58,
    '+216 99 555 666',
    'karim.mansour@email.com',
    'Boulevard 7 Novembre, Sousse',
    '[]'::jsonb,
    doctor1_id
  ) RETURNING id INTO patient3_id;

  RAISE NOTICE '✅ 3 patients créés pour Dr. Ben Ali';

  -- ============================================
  -- 6. RENDEZ-VOUS DE TEST
  -- ============================================

  -- Rendez-vous 1 - Aujourd'hui
  INSERT INTO public.appointments (
    patient_id, patient_name, doctor_id,
    date, time, duration, type, status, notes, created_by
  ) VALUES (
    patient1_id,
    'Mohamed Salah',
    doctor1_id,
    CURRENT_DATE,
    '10:00:00',
    30,
    'consultation',
    'scheduled',
    'Contrôle diabète',
    doctor1_id
  );

  -- Rendez-vous 2 - Demain
  INSERT INTO public.appointments (
    patient_id, patient_name, doctor_id,
    date, time, duration, type, status, notes, created_by
  ) VALUES (
    patient2_id,
    'Amina Ben Salah',
    doctor1_id,
    CURRENT_DATE + 1,
    '14:30:00',
    30,
    'follow-up',
    'scheduled',
    'Suivi hypertension',
    doctor1_id
  );

  RAISE NOTICE '✅ 2 rendez-vous créés';

  -- ============================================
  -- 7. CONSULTATION DE TEST
  -- ============================================

  INSERT INTO public.consultations (
    patient_id, patient_name, doctor_id,
    date, time,
    symptoms, diagnosis, prescription, notes
  ) VALUES (
    patient1_id,
    'Mohamed Salah',
    doctor1_id,
    CURRENT_DATE - 7,
    '10:00:00',
    'Fatigue, soif excessive',
    'Diabète Type 2 - Contrôle glycémique nécessaire',
    'Metformine 500mg - 2x/jour\nContrôle glycémie à jeun quotidien',
    'Revoir dans 1 mois pour contrôle'
  );

  RAISE NOTICE '✅ 1 consultation créée';

  -- ============================================
  -- 8. REVENUS DE TEST
  -- ============================================

  INSERT INTO public.revenues (
    doctor_id, amount, date, type, description,
    patient_id, patient_name
  ) VALUES (
    doctor1_id,
    60.00,
    CURRENT_DATE - 7,
    'consultation',
    'Consultation diabète',
    patient1_id,
    'Mohamed Salah'
  );

  INSERT INTO public.revenues (
    doctor_id, amount, date, type, description,
    patient_id, patient_name
  ) VALUES (
    doctor1_id,
    80.00,
    CURRENT_DATE - 5,
    'procedure',
    'ECG de contrôle',
    patient2_id,
    'Amina Ben Salah'
  );

  RAISE NOTICE '✅ 2 revenus créés';

END $$;

-- ============================================
-- RÉSUMÉ
-- ============================================

SELECT 
  '✅ SETUP TERMINÉ' as status,
  '' as separator,
  '📊 COMPTES CRÉÉS:' as accounts,
  '' as sep1,
  '👤 Admin: admin@medicab.com / Admin123!' as admin,
  '🩺 Dr. Ben Ali (actif): dr.benali@medicab.com / Doctor123!' as doctor1,
  '🩺 Dr. Gharbi (suspendu): dr.gharbi@medicab.com / Doctor123!' as doctor2,
  '💼 Secrétaire: fatma.sec@medicab.com / Secretary123!' as secretary,
  '' as sep2,
  '📊 DONNÉES DE TEST:' as data,
  '' as sep3,
  '👥 3 patients' as patients,
  '📅 2 rendez-vous' as appointments,
  '🩺 1 consultation' as consultations,
  '💰 2 revenus' as revenues;
