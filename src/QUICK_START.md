# 🚀 Quick Start - MEDICAB avec Supabase

## ⚡ Démarrage Rapide (5 minutes)

### 1️⃣ Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte / Se connecter
3. Cliquer sur **"New Project"**
4. Remplir :
   - **Name**: `medicab`
   - **Database Password**: Choisir un mot de passe fort (à sauvegarder !)
   - **Region**: Choisir Europe West (ou la plus proche)
5. Cliquer sur **"Create new project"**
6. ⏳ Attendre 2-3 minutes que le projet soit prêt

---

### 2️⃣ Exécuter le Schema SQL

1. Dans Supabase, aller dans **"SQL Editor"** (menu de gauche)
2. Cliquer sur **"New query"**
3. Copier **TOUT** le contenu de votre schema SQL
4. Coller dans l'éditeur
5. Cliquer sur **"Run"** (ou `Ctrl+Enter`)
6. ✅ Vérifier qu'il n'y a pas d'erreur

---

### 3️⃣ Configurer l'Application

#### Récupérer les identifiants Supabase

1. Dans Supabase, aller dans **"Settings"** → **"API"**
2. Copier le **"Project URL"** (ex: `https://xxx.supabase.co`)
3. Copier la clé **"anon public"** (commence par `eyJhbGc...`)

#### Créer le fichier .env

1. À la racine du projet, copier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Ouvrir `.env` et remplacer :
   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 4️⃣ Créer le Premier Admin

#### Option A: Via l'interface Supabase (Recommandé)

1. Dans Supabase, aller dans **"Authentication"** → **"Users"**
2. Cliquer sur **"Add user"** → **"Create new user"**
3. Remplir :
   - **Email**: `admin@medicab.com`
   - **Password**: Choisir un mot de passe fort
   - **Auto Confirm User**: ✅ Cocher
4. Cliquer sur **"Create user"**
5. Aller dans **"Table Editor"** → **"profiles"**
6. Trouver la ligne avec `admin@medicab.com`
7. Modifier :
   - `role` → `admin`
   - `status` → `active`
8. Sauvegarder

#### Option B: Via SQL

```sql
-- 1. Créer l'utilisateur (remplacer l'email et le mot de passe)
-- Ceci se fait via l'interface Authentication → Users

-- 2. Puis exécuter ceci pour le rendre admin :
UPDATE public.profiles 
SET role = 'admin', status = 'active', name = 'Administrateur'
WHERE email = 'admin@medicab.com';
```

---

### 5️⃣ Désactiver la Confirmation Email (Développement)

Pour tester rapidement sans devoir confirmer chaque email :

1. Dans Supabase, aller dans **"Authentication"** → **"Settings"**
2. Sous "Email Auth", **décocher** "Enable email confirmations"
3. Sauvegarder

⚠️ **En production**, réactivez cette option !

---

### 6️⃣ Lancer l'Application

```bash
# Installer les dépendances (si pas encore fait)
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

### 7️⃣ Se Connecter

1. Ouvrir l'application dans le navigateur
2. Utiliser les identifiants admin :
   - **Email**: `admin@medicab.com`
   - **Password**: Votre mot de passe
3. Cliquer sur **"Se connecter"**
4. ✅ Vous devriez voir le dashboard admin !

---

## 🎯 Que Faire Ensuite ?

### Créer un Médecin

1. Via la page d'inscription :
   - Cliquer sur "S'inscrire"
   - Choisir "Médecin"
   - Remplir le formulaire

2. Ou en tant qu'admin :
   - Aller dans "Gestion des Médecins"
   - Le nouveau médecin apparaît en "En attente"
   - Cliquer sur "Approuver"

### Créer un Patient

1. Se connecter en tant que médecin
2. Aller dans "Patients"
3. Cliquer sur "Nouveau Patient"
4. Remplir le formulaire

### Créer un Rendez-vous

1. Aller dans "Agenda"
2. Cliquer sur une date/heure
3. Sélectionner un patient
4. Remplir les détails

### Créer une Consultation

1. Marquer un rendez-vous comme "Complété"
2. Ou aller dans "Consultations" → "Nouvelle Consultation"
3. Remplir les détails médicaux

---

## 📚 Documentation Complète

- **[SETUP_CHECKLIST.md](/SETUP_CHECKLIST.md)** - Checklist détaillée étape par étape
- **[SERVICES_GUIDE.md](/SERVICES_GUIDE.md)** - Guide complet de tous les services Supabase
- **[USAGE_EXAMPLES.md](/USAGE_EXAMPLES.md)** - Exemples de code pour chaque fonctionnalité

---

## 🐛 Problèmes Courants

### "Supabase non configuré"
➡️ Vérifier que le fichier `.env` existe et contient les bonnes valeurs

### "Email or password incorrect"
➡️ Vérifier que le profil existe et a le statut "active" dans la table `profiles`

### "Email not confirmed"
➡️ Désactiver "Enable email confirmations" dans Authentication → Settings

### Les données ne s'affichent pas
➡️ Ouvrir la console (F12) et vérifier les erreurs

---

## ✅ Checklist Rapide

- [ ] ✅ Projet Supabase créé
- [ ] ✅ Schema SQL exécuté
- [ ] ✅ Fichier `.env` configuré
- [ ] ✅ Admin créé et actif
- [ ] ✅ Email confirmations désactivées (dev)
- [ ] ✅ Application lancée
- [ ] ✅ Connexion réussie

---

## 🎉 C'est Prêt !

Votre application MEDICAB est maintenant entièrement connectée à Supabase.

**Toutes les données sont stockées dans le cloud** ☁️
- ✅ Authentification sécurisée
- ✅ Base de données PostgreSQL
- ✅ Row Level Security (RLS)
- ✅ Temps réel (chat)
- ✅ Sauvegardes automatiques

**Prochaines étapes** : Utiliser les hooks dans vos composants !

```tsx
import { usePatients, useAppointments } from './hooks/useSupabase';

function MyComponent() {
  const { patients, loading } = usePatients(doctorId);
  const { appointments } = useAppointments(doctorId);
  
  // Vos données sont là ! 🎉
}
```

Consultez [USAGE_EXAMPLES.md](/USAGE_EXAMPLES.md) pour plus d'exemples.
