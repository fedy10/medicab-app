# ✅ Checklist de Configuration Supabase - MEDICAB

## 📋 Étape 1: Configuration Supabase

### 1.1 Créer un projet Supabase
- [ ] Aller sur [supabase.com](https://supabase.com)
- [ ] Créer un compte / Se connecter
- [ ] Cliquer sur "New Project"
- [ ] Choisir un nom (ex: "medicab-production")
- [ ] Définir un mot de passe de base de données (⚠️ à sauvegarder !)
- [ ] Choisir une région proche (ex: Europe West)
- [ ] Attendre la création du projet (2-3 minutes)

### 1.2 Récupérer les identifiants
- [ ] Aller dans "Settings" → "API"
- [ ] Copier le "Project URL" (ex: `https://xxx.supabase.co`)
- [ ] Copier la clé "anon/public" (commence par `eyJhbGc...`)

### 1.3 Configurer l'application
- [ ] Ouvrir le fichier `/lib/supabase.ts`
- [ ] Remplacer `VOTRE_SUPABASE_URL` par votre Project URL
- [ ] Remplacer `VOTRE_SUPABASE_ANON_KEY` par votre clé anon
- [ ] Sauvegarder le fichier

---

## 🗄️ Étape 2: Exécuter le Schema SQL

### 2.1 Ouvrir l'éditeur SQL
- [ ] Dans Supabase, aller dans "SQL Editor"
- [ ] Cliquer sur "New query"

### 2.2 Copier-coller le schema
- [ ] Copier **TOUT** le contenu du schema SQL fourni
- [ ] Coller dans l'éditeur SQL
- [ ] Cliquer sur "Run" (ou Ctrl+Enter)

### 2.3 Vérifier la création
- [ ] Vérifier qu'il n'y a pas d'erreurs (zone rouge)
- [ ] Aller dans "Table Editor"
- [ ] Vérifier que ces tables existent :
  - [ ] `profiles`
  - [ ] `patients`
  - [ ] `appointments`
  - [ ] `consultations`
  - [ ] `chat_messages`
  - [ ] `referral_letters`
  - [ ] `notifications`
  - [ ] `revenues`

---

## 🔐 Étape 3: Configuration de l'Authentification

### 3.1 Activer l'authentification par email
- [ ] Aller dans "Authentication" → "Providers"
- [ ] Vérifier que "Email" est activé
- [ ] **IMPORTANT**: Désactiver "Confirm email" si vous testez en local
  - Dans "Authentication" → "Settings"
  - Décocher "Enable email confirmations"
  - (Vous pouvez le réactiver en production)

### 3.2 Configurer les emails (optionnel pour production)
- [ ] Dans "Authentication" → "Email Templates"
- [ ] Personnaliser les templates si nécessaire
- [ ] Configurer votre propre serveur SMTP (Settings → Auth)

---

## 👤 Étape 4: Créer le Premier Utilisateur Admin

### 4.1 Via l'interface Supabase (Méthode Recommandée)
- [ ] Aller dans "Authentication" → "Users"
- [ ] Cliquer sur "Add user" → "Create new user"
- [ ] Email: `admin@medicab.com` (ou votre email)
- [ ] Password: Choisir un mot de passe fort
- [ ] Cliquer sur "Create user"
- [ ] Copier l'UUID de l'utilisateur créé

### 4.2 Mettre à jour le profil en Admin
- [ ] Aller dans "Table Editor" → "profiles"
- [ ] Trouver la ligne avec votre email
- [ ] Modifier le champ `role` en `admin`
- [ ] Modifier le champ `status` en `active`
- [ ] Sauvegarder

### 4.3 Ou via SQL (Alternative)
```sql
-- Après avoir créé l'utilisateur, exécuter ceci :
UPDATE public.profiles 
SET role = 'admin', status = 'active' 
WHERE email = 'admin@medicab.com';
```

---

## 🧪 Étape 5: Tester la Connexion

### 5.1 Démarrer l'application
```bash
npm run dev
```

### 5.2 Vérifier dans la console
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Vérifier qu'il n'y a pas d'erreur Supabase
- [ ] Vous devriez voir : `✅ Migration vers Supabase - localStorage nettoyé`

### 5.3 Se connecter
- [ ] Utiliser l'email et mot de passe de l'admin
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier dans la console :
  ```
  🔑 Connexion Supabase...
  🔍 Récupération du profil...
  ✅ Connexion réussie !
  ```
- [ ] Le dashboard admin devrait s'afficher

---

## 🎯 Étape 6: Tester les Fonctionnalités

### 6.1 Créer un médecin
- [ ] En tant qu'admin, aller dans "Gestion des Médecins"
- [ ] Cliquer sur "Nouveau Médecin" (ou s'inscrire via la page d'inscription)
- [ ] Remplir le formulaire
- [ ] Le médecin doit apparaître avec le statut "En attente"
- [ ] Approuver le médecin

### 6.2 Créer un patient
- [ ] Se connecter en tant que médecin
- [ ] Aller dans "Patients"
- [ ] Créer un nouveau patient
- [ ] Vérifier qu'il apparaît dans la liste

### 6.3 Créer un rendez-vous
- [ ] Aller dans l'agenda
- [ ] Créer un rendez-vous pour le patient
- [ ] Vérifier qu'il apparaît dans le calendrier

### 6.4 Créer une consultation
- [ ] Marquer le rendez-vous comme "Complété"
- [ ] Créer une consultation
- [ ] Vérifier qu'elle apparaît dans "Consultations"

### 6.5 Vérifier les revenus
- [ ] Aller dans "Revenus"
- [ ] Vérifier que le revenu de la consultation est enregistré
- [ ] Vérifier les statistiques

---

## 🔍 Étape 7: Vérification de la Sécurité RLS

### 7.1 Tester les permissions
- [ ] Se connecter en tant que médecin A
- [ ] Créer un patient
- [ ] Se déconnecter
- [ ] Se connecter en tant que médecin B
- [ ] Vérifier que le patient du médecin A n'apparaît **PAS**

### 7.2 Tester les secrétaires
- [ ] Créer une secrétaire assignée au médecin A
- [ ] Se connecter en tant que secrétaire
- [ ] Vérifier qu'elle voit **uniquement** les patients du médecin A
- [ ] Vérifier qu'elle peut créer des rendez-vous
- [ ] Vérifier qu'elle ne peut **PAS** créer de consultations (réservé au médecin)

---

## 🐛 Dépannage

### Erreur: "Invalid API key"
- ✅ Vérifier que vous avez bien copié la clé "anon/public" (pas la clé "service_role")
- ✅ Vérifier qu'il n'y a pas d'espaces avant/après la clé
- ✅ Relancer le serveur (Ctrl+C puis `npm run dev`)

### Erreur: "Email not confirmed"
- ✅ Désactiver "Enable email confirmations" dans Authentication → Settings
- ✅ Ou vérifier votre boîte mail pour le lien de confirmation

### Erreur: "Profile not found"
- ✅ Vérifier que le trigger `on_auth_user_created` est bien créé
- ✅ Supprimer l'utilisateur et le recréer
- ✅ Ou créer manuellement le profil dans la table `profiles`

### Erreur: "Row Level Security policy violation"
- ✅ Vérifier que les policies RLS sont bien créées
- ✅ Vérifier que le statut du profil est "active" (pas "suspended")
- ✅ Vérifier le rôle de l'utilisateur (admin, doctor, secretary)

### Erreur: "Failed to fetch dynamically imported module"
- ✅ Vider le cache du navigateur (Ctrl+Shift+R)
- ✅ Relancer le serveur de développement
- ✅ Vérifier qu'il n'y a pas d'erreurs de syntaxe dans les fichiers TypeScript

### Les données ne s'affichent pas
- ✅ Ouvrir la console (F12) et vérifier les erreurs
- ✅ Vérifier que l'utilisateur est bien connecté (vérifier `profile` dans useAuth)
- ✅ Vérifier les logs Supabase dans "Logs" → "API"

---

## 📊 Étape 8: Vérification des Services

Ouvrez la console et testez manuellement les services :

```javascript
// Tester le service patients
import { patientService } from './lib/services/supabaseService';

// Récupérer les patients
const patients = await patientService.getByDoctor('doctor-uuid');
console.log('Patients:', patients);

// Créer un patient
const patient = await patientService.create({
  name: 'Test Patient',
  age: 30,
  doctor_id: 'doctor-uuid',
});
console.log('Patient créé:', patient);
```

---

## ✨ Étape 9: Optimisations (Optionnel)

### 9.1 Activer le temps réel (Realtime)
- [ ] Aller dans "Database" → "Replication"
- [ ] Activer la réplication pour les tables :
  - [ ] `chat_messages` (pour le chat en temps réel)
  - [ ] `notifications` (pour les notifications en temps réel)

### 9.2 Créer des index supplémentaires (si nécessaire)
Les index principaux sont déjà créés par le schema, mais vous pouvez en ajouter d'autres selon vos besoins.

### 9.3 Configurer le Storage (si vous gérez des fichiers)
- [ ] Aller dans "Storage"
- [ ] Créer un bucket "medical-files"
- [ ] Configurer les policies de sécurité

---

## 🎉 Checklist Finale

- [ ] ✅ Supabase configuré et accessible
- [ ] ✅ Toutes les tables créées
- [ ] ✅ RLS activé et testé
- [ ] ✅ Utilisateur admin créé et actif
- [ ] ✅ Connexion fonctionnelle
- [ ] ✅ Patients créés et affichés
- [ ] ✅ Rendez-vous créés et affichés
- [ ] ✅ Consultations créées et affichées
- [ ] ✅ Revenus enregistrés et statistiques affichées
- [ ] ✅ Chat fonctionnel (si utilisé)
- [ ] ✅ Notifications fonctionnelles (si utilisées)

---

## 🚀 Prochaines Étapes

Maintenant que Supabase est configuré, vous pouvez :

1. **Migrer vos composants** pour utiliser les hooks (`usePatients`, `useAppointments`, etc.)
2. **Remplacer toutes les données statiques** par des appels Supabase
3. **Supprimer tout code localStorage** (déjà nettoyé au démarrage)
4. **Tester en conditions réelles** avec plusieurs utilisateurs
5. **Déployer en production** (Vercel, Netlify, etc.)

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide des Services](/SERVICES_GUIDE.md)
- [Exemples d'Utilisation](/USAGE_EXAMPLES.md)
- [Dashboard Supabase](https://supabase.com/dashboard)

---

**Besoin d'aide ?** Consultez les logs Supabase dans "Logs" → "API" pour voir toutes les requêtes en temps réel.
