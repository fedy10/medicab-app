# 📖 Guide de Migration - localStorage vers Supabase

Ce guide vous accompagne dans la migration progressive de votre application de localStorage vers Supabase.

## 🎯 Objectif

Remplacer toutes les opérations `dataStore` (localStorage) par les services Supabase correspondants.

## 📊 Cartographie des Services

| Fonctionnalité | Ancien (localStorage) | Nouveau (Supabase) |
|----------------|----------------------|-------------------|
| Authentification | `dataStore.login()` | `authService.login()` |
| Profils | `dataStore.getUsers()` | `profileService.getAll()` |
| Patients | `dataStore.getPatients()` | `patientService.getAll()` |
| Rendez-vous | `dataStore.getAppointments()` | `appointmentService.getAll()` |
| Consultations | `dataStore.getConsultations()` | `consultationService.getAll()` |
| Messages | `dataStore.getChatMessages()` | `chatService.getMessages()` |
| Orientations | `dataStore.getReferralLetters()` | `referralService.getAll()` |
| Notifications | `dataStore.getNotifications()` | `notificationService.getByUser()` |
| Revenus | `dataStore.getRevenues()` | `revenueService.getAll()` |
| Fichiers | localStorage | `fileService.upload()` |

## 🚀 Ordre de Migration Recommandé

### Phase 1️⃣ : Authentification (PRIORITÉ)

**Fichiers à modifier** :
- `components/auth/LoginPage.tsx`
- `components/auth/RegisterPage.tsx`
- `App.tsx`

#### Avant (LoginPage.tsx)
```typescript
import { dataStore } from '../../utils/dataStore';

const handleLogin = async () => {
  const result = await dataStore.login(email, password);
  if (result.success) {
    // ...
  }
};
```

#### Après (LoginPage.tsx)
```typescript
import { useAuth } from '../../hooks/useAuth';

const { login, loading } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    // ...
  }
};
```

#### Avant (App.tsx)
```typescript
import { dataStore } from './utils/dataStore';

// Initialiser les données
useEffect(() => {
  dataStore.initialize();
}, []);

// Vérifier la session
const session = dataStore.getCurrentSession();
```

#### Après (App.tsx)
```typescript
import { useAuth } from './hooks/useAuth';

const { user, profile, loading, isAuthenticated } = useAuth();

// Plus besoin d'initialisation manuelle
// La session est gérée automatiquement par useAuth
```

### Phase 2️⃣ : Gestion des Patients

**Fichiers à modifier** :
- `components/doctor/PatientsView.tsx`
- `components/secretary/SecretaryPatientsView.tsx`

#### Avant
```typescript
import { dataStore } from '../../utils/dataStore';

const patients = dataStore.getPatients(doctorId);
```

#### Après
```typescript
import { patientService } from '../../lib/services/supabaseService';
import { useState, useEffect } from 'react';

const [patients, setPatients] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadPatients() {
    try {
      const data = await patientService.getAll(doctorId);
      setPatients(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }
  loadPatients();
}, [doctorId]);
```

#### Ajouter un patient
```typescript
// Avant
dataStore.addPatient(newPatient);

// Après
await patientService.create(newPatient);
// Recharger la liste
const updatedPatients = await patientService.getAll(doctorId);
setPatients(updatedPatients);
```

#### Modifier un patient
```typescript
// Avant
dataStore.updatePatient(patientId, updates);

// Après
await patientService.update(patientId, updates);
```

#### Supprimer un patient
```typescript
// Avant
dataStore.deletePatient(patientId);

// Après
await patientService.delete(patientId);
```

### Phase 3️⃣ : Rendez-vous (Agenda)

**Fichiers à modifier** :
- `components/doctor/CalendarView.tsx`
- `components/secretary/SecretaryAgendaView.tsx`

#### Avant
```typescript
const appointments = dataStore.getAppointments(doctorId);
dataStore.addAppointment(newAppointment);
```

#### Après
```typescript
// Récupérer tous les rendez-vous
const appointments = await appointmentService.getAll(doctorId);

// Créer un rendez-vous
await appointmentService.create({
  patient_id: patientId,
  patient_name: patientName,
  doctor_id: doctorId,
  date: '2025-01-15',
  time: '10:00',
  duration: 30,
  type: 'consultation',
  status: 'scheduled',
  created_by: userId,
});

// Mettre à jour
await appointmentService.update(appointmentId, { status: 'completed' });

// Supprimer
await appointmentService.delete(appointmentId);
```

