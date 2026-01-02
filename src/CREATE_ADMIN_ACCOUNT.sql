-- =============================================
-- CRÉER UN COMPTE ADMIN AVEC EMAIL CONFIRMÉ
-- =============================================
-- 
-- Ce script crée un compte administrateur directement dans Supabase
-- avec l'email déjà confirmé (pas besoin de cliquer sur un lien)
--
-- INSTRUCTIONS :
-- 1. Allez sur https://supabase.com → Votre projet
-- 2. Cliquez sur "SQL Editor" dans le menu gauche
-- 3. Cliquez sur "New query"
-- 4. Copiez-collez CE script
-- 5. CHANGEZ l'email et le mot de passe (lignes marquées 👈)
-- 6. Cliquez sur "Run" (ou F5)
-- 7. Si tout va bien, vous verrez "Success. No rows returned"
-- 8. Connectez-vous immédiatement avec vos identifiants
--
-- =============================================

DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'admin@medicab.tn';  -- 👈 CHANGEZ ICI votre email
  user_password text := 'Admin123!';      -- 👈 CHANGEZ ICI votre mot de passe (8+ caractères)
  user_name text := 'Administrateur Principal';
BEGIN
  -- ==========================================
  -- ÉTAPE 1 : Créer l'utilisateur dans auth.users
  -- ==========================================
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,  -- ✅ EMAIL DÉJÀ CONFIRMÉ !
    confirmation_token,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_sent_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),  -- ✅ Confirmé immédiatement
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name),
    FALSE,
    NOW()
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE '✅ Utilisateur créé : ID = %', new_user_id;

  -- ==========================================
  -- ÉTAPE 2 : Créer le profil dans profiles
  -- ==========================================
  INSERT INTO profiles (
    id,
    email,
    name,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    user_email,
    user_name,
    'admin',     -- Rôle administrateur
    'active',    -- ✅ Compte actif immédiatement
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Profil créé pour : %', user_email;
  RAISE NOTICE '🎉 COMPTE ADMIN CRÉÉ AVEC SUCCÈS !';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Identifiants de connexion :';
  RAISE NOTICE '   Email : %', user_email;
  RAISE NOTICE '   Mot de passe : %', user_password;
  RAISE NOTICE '';
  RAISE NOTICE '✨ Vous pouvez maintenant vous connecter immédiatement !';

EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE '⚠️ ERREUR : Un compte avec cet email existe déjà !';
    RAISE NOTICE 'Solutions :';
    RAISE NOTICE '1. Utilisez un email différent';
    RAISE NOTICE '2. Ou supprimez l''ancien compte d''abord :';
    RAISE NOTICE '   DELETE FROM auth.users WHERE email = ''%'';', user_email;
    RAISE EXCEPTION 'Email déjà utilisé';
    
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR INATTENDUE : %', SQLERRM;
    RAISE EXCEPTION 'Création de compte échouée';
END $$;

-- =============================================
-- VÉRIFICATION (optionnelle)
-- =============================================
-- Décommentez ces lignes si vous voulez vérifier que le compte a été créé :

-- SELECT 
--   id,
--   email,
--   email_confirmed_at,
--   created_at
-- FROM auth.users 
-- WHERE email = 'admin@medicab.tn';  -- 👈 Changez l'email si nécessaire

-- SELECT 
--   id,
--   email,
--   name,
--   role,
--   status,
--   created_at
-- FROM profiles 
-- WHERE email = 'admin@medicab.tn';  -- 👈 Changez l'email si nécessaire
