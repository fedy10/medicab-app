# 🏗️ Architecture MEDICAB - Supabase Edition

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDICAB APPLICATION                       │
│                    (React + TypeScript)                      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOM HOOKS LAYER                        │
│  usePatients | useAppointments | useConsultations | etc...  │
│              (State Management + Auto-refresh)               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                             │
│  authService | patientService | appointmentService | etc... │
│              (Business Logic + API Calls)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLIENT                            │
│                   (@supabase/supabase-js)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                           │
│  PostgreSQL | Auth | Storage | Realtime | Edge Functions    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

```
/
├── lib/
│   ├── supabase.ts                 # Configuration Supabase client
│   ├── database.types.ts           # Types TypeScript générés
│   └── services/
│       └── supabaseService.ts      # Tous les services (Auth, Patient, etc.)
│
├── hooks/
│   ├── useAuth.ts                  # Hook d'authentification
│   └── useSupabase.ts              # Hooks personnalisés (usePatients, etc.)
│
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx
│   │   ├── MedecinDashboard.tsx
│   │   └── SecretaireDashboard.tsx
│   └── [autres composants...]
│
├── contexts/
│   └── LanguageContext.tsx         # Contexte multilingue
│
├── .env.example                    # Template de configuration
├── QUICK_START.md                  # Guide de démarrage rapide
├── SETUP_CHECKLIST.md              # Checklist complète
├── SERVICES_GUIDE.md               # Documentation des services
├── USAGE_EXAMPLES.md               # Exemples de code
└── ARCHITECTURE.md                 # Ce fichier
```

---

## 🗄️ Schéma de Base de Données

### Tables Principales

```sql
profiles          -- Utilisateurs (admin, doctor, secretary)
├── patients      -- Patients d'un médecin
│   ├── appointments     -- Rendez-vous
│   ├── consultations    -- Consultations médicales
│   └── revenues         -- Revenus liés aux consultations
│
├── chat_messages        -- Messages privés entre utilisateurs
├── notifications        -- Notifications système
└── referral_letters     -- Lettres d'orientation
```

### Relations

```
profiles (doctor)
    ↓ has many
patients
    ↓ has many
appointments
    ↓ becomes
consultations
    ↓ generates
revenues

profiles (secretary)
    ↓ assigned to
profiles (doctor)
    ↓ can manage
patients & appointments
```

---

## 🔐 Sécurité (Row Level Security)

### Politiques RLS

#### Profiles
- ✅ Lecture: Soi-même, Admin, Médecin assigné, Secrétaire du médecin
- ✅ Modification: Soi-même OU Admin

#### Patients & Appointments
- ✅ Accès: Médecin propriétaire OU Sa secrétaire
- ✅ Création/Modification/Suppression: Même règle

#### Consultations
- ✅ Accès: Médecin uniquement (pas les secrétaires)
- ✅ Données médicales sensibles

#### Chat
- ✅ Lecture: Expéditeur OU Destinataire
- ✅ Envoi: Basé sur les rôles (Admin↔Doctor, Doctor↔Doctor, Doctor↔Secretary)
- ✅ Modification/Suppression: Expéditeur uniquement

#### Revenus
- ✅ Accès: Médecin propriétaire uniquement

---

## 🎯 Services Disponibles

### 1. Authentication Service
```typescript
authService.login(email, password)
authService.register(userData)
authService.logout()
authService.getCurrentSession()
authService.onAuthStateChange(callback)
```

### 2. Profile Service
```typescript
profileService.getAll()
profileService.getById(id)
profileService.getAllDoctors()
profileService.getActiveDoctors()
profileService.getSecretariesByDoctor(doctorId)
profileService.update(id, updates)
profileService.updateStatus(id, status)
profileService.delete(id)
```

### 3. Patient Service
```typescript
patientService.getByDoctor(doctorId)
patientService.getById(id)
patientService.create(patient)
patientService.update(id, updates)
patientService.delete(id)
patientService.search(doctorId, query)
patientService.getStats(doctorId)
```

### 4. Appointment Service
```typescript
appointmentService.getByDoctor(doctorId, filters)
appointmentService.getByPatient(patientId)
appointmentService.getById(id)
appointmentService.create(appointment)
appointmentService.update(id, updates)
appointmentService.delete(id)
appointmentService.markAsCompleted(id)
appointmentService.cancel(id)
appointmentService.getStats(doctorId, startDate, endDate)
appointmentService.checkConflict(doctorId, date, time, duration)
```