### Phase 4️⃣ : Consultations

**Fichiers à modifier** :
- `components/doctor/ConsultationsView.tsx`

#### Avant
```typescript
const consultations = dataStore.getConsultations(doctorId);
dataStore.addConsultation(newConsultation);
```

#### Après
```typescript
// Récupérer
const consultations = await consultationService.getAll(doctorId);

// Créer
await consultationService.create({
  patient_id: patientId,
  patient_name: patientName,
  doctor_id: doctorId,
  date: '2025-01-15',
  time: '10:00',
  symptoms: 'Symptômes...',
  diagnosis: 'Diagnostic...',
  prescription: 'Ordonnance...',
  notes: 'Notes...',
});

// Mettre à jour
await consultationService.update(consultationId, { prescription: '...' });
```

### Phase 5️⃣ : Chat / Messages

**Fichiers à modifier** :
- `components/chat/DoctorSecretaryChat.tsx`
- `components/chat/DoctorAdminChat.tsx`

#### Avant
```typescript
const messages = dataStore.getChatMessages(userId1, userId2);
dataStore.addChatMessage(newMessage);
```

#### Après
```typescript
// Récupérer les messages
const messages = await chatService.getMessages(userId1, userId2);

// Envoyer un message
await chatService.sendMessage({
  sender_id: senderId,
  sender_name: senderName,
  recipient_id: recipientId,
  content: messageContent,
  files: [], // Optionnel
});

// Modifier un message
await chatService.updateMessage(messageId, newContent);

// Supprimer un message
await chatService.deleteMessage(messageId);

// Marquer comme lu
await chatService.markAsRead(senderId, recipientId);

// Real-time : S'abonner aux nouveaux messages
useEffect(() => {
  const subscription = chatService.subscribeToMessages(
    userId,
    (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

### Phase 6️⃣ : Revenus

**Fichiers à modifier** :
- `components/doctor/RevenueView.tsx`
- `components/admin/AdminRevenueView.tsx`

#### Avant
```typescript
const revenues = dataStore.getRevenues(doctorId);
```

#### Après
```typescript
// Récupérer les revenus
const revenues = await revenueService.getAll(doctorId);

// Ajouter un revenu
await revenueService.create({
  doctor_id: doctorId,
  amount: 50,
  date: '2025-01-15',
  type: 'consultation',
  description: 'Consultation générale',
  patient_id: patientId,
  patient_name: patientName,
});

// Statistiques
const stats = await revenueService.getStats(
  doctorId,
  '2025-01-01', // startDate
  '2025-12-31'  // endDate
);
// stats = { total, count, average, revenues }
```

### Phase 7️⃣ : Profils Utilisateurs

**Fichiers à modifier** :
- `components/doctor/ProfileView.tsx`
- `components/secretary/SecretaryProfileView.tsx`
- `components/admin/MedecinsManagement.tsx`

#### Avant
```typescript
const doctors = dataStore.getUsers().filter(u => u.role === 'doctor');
dataStore.updateUser(userId, updates);
```

#### Après
```typescript
// Récupérer tous les médecins
const doctors = await profileService.getByRole('doctor');

// Récupérer les secrétaires d'un médecin
const secretaries = await profileService.getSecretariesByDoctor(doctorId);

// Mettre à jour un profil
await profileService.update(userId, {
  name: 'Nouveau nom',
  phone: '+216 12 345 678',
  specialty: 'Cardiologie',
});

// Suspendre/Activer
await profileService.updateStatus(userId, 'suspended');
await profileService.updateStatus(userId, 'active');

// Avec useAuth pour le profil actuel
const { updateProfile } = useAuth();
await updateProfile({ name: 'Nouveau nom' });
```

### Phase 8️⃣ : Upload de Fichiers

**Fichiers à modifier** :
- `components/doctor/FileUploader.tsx`
- `components/doctor/ModernFileUploader.tsx`

#### Avant
```typescript
// localStorage (fichiers en base64 - pas optimal)
```

#### Après
```typescript
// Upload un fichier
const uploadedFile = await fileService.upload(
  file, // File object from input
  patientId,
  uploadedBy
);
// uploadedFile contient { id, name, type, size, url, ... }

