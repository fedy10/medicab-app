# ⚡ Configuration Rapide Supabase

## 🚀 5 minutes pour démarrer

### 1️⃣ Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"New project"**
3. Remplissez :
   - **Name** : `medicab` (ou autre nom)
   - **Database Password** : Notez-le bien ! (ex: `MonMotDePasse123!`)
   - **Region** : Choisissez la plus proche (ex: `Europe West (London)`)
4. Cliquez **"Create new project"**
5. ⏳ Attendez 1-2 minutes (création de la base de données)

### 2️⃣ Récupérer les identifiants

Une fois le projet créé :

1. Dans le menu de gauche, cliquez **Settings** (⚙️ en bas)
2. Cliquez **API**
3. Vous verrez :

```
Project URL
https://abcdefghijklmnop.supabase.co
```

```
API Keys
anon/public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
```

4. ✅ **Copiez ces 2 valeurs** (vous en aurez besoin à l'étape suivante)

### 3️⃣ Configurer l'application

1. Ouvrez le fichier **`.env`** à la racine du projet
2. Remplacez les valeurs :

```bash
# AVANT :
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ici

# APRÈS :
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

3. ✅ **Enregistrez le fichier**

### 4️⃣ Exécuter le schema SQL

1. Retournez sur Supabase
2. Dans le menu de gauche, cliquez **SQL Editor**
3. Cliquez **"New query"**
4. Ouvrez le fichier **`supabase/schema.sql`** dans votre éditeur
5. **Copiez TOUT le contenu** (Ctrl+A puis Ctrl+C)
6. **Collez dans SQL Editor** de Supabase
7. Cliquez **"Run"** (ou Ctrl+Enter)
8. ✅ Vous devriez voir : `Success. No rows returned`

### 5️⃣ Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

✅ **L'écran d'erreur devrait disparaître !**

---

## 🎯 Créer votre premier utilisateur

### Option A : Via l'interface Supabase (Recommandé)

1. **Supabase** → **Authentication** → **Users**
2. Cliquez **"Add user"** → **"Create new user"**
3. Remplissez :
   - **Email** : `admin@medicab.tn`
   - **Password** : `admin123`
   - ✅ **Cochez "Auto Confirm User"**
4. Cliquez **"Create user"**
5. ✅ **Notez l'ID de l'utilisateur** (vous en aurez besoin)

6. **Maintenant, configurer le profil** :
   - **Table Editor** → **profiles**
   - Trouvez la ligne correspondante (même ID)
   - Cliquez pour éditer
   - Modifiez :
     - `role` → `admin`
     - `name` → `Administrateur`
     - `status` → `active`
   - Sauvegardez

### Option B : Via SQL (Plus rapide)

Dans **SQL Editor**, exécutez :

```sql
-- 1. Créer l'utilisateur dans auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@medicab.tn',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);

-- 2. Créer le profil
INSERT INTO public.profiles (id, email, name, role, status)
SELECT 
  id,
  'admin@medicab.tn',
  'Administrateur',
  'admin',
  'active'
FROM auth.users
WHERE email = 'admin@medicab.tn';
```

---

## ✅ Tester la connexion

1. Allez sur votre application : `http://localhost:5173`
2. Connectez-vous avec :
   - **Email** : `admin@medicab.tn`
   - **Password** : `admin123`
3. ✅ **Vous devriez accéder au dashboard admin !**

---

## 🐛 Problèmes courants

### ❌ "Invalid API key"

**Solution** :
- Vérifiez que vous avez bien copié la clé complète (elle est très longue)
- Vérifiez qu'il n'y a pas d'espaces avant/après dans le `.env`
- Redémarrez le serveur : `npm run dev`

### ❌ "Email not confirmed"

**Solution** :
- Quand vous créez un utilisateur, **cochez "Auto Confirm User"**
- Ou dans SQL Editor : `UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'admin@medicab.tn';`

### ❌ "Row Level Security policy violation"

**Solution** :
- Vérifiez que vous avez bien exécuté **TOUT** le fichier `schema.sql`
- Vérifiez que le `status` est bien `active` dans la table `profiles`

### ❌ L'écran de configuration s'affiche toujours

**Solution** :
- Vérifiez le fichier `.env` (pas `.env.example`)
- Vérifiez que les valeurs ne sont PAS les valeurs par défaut
- Redémarrez complètement le serveur

---

## 📚 Pour aller plus loin

- **PROCHAINES_ETAPES.md** - Instructions détaillées
- **SUPABASE_SETUP.md** - Configuration avancée
- **MIGRATION_GUIDE.md** - Migrer vos données

---

**🎉 Félicitations ! Vous êtes prêt à utiliser Medicab avec Supabase !**
