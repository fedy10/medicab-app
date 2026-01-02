# 🚀 Configuration Supabase - MediCab

Ce guide vous accompagne dans la configuration complète de Supabase pour votre application de gestion de cabinet médical.

## 📋 Prérequis

- Un compte Supabase (gratuit) : https://supabase.com
- Node.js et npm installés
- Votre application MediCab locale

## 🔧 Étape 1 : Créer un Projet Supabase

1. **Créer un compte** sur https://supabase.com
2. **Créer un nouveau projet** :
   - Nom du projet : `medicab` (ou votre choix)
   - Mot de passe de la base de données : *Choisissez un mot de passe fort*
   - Région : Choisissez la plus proche (ex: `eu-central-1` pour l'Europe)
3. **Attendre** que le projet soit provisionné (2-3 minutes)

## 🗄️ Étape 2 : Créer le Schéma de la Base de Données

1. **Ouvrir le SQL Editor** dans Supabase :
   - Menu latéral → SQL Editor
   
2. **Copier le contenu** du fichier `/supabase/schema.sql`

3. **Exécuter le script SQL** :
   - Coller le contenu dans l'éditeur
   - Cliquer sur "Run" (ou Ctrl/Cmd + Enter)
   - Vérifier qu'il n'y a pas d'erreurs

4. **Vérifier les tables créées** :
   - Menu latéral → Table Editor
   - Vous devriez voir : `profiles`, `patients`, `appointments`, `consultations`, `chat_messages`, `referral_letters`, `notifications`, `revenues`, `medical_files`

## 🔐 Étape 3 : Configurer l'Authentication

1. **Activer Email/Password Auth** :
   - Menu latéral → Authentication → Providers
   - Activer "Email" si ce n'est pas déjà fait

2. **Désactiver la confirmation d'email** (pour le développement) :
   - Authentication → Settings
   - Désactiver "Enable email confirmations"
   - **⚠️ En production, réactivez cette option !**

## 🗝️ Étape 4 : Récupérer les Clés API

1. **Aller dans les Settings** :
   - Menu latéral → Settings → API

2. **Copier les informations suivantes** :
   - **Project URL** : `https://votre-projet.supabase.co`
   - **anon public** key : Une longue chaîne de caractères

3. **Créer le fichier `.env`** à la racine du projet :
   ```bash
   cp .env.example .env
   ```

4. **Remplir le fichier `.env`** :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique-ici
   ```

## 👥 Étape 5 : Créer les Utilisateurs de Démonstration

### Via l'Interface Supabase

1. **Aller dans Authentication** :
   - Menu latéral → Authentication → Users
   
2. **Créer les 3 utilisateurs** :

#### 🔑 Administrateur
- **Add user** → Create new user
- Email : `admin@medicab.tn`
- Password : `admin123`
- Auto Confirm User : ✅ (coché)
- Cliquer sur "Create user"
- **Copier l'User UID** généré

Ensuite, aller dans **Table Editor** → **profiles** et mettre à jour la ligne correspondante :
```sql
-- Trouver la ligne avec l'id de l'admin et modifier :
role = 'admin'
name = 'Administrateur'
status = 'active'
```

#### 👨‍⚕️ Médecin
- Email : `dr.ben.ali@medicab.tn`
- Password : `doctor123`
- Auto Confirm User : ✅
- **Copier l'User UID**

Mettre à jour dans **profiles** :
```sql
role = 'doctor'
name = 'Dr. Ahmed Ben Ali'
specialty = 'Médecine générale'
status = 'active'
phone = '+216 98 765 432'
address = 'Cabinet Médical, Avenue Habib Bourguiba, Tunis'
```

#### 👩‍💼 Secrétaire
- Email : `fatma.sec@medicab.tn`
- Password : `secretary123`
- Auto Confirm User : ✅

Mettre à jour dans **profiles** :
```sql
role = 'secretary'
name = 'Fatma Trabelsi'
status = 'active'
phone = '+216 22 345 678'
address = 'Tunis, Tunisie'
assigned_doctor_id = 'UID-du-médecin-créé-ci-dessus'
```

### Ou via SQL (Plus rapide)

Exécutez ce script dans le **SQL Editor** (remplacez les IDs par vos vrais UUIDs d'utilisateurs) :

```sql
-- Après avoir créé les utilisateurs dans Auth, mettre à jour leurs profils :
UPDATE public.profiles 
SET 
  name = 'Administrateur',
  role = 'admin',
  status = 'active',
  phone = '+216 71 123 456',
  address = 'Tunis, Tunisie'
WHERE email = 'admin@medicab.tn';

UPDATE public.profiles 
SET 
  name = 'Dr. Ahmed Ben Ali',
  role = 'doctor',
  specialty = 'Médecine générale',
  status = 'active',
  phone = '+216 98 765 432',
  address = 'Cabinet Médical, Avenue Habib Bourguiba, Tunis'
WHERE email = 'dr.ben.ali@medicab.tn';

UPDATE public.profiles 
SET 
  name = 'Fatma Trabelsi',
  role = 'secretary',
  status = 'active',
  phone = '+216 22 345 678',
  address = 'Tunis, Tunisie',
  assigned_doctor_id = (SELECT id FROM public.profiles WHERE email = 'dr.ben.ali@medicab.tn')
WHERE email = 'fatma.sec@medicab.tn';
```

## 📦 Étape 6 : Configurer le Storage

1. **Aller dans Storage** :
   - Menu latéral → Storage

2. **Vérifier le bucket `medical-files`** :
   - Il devrait déjà être créé par le script SQL
   - Si ce n'est pas le cas, créez-le manuellement :
     - Nom : `medical-files`
     - Public : Non (décoché)

3. **Vérifier les policies** :
   - Cliquer sur le bucket → Policies
   - Vous devriez voir les policies créées par le script SQL

## 🔄 Étape 7 : Installer les Dépendances

```bash
npm install @supabase/supabase-js
```

## 🧪 Étape 8 : Tester la Connexion

1. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Tester la connexion** :
   - Ouvrir l'application
   - Essayer de se connecter avec : `admin@medicab.tn` / `admin123`
   - Vérifier dans la console qu'il n'y a pas d'erreurs

## 📊 Étape 9 : Vérifier les Permissions (RLS)

Row Level Security (RLS) est activé pour protéger vos données. Vérifiez que :

1. **Les policies sont actives** :
   - Table Editor → Sélectionner une table → RLS est activé (cadenas vert)

2. **Tester les permissions** :
   - Connectez-vous avec différents comptes
   - Vérifiez que chaque rôle voit uniquement ses données

## 🎯 Étape 10 : Données de Test (Optionnel)

Pour ajouter des données de test :

1. **Patients** :
```sql
-- Insérer via Table Editor ou SQL
INSERT INTO public.patients (name, age, phone, email, address, doctor_id)
VALUES 
  ('Mohamed Ali', 45, '+216 98 123 456', 'mohamed@email.tn', 'Tunis', 'ID-DU-MEDECIN'),
  ('Fatma Gharbi', 32, '+216 22 654 321', 'fatma@email.tn', 'Sfax', 'ID-DU-MEDECIN');
```

2. **Rendez-vous** :
```sql
INSERT INTO public.appointments (patient_name, patient_id, doctor_id, date, time, type, status, created_by)
VALUES 
  ('Mohamed Ali', 'ID-PATIENT', 'ID-MEDECIN', '2025-01-15', '10:00', 'consultation', 'scheduled', 'ID-MEDECIN');
```

## 🔧 Debugging

### Erreur : "Invalid API key"
- Vérifiez que `.env` contient les bonnes clés
- Redémarrez le serveur (`npm run dev`)

### Erreur : "Row Level Security policy violation"
- Vérifiez que les policies RLS sont bien créées
- Vérifiez que l'utilisateur a le bon rôle dans `profiles`

### Erreur : "relation does not exist"
- Vérifiez que le script SQL a bien été exécuté
- Vérifiez dans Table Editor que les tables existent

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Real-time avec Supabase](https://supabase.com/docs/guides/realtime)

## ✅ Checklist Finale

- [ ] Projet Supabase créé
- [ ] Schéma SQL exécuté sans erreur
- [ ] Tables visibles dans Table Editor
- [ ] Fichier `.env` configuré
- [ ] 3 utilisateurs créés et configurés
- [ ] Bucket `medical-files` créé
- [ ] Connexion testée avec succès
- [ ] RLS activé sur toutes les tables

## 🎉 Prêt !

Votre application MediCab est maintenant connectée à Supabase ! Toutes vos données seront sauvegardées dans le cloud et synchronisées en temps réel.

Pour passer de localStorage à Supabase dans votre code, remplacez :
```typescript
// Ancien (localStorage)
import { dataStore } from './utils/dataStore';
dataStore.getPatients();

// Nouveau (Supabase)
import { patientService } from './lib/services/supabaseService';
await patientService.getAll();
```
