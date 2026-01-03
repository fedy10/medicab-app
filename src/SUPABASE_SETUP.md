# Configuration Supabase pour MediCab

## 📋 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous ou créez un compte
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: MediCab (ou le nom de votre choix)
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche
5. Cliquez sur "Create new project" et attendez quelques minutes

### 2. Exécuter le Schema SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (dans le menu de gauche)
2. Cliquez sur "New Query"
3. Copiez le contenu du fichier SQL que vous avez créé (avec toutes les tables, fonctions, triggers, etc.)
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" pour exécuter le script

### 3. Récupérer les Identifiants

1. Allez dans **Settings** > **API**
2. Copiez les deux informations suivantes :
   - **Project URL** (commence par `https://...supabase.co`)
   - **anon/public** key (une longue chaîne de caractères)

### 4. Configurer les Variables d'Environnement

1. À la racine du projet, créez un fichier `.env` (ou modifiez-le s'il existe)
2. Ajoutez ces deux lignes (remplacez par vos vraies valeurs) :

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique-tres-longue
```

### 5. Désactiver la Confirmation Email (Optionnel pour le développement)

Pour éviter d'avoir à confirmer les emails lors du développement :

1. Allez dans **Authentication** > **Email Templates**
2. Désactivez temporairement "Confirm email" si vous voulez tester rapidement

**⚠️ IMPORTANT**: Réactivez cette option en production !

### 6. Créer un Compte Admin

Deux options :

#### Option A : Via l'Interface Supabase
1. Allez dans **Authentication** > **Users**
2. Cliquez sur "Add user" > "Create new user"
3. Entrez :
   - Email: `admin@medicab.com`
   - Password: `Admin123!`
   - Auto Confirm User: ✅ (coché)
4. Cliquez sur "Create user"
5. Allez dans **Table Editor** > **profiles**
6. Trouvez l'utilisateur que vous venez de créer
7. Modifiez le champ `role` à `admin`
8. Modifiez le champ `status` à `active`

#### Option B : Via SQL
Exécutez ce SQL dans le **SQL Editor** :

```sql
-- Insérer un admin (remplacez l'email et le mot de passe si nécessaire)
-- Note: Le mot de passe doit être défini via l'interface auth ou via la fonction auth.signup()
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
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@medicab.com',
  crypt('Admin123!', gen_salt('bf')),  -- Mot de passe: Admin123!
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Administrateur","role":"admin"}',
  NOW(),
  NOW()
) RETURNING id;

-- Puis créer le profil avec le role admin
-- Remplacez 'l-uuid-retourne-ci-dessus' par l'UUID retourné
INSERT INTO public.profiles (id, email, name, role, status)
VALUES (
  'l-uuid-retourne-ci-dessus',
  'admin@medicab.com',
  'Administrateur',
  'admin',
  'active'
);
```

### 7. Redémarrer l'Application

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## 🧪 Tester la Configuration

1. Ouvrez l'application
2. Vous devriez voir la page de connexion (pas le message "Configuration Supabase Requise")
3. Connectez-vous avec :
   - Email: `admin@medicab.com`
   - Mot de passe: `Admin123!`

## 📊 Structure de la Base de Données

### Tables Principales

- **profiles** : Utilisateurs (admin, médecins, secrétaires)
- **patients** : Patients du cabinet
- **appointments** : Rendez-vous
- **consultations** : Consultations médicales
- **referral_letters** : Lettres d'orientation
- **chat_messages** : Messages entre utilisateurs
- **notifications** : Notifications système
- **revenues** : Revenus des médecins

### Fonctionnalités Automatiques

- ✅ **Triggers** : Mise à jour automatique de `updated_at`
- ✅ **RLS (Row Level Security)** : Sécurité au niveau des lignes
- ✅ **Fonctions SECURITY DEFINER** : Évite la récursion RLS
- ✅ **Index** : Optimisation des requêtes
- ✅ **Real-time** : Notifications en temps réel (chat)

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS pour garantir que :
- Les admins peuvent tout voir
- Les médecins voient leurs propres données
- Les secrétaires voient les données de leur médecin assigné
- Le chat est privé entre les utilisateurs autorisés

### Statuts des Comptes

- **Médecins** : Créés avec statut `suspended` - doivent être activés par l'admin
- **Secrétaires** : Créées avec statut `active` directement
- **Admin** : Toujours `active`

## 🐛 Dépannage

### Problème : "Configuration Supabase Requise" s'affiche toujours

**Solution** :
1. Vérifiez que le fichier `.env` est à la racine du projet
2. Vérifiez que les variables commencent par `VITE_`
3. Redémarrez complètement le serveur (`Ctrl+C` puis `npm run dev`)
4. Vérifiez dans la console navigateur qu'il n'y a pas d'erreurs

### Problème : "Email ou mot de passe incorrect"

**Solutions** :
1. Vérifiez que l'email est confirmé dans Supabase (Authentication > Users)
2. Vérifiez que le statut du profil est `active`
3. Vérifiez que le rôle est bien défini dans la table `profiles`

### Problème : "Profil non trouvé"

**Solution** :
1. Allez dans **Table Editor** > **profiles**
2. Vérifiez qu'il y a bien une ligne correspondant à votre utilisateur
3. Si non, le trigger `on_auth_user_created` n'a peut-être pas fonctionné
4. Créez manuellement le profil avec un INSERT SQL

### Problème : Erreurs de permissions

**Solution** :
1. Vérifiez que toutes les politiques RLS sont bien créées
2. Exécutez à nouveau tout le script SQL
3. Vérifiez dans **Authentication** > **Policies** que les politiques existent

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## ✅ Checklist de Vérification

- [ ] Projet Supabase créé
- [ ] Script SQL exécuté sans erreurs
- [ ] Variables d'environnement configurées dans `.env`
- [ ] Serveur redémarré
- [ ] Compte admin créé
- [ ] Connexion réussie avec le compte admin
- [ ] Page d'accueil s'affiche correctement

---

**🎉 Félicitations !** Votre application MediCab est maintenant connectée à Supabase !