### 5. Consultation Service
```typescript
consultationService.getByDoctor(doctorId, filters)
consultationService.getByPatient(patientId)
consultationService.getById(id)
consultationService.create(consultation)
consultationService.update(id, updates)
consultationService.delete(id)
consultationService.getStats(doctorId, startDate, endDate)
```

### 6. Chat Service
```typescript
chatService.getConversations(userId)
chatService.getMessages(userId, otherUserId)
chatService.sendMessage(message)
chatService.markAsRead(userId, otherUserId)
chatService.deleteMessage(id)
chatService.editMessage(id, content)
chatService.countUnread(userId)
chatService.subscribeToMessages(userId, callback)  // Temps réel
```

### 7. Referral Service
```typescript
referralService.getAll(doctorId)
referralService.getById(id)
referralService.create(referral)
referralService.update(id, updates)
referralService.delete(id)
```

### 8. Notification Service
```typescript
notificationService.getByUser(userId)
notificationService.create(notification)
notificationService.markAsRead(id)
notificationService.delete(id)
notificationService.countUnread(userId)
```

### 9. Revenue Service
```typescript
revenueService.getAll(doctorId)
revenueService.getById(id)
revenueService.create(revenue)
revenueService.update(id, updates)
revenueService.delete(id)
revenueService.getStats(doctorId, startDate, endDate)
revenueService.getByPeriod(doctorId, 'day' | 'week' | 'month' | 'year')
```

---

## 🪝 Hooks Personnalisés

### usePatients(doctorId)
Gère automatiquement :
- ✅ Chargement des patients
- ✅ État loading/error
- ✅ CRUD operations (create, update, delete)
- ✅ Refresh automatique

### useAppointments(doctorId, filters)
- ✅ Chargement avec filtres (date, status)
- ✅ Création/Modification/Suppression
- ✅ Actions spéciales (markAsCompleted, cancel)
- ✅ Refresh automatique

### useConsultations(doctorId, filters)
- ✅ Chargement avec filtres
- ✅ CRUD operations
- ✅ Refresh automatique

### useRevenues(doctorId)
- ✅ Chargement des revenus
- ✅ Calcul automatique des stats
- ✅ CRUD operations
- ✅ Refresh auto après create/update/delete

### useProfiles() (Admin)
- ✅ Chargement de tous les profils
- ✅ Liste des médecins
- ✅ Gestion du statut (active/suspended)
- ✅ CRUD operations

### useChat(userId, otherUserId)
- ✅ Chargement des messages
- ✅ **Temps réel** via subscriptions
- ✅ Envoi/Modification/Suppression
- ✅ Mise à jour automatique

### useNotifications(userId)
- ✅ Chargement des notifications
- ✅ Compteur de non lues
- ✅ Marquer comme lue
- ✅ Suppression

---

## 🔄 Flux de Données

### Exemple: Créer un Patient

```
1. Composant PatientsView
   ↓ utilise
2. Hook usePatients
   ↓ appelle
3. Service patientService.create()
   ↓ utilise
4. Supabase Client
   ↓ envoie requête à
5. Supabase Backend (PostgreSQL + RLS)
   ↓ valide les permissions
6. Insertion dans la table 'patients'
   ↓ retourne les données
7. Hook met à jour le state local
   ↓ React re-render
8. UI affiche le nouveau patient
```

### Exemple: Chat Temps Réel

```
1. Composant ChatView monte
   ↓ useChat s'abonne
2. chatService.subscribeToMessages()
   ↓ Supabase Realtime
3. Autre utilisateur envoie un message
   ↓ INSERT dans 'chat_messages'
4. Supabase Realtime détecte le changement
   ↓ envoie notification
5. Callback du hook exécuté
   ↓ Nouveau message ajouté au state
6. React re-render
   ↓ Message affiché instantanément
```

---

## 🎨 Patterns Utilisés

### 1. Service Layer Pattern
Séparation logique métier (services) et logique UI (composants)

### 2. Custom Hooks Pattern
Encapsulation de la logique de données dans des hooks réutilisables

### 3. Repository Pattern
Services comme abstraction de la couche de données

### 4. Observer Pattern
Subscriptions temps réel pour le chat et notifications

### 5. Error Boundary Pattern
Gestion des erreurs via try/catch dans tous les services