// Récupérer les fichiers d'un patient
const files = await fileService.getByPatient(patientId);

// Supprimer un fichier
await fileService.delete(fileId);

// Télécharger un fichier
const blob = await fileService.download(storagePath);
```

## 🔄 Pattern de Conversion Général

Pour chaque composant utilisant `dataStore` :

### 1. Importer les services Supabase
```typescript
import {
  patientService,
  appointmentService,
  // ... autres services
} from '../../lib/services/supabaseService';
```

### 2. Gérer le state avec async/await
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const result = await service.getAll();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);
```

### 3. Gérer les mutations (create, update, delete)
```typescript
const handleCreate = async (newItem) => {
  try {
    await service.create(newItem);
    // Recharger les données
    const updated = await service.getAll();
    setData(updated);
    toast.success('Créé avec succès');
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

### 4. Afficher les états de chargement
```typescript
if (loading) return <div>Chargement...</div>;
if (error) return <div>Erreur: {error}</div>;
```

## 🧪 Testing après Migration

Pour chaque fonctionnalité migrée, vérifier :

1. ✅ **Lecture** : Les données s'affichent correctement
2. ✅ **Création** : Nouveaux éléments ajoutés avec succès
3. ✅ **Modification** : Les mises à jour fonctionnent
4. ✅ **Suppression** : Les suppressions fonctionnent
5. ✅ **Permissions** : Chaque rôle voit uniquement ses données
6. ✅ **Real-time** : Les changements se synchronisent (pour le chat)

## 🎯 Checklist de Migration

- [ ] Phase 1 : Authentification
  - [ ] Login
  - [ ] Register
  - [ ] Logout
  - [ ] Session management
- [ ] Phase 2 : Patients
  - [ ] Liste patients
  - [ ] Créer patient
  - [ ] Modifier patient
  - [ ] Supprimer patient
- [ ] Phase 3 : Rendez-vous
  - [ ] Agenda
  - [ ] Créer RDV
  - [ ] Modifier RDV
  - [ ] Annuler RDV
- [ ] Phase 4 : Consultations
  - [ ] Liste consultations
  - [ ] Créer consultation
  - [ ] Modifier consultation
- [ ] Phase 5 : Chat
  - [ ] Afficher messages
  - [ ] Envoyer message
  - [ ] Modifier message
  - [ ] Supprimer message
  - [ ] Real-time
- [ ] Phase 6 : Revenus
  - [ ] Liste revenus
  - [ ] Ajouter revenu
  - [ ] Statistiques
- [ ] Phase 7 : Profils
  - [ ] Gestion médecins
  - [ ] Gestion secrétaires
  - [ ] Suspension/Activation
- [ ] Phase 8 : Fichiers
  - [ ] Upload fichiers
  - [ ] Liste fichiers
  - [ ] Téléchargement
  - [ ] Suppression

## 🐛 Debugging Commun

### Erreur : "Missing user_id" ou "null value"
- Vérifiez que vous passez bien les IDs requis
- En Supabase, utilisez des UUIDs (ex: `crypto.randomUUID()`)

### Erreur : "Policy violation"
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez que les policies RLS sont correctes
- Vérifiez les rôles dans la table `profiles`

### Données ne s'affichent pas
- Vérifiez la console pour les erreurs
- Vérifiez que les données existent dans Supabase (Table Editor)
- Vérifiez que le `useEffect` se déclenche bien

### Real-time ne fonctionne pas
- Vérifiez que Real-time est activé dans Supabase (Database → Replication)
- Vérifiez la syntaxe du channel et du filtre

## 💡 Conseils

1. **Migrer progressivement** : Ne pas tout faire d'un coup
2. **Tester après chaque phase** : Valider avant de continuer
3. **Garder localStorage en backup** : Ne pas supprimer `dataStore.ts` immédiatement
4. **Logger les erreurs** : Utiliser `console.log` pour débugger
5. **Utiliser les DevTools Supabase** : Très utiles pour voir les requêtes en temps réel

## 🎉 Après la Migration

Une fois tout migré :

1. Supprimer `utils/dataStore.ts`
2. Supprimer toutes les références à localStorage
3. Tester l'application complète
4. Déployer sur un environnement de production

Félicitations ! Votre application utilise maintenant Supabase ! 🚀
