-- =============================================
-- FIX RAPIDE - VÉRIFIER ET RÉPARER LA BASE DE DONNÉES
-- =============================================
--
-- Ce script :
-- 1. Vérifie si les tables existent
-- 2. Les crée si nécessaire
-- 3. Vérifie que votre compte admin existe
-- 4. Affiche un rapport complet
--
-- INSTRUCTIONS :
-- 1. Allez sur https://supabase.com → SQL Editor
-- 2. Copiez-collez CE script
-- 3. Cliquez sur "Run" (F5)
-- 4. Lisez les messages
--
-- =============================================

-- ÉTAPE 1 : Vérifier les tables
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'patients', 'appointments', 'consultations', 
                     'chat_messages', 'referral_letters', 'notifications', 
                     'revenues', 'medical_files');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 VÉRIFICATION DES TABLES';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables trouvées : % / 9', table_count;
  
  IF table_count = 9 THEN
    RAISE NOTICE '✅ Toutes les tables existent !';
  ELSIF table_count = 0 THEN
    RAISE NOTICE '❌ AUCUNE table n''existe !';
    RAISE NOTICE '👉 Vous devez exécuter supabase/schema.sql';
    RAISE NOTICE '   1. Ouvrez supabase/schema.sql';
    RAISE NOTICE '   2. Copiez TOUT le contenu';
    RAISE NOTICE '   3. Collez dans SQL Editor';
    RAISE NOTICE '   4. Cliquez sur Run';
  ELSE
    RAISE NOTICE '⚠️ Seulement % tables sur 9 !', table_count;
    RAISE NOTICE '👉 Exécutez supabase/schema.sql pour créer les tables manquantes';
  END IF;
END $$;

-- ÉTAPE 2 : Vérifier le compte admin
DO $$
DECLARE
  user_exists BOOLEAN;
  profile_exists BOOLEAN;
  email_confirmed BOOLEAN;
  user_email TEXT := 'zeinebboukettaya2@gmail.com';
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '👤 VÉRIFICATION DU COMPTE ADMIN';
  RAISE NOTICE '========================================';
  
  -- Vérifier auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE '✅ Utilisateur trouvé dans auth.users';
    
    -- Vérifier si l'email est confirmé
    SELECT email_confirmed_at IS NOT NULL INTO email_confirmed
    FROM auth.users WHERE email = user_email;
    
    IF email_confirmed THEN
      RAISE NOTICE '✅ Email confirmé';
    ELSE
      RAISE NOTICE '❌ Email NON confirmé';
      RAISE NOTICE '👉 Exécutez :';
      RAISE NOTICE '   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = ''%'';', user_email;
    END IF;
  ELSE
    RAISE NOTICE '❌ Utilisateur NON trouvé dans auth.users';
    RAISE NOTICE '👉 Utilisez CREATE_ADMIN_ACCOUNT.sql pour créer le compte';
  END IF;
  
  -- Vérifier profiles (seulement si la table existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email) INTO profile_exists;
    
    IF profile_exists THEN
      RAISE NOTICE '✅ Profil trouvé dans public.profiles';
      
      -- Afficher les infos du profil
      DECLARE
        prof RECORD;
      BEGIN
        SELECT * INTO prof FROM public.profiles WHERE email = user_email;
        RAISE NOTICE '   - Nom : %', prof.name;
        RAISE NOTICE '   - Rôle : %', prof.role;
        RAISE NOTICE '   - Statut : %', prof.status;
      END;
    ELSE
      RAISE NOTICE '❌ Profil NON trouvé dans public.profiles';
      
      IF user_exists THEN
        RAISE NOTICE '👉 Création du profil...';
        
        -- Créer le profil
        INSERT INTO public.profiles (id, email, name, role, status, created_at, updated_at)
        SELECT 
          id,
          email,
          COALESCE(raw_user_meta_data->>'name', 'Administrateur Principal'),
          'admin',
          'active',
          NOW(),
          NOW()
        FROM auth.users 
        WHERE email = user_email;
        
        RAISE NOTICE '✅ Profil créé avec succès !';
      END IF;
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Table profiles n''existe pas encore';
  END IF;
END $$;

-- ÉTAPE 3 : Vérifier les triggers
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚙️ VÉRIFICATION DES TRIGGERS';
  RAISE NOTICE '========================================';
  
  -- Vérifier le trigger de création automatique de profil
  SELECT EXISTS(
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE '✅ Trigger on_auth_user_created existe';
  ELSE
    RAISE NOTICE '❌ Trigger on_auth_user_created N''EXISTE PAS';
    RAISE NOTICE '👉 Exécutez supabase/schema.sql pour créer le trigger';
  END IF;
END $$;

-- ÉTAPE 4 : Résumé et recommandations
DO $$
DECLARE
  table_count INTEGER;
  user_exists BOOLEAN;
  profile_exists BOOLEAN;
  email_confirmed BOOLEAN;
  all_good BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RÉSUMÉ';
  RAISE NOTICE '========================================';
  
  -- Compter les tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'patients', 'appointments', 'consultations', 
                     'chat_messages', 'referral_letters', 'notifications', 
                     'revenues', 'medical_files');
  
  -- Vérifier l'utilisateur
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'zeinebboukettaya2@gmail.com') INTO user_exists;
  
  IF table_count < 9 THEN
    all_good := FALSE;
  END IF;
  
  IF NOT user_exists THEN
    all_good := FALSE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = 'zeinebboukettaya2@gmail.com') INTO profile_exists;
    IF NOT profile_exists THEN
      all_good := FALSE;
    END IF;
  ELSE
    all_good := FALSE;
  END IF;
  
  IF all_good THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOUT EST BON !';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Toutes les tables existent';
    RAISE NOTICE '✅ Le compte admin existe';
    RAISE NOTICE '✅ Le profil est créé';
    RAISE NOTICE '';
    RAISE NOTICE '👉 Vous pouvez maintenant vous connecter avec :';
    RAISE NOTICE '   Email : zeinebboukettaya2@gmail.com';
    RAISE NOTICE '   Mot de passe : 4F4nx2gMQubsLQh';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ ACTIONS REQUISES :';
    RAISE NOTICE '';
    
    IF table_count < 9 THEN
      RAISE NOTICE '1️⃣ EXÉCUTER LE SCHÉMA :';
      RAISE NOTICE '   - Ouvrez supabase/schema.sql';
      RAISE NOTICE '   - Copiez TOUT le contenu';
      RAISE NOTICE '   - Collez dans SQL Editor';
      RAISE NOTICE '   - Cliquez sur Run';
      RAISE NOTICE '';
    END IF;
    
    IF NOT user_exists THEN
      RAISE NOTICE '2️⃣ CRÉER LE COMPTE ADMIN :';
      RAISE NOTICE '   - Exécutez CREATE_ADMIN_ACCOUNT.sql';
      RAISE NOTICE '';
    END IF;
    
    RAISE NOTICE '3️⃣ RELANCER CE SCRIPT pour vérifier';
    RAISE NOTICE '';
  END IF;
END $$;

-- ÉTAPE 5 : Liste des tables existantes
SELECT 
  '📋 Tables existantes :' AS info,
  string_agg(table_name, ', ' ORDER BY table_name) AS tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
