-- ============================================
-- FIX : Récursion infinie dans les policies RLS
-- ============================================
-- Ce script corrige l'erreur "infinite recursion detected in policy for relation 'profiles'"
--
-- CAUSE : Les policies font des SELECT sur la table profiles pour vérifier les permissions,
--         ce qui déclenche à nouveau les policies → boucle infinie
--
-- SOLUTION : Utiliser auth.jwt() au lieu de SELECT FROM profiles
-- ============================================

-- 1. SUPPRIMER toutes les policies existantes sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view their secretaries" ON public.profiles;
DROP POLICY IF EXISTS "Secretaries can view their doctor" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. CRÉER des policies SANS récursion (utilisant auth.jwt() et auth.uid())

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Les admins peuvent tout voir (utilise JWT au lieu de SELECT)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Les admins peuvent tout modifier (utilise JWT)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ⚠️ POLICIES SIMPLIFIÉES pour médecins/secrétaires
-- On les autorise temporairement à voir tous les profils actifs
-- (à affiner plus tard si besoin de plus de restrictions)
CREATE POLICY "Doctors and secretaries can view active profiles"
ON public.profiles FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('doctor', 'secretary')
  AND status = 'active'
);