---

## 📈 Performance

### Optimisations Intégrées

1. **Index Database** : Index sur toutes les clés étrangères et colonnes fréquemment recherchées
2. **Pagination** : À implémenter via `.range(from, to)` pour grandes listes
3. **Caching** : Supabase cache les requêtes identiques
4. **useCallback** : Évite les re-renders inutiles dans les hooks
5. **Lazy Loading** : Chargement à la demande via les hooks

### Suggestions d'Amélioration

```typescript
// Pagination
const { data } = await supabase
  .from('patients')
  .select('*')
  .range(0, 9)  // 10 premiers résultats
  .limit(10);

// Cache côté client (React Query)
import { useQuery } from '@tanstack/react-query';

const { data: patients } = useQuery({
  queryKey: ['patients', doctorId],
  queryFn: () => patientService.getByDoctor(doctorId),
  staleTime: 5 * 60 * 1000,  // 5 minutes
});
```

---

## 🔒 Sécurité Best Practices

### ✅ Ce qui est déjà fait

- [x] Row Level Security (RLS) activé sur toutes les tables
- [x] Policies basées sur les rôles et relations
- [x] Clé anon/public utilisée (pas service_role)
- [x] Validation côté backend via RLS
- [x] Authentification sécurisée (JWT tokens)
- [x] Auto-refresh des tokens
- [x] Session persistante

### ⚠️ À faire en Production

- [ ] Activer la confirmation email
- [ ] Configurer les CORS
- [ ] Ajouter rate limiting
- [ ] Configurer SMTP pour emails professionnels
- [ ] Backups automatiques (déjà actifs par Supabase)
- [ ] Monitoring des erreurs (Sentry, LogRocket)
- [ ] HTTPS obligatoire (automatique avec Vercel/Netlify)

---

## 🚀 Déploiement

### Frontend (Recommandé: Vercel)

```bash
# 1. Push sur GitHub
git push origin main

# 2. Connecter à Vercel
# - Importer le projet GitHub
# - Ajouter les variables d'environnement :
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY

# 3. Déployer
# Vercel build et déploie automatiquement
```

### Backend (Supabase)

✅ Déjà déployé ! Supabase gère :
- Base de données PostgreSQL
- Authentification
- Storage
- Realtime
- Edge Functions (si nécessaire)

---

## 📊 Monitoring

### Logs Supabase

- **API Logs** : Voir toutes les requêtes en temps réel
- **Auth Logs** : Connexions/déconnexions
- **Database Logs** : Requêtes SQL
- **Realtime Logs** : Subscriptions actives

### Métriques à Surveiller

- Nombre de requêtes par seconde
- Temps de réponse API
- Taux d'erreur
- Utilisateurs actifs
- Taille de la base de données
- Bande passante utilisée

---

## 🎯 Prochaines Évolutions

### Court Terme
- [ ] Implémenter la pagination
- [ ] Ajouter un système de cache (React Query)
- [ ] Améliorer la gestion des erreurs (toasts)
- [ ] Ajouter des tests unitaires

### Moyen Terme
- [ ] Upload de fichiers (Supabase Storage)
- [ ] Export PDF des consultations
- [ ] Notifications push (FCM)
- [ ] Dashboard analytics avancé

### Long Terme
- [ ] Application mobile (React Native)
- [ ] API publique pour intégrations tierces
- [ ] Machine Learning (prédictions)
- [ ] Multi-tenancy (plusieurs cabinets)

---

## 📚 Ressources

- **[QUICK_START.md](./QUICK_START.md)** - Démarrage en 5 minutes
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Setup complet
- **[SERVICES_GUIDE.md](./SERVICES_GUIDE.md)** - Documentation des services
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Exemples de code
- **[Supabase Docs](https://supabase.com/docs)** - Documentation officielle

---

## 🎉 Conclusion

MEDICAB est maintenant une application **full-stack moderne** avec :

✅ **Backend robuste** (Supabase/PostgreSQL)
✅ **Authentification sécurisée** (JWT + RLS)
✅ **Base de données cloud** (Backups automatiques)
✅ **Temps réel** (Chat, Notifications)
✅ **Architecture scalable** (Services + Hooks)
✅ **TypeScript complet** (Type safety)
✅ **Prête pour la production** 🚀

**Aucune donnée en localStorage, tout est dans Supabase !** ☁️
