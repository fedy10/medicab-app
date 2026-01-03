# API des Services Supabase - MediCab

Ce document liste tous les services et fonctions disponibles pour interagir avec la base de données Supabase.

## 📦 Import des Services

```typescript
import {
  authService,
  profileService,
  patientService,
  appointmentService,
  consultationService,
  chatService,
  referralService,
  notificationService,
  revenueService,
} from './lib/services/supabaseService';
```

---

## 🔐 Authentication Service (`authService`)

### `login(email, password)`
Connecte un utilisateur.

```typescript
const result = await authService.login('user@example.com', 'password123');
// Retourne: { success: boolean, user?, profile?, error? }
```

### `register(userData)`
Inscrit un nouvel utilisateur (médecin ou secrétaire).

```typescript
const result = await authService.register({
  email: 'doctor@example.com',
  password: 'password123',
  name: 'Dr. Dupont',
  role: 'doctor',  // 'doctor' ou 'secretary'
  phone: '0612345678',
  specialty: 'Cardiologue',
  assignedDoctorId: 'uuid...',  // Pour les secrétaires uniquement
});
// Retourne: { success: boolean, user?, profile?, error? }
```

### `logout()`
Déconnecte l'utilisateur actuel.

```typescript
await authService.logout();
```

### `getCurrentSession()`
Récupère la session actuelle.

```typescript
const session = await authService.getCurrentSession();
// Retourne: { user, profile } ou null
```

### `onAuthStateChange(callback)`
Écoute les changements d'authentification.

```typescript
const subscription = authService.onAuthStateChange((session) => {
  console.log('Session changed:', session);
});
// N'oubliez pas de vous désabonner: subscription.unsubscribe()
```

---

## 👤 Profile Service (`profileService`)

### `getAll()`
Récupère tous les profils (admin uniquement).

```typescript
const profiles = await profileService.getAll();
```

### `getById(id)`
Récupère un profil par son ID.

```typescript
const profile = await profileService.getById('uuid...');
```

### `getDoctors()`
Récupère tous les médecins actifs.

```typescript
const doctors = await profileService.getDoctors();
```

### `getSecretaries(doctorId?)`
Récupère toutes les secrétaires (optionnellement filtrées par médecin).

```typescript
const secretaries = await profileService.getSecretaries();
const mySecretaries = await profileService.getSecretaries('doctor-uuid');
```

### `update(id, updates)`
Met à jour un profil.

```typescript
const updatedProfile = await profileService.update('uuid...', {
  name: 'Nouveau Nom',
  phone: '0612345678',
});
```

### `toggleStatus(doctorId, newStatus)`
Active ou suspend un médecin.

```typescript
await profileService.toggleStatus('doctor-uuid', 'active');
await profileService.toggleStatus('doctor-uuid', 'suspended');
```

### `delete(id)`
Supprime un profil.

```typescript
await profileService.delete('uuid...');
```

---

## 🏥 Patient Service (`patientService`)

### `getAll(doctorId)`
Récupère tous les patients d'un médecin.

```typescript
const patients = await patientService.getAll('doctor-uuid');
```

### `getById(id)`
Récupère un patient par son ID.

```typescript
const patient = await patientService.getById('patient-uuid');
```

### `search(doctorId, searchTerm)`
Recherche des patients par nom.

```typescript
const results = await patientService.search('doctor-uuid', 'Dupont');
```

### `create(patient)`
Crée un nouveau patient.

```typescript
const newPatient = await patientService.create({
  name: 'Jean Dupont',
  age: 45,
  phone: '0612345678',
  email: 'jean@example.com',
  address: '123 Rue de la Paix',
  diseases: [
    { id: '1', name: 'Diabète', emoji: '🩺', diagnosedDate: '2024-01-01' }
  ],
  doctor_id: 'doctor-uuid',
});
```

### `update(id, updates)`
Met à jour un patient.

```typescript
const updated = await patientService.update('patient-uuid', {
  age: 46,
  phone: '0612345679',
});
```

### `delete(id)`
Supprime un patient.

```typescript
await patientService.delete('patient-uuid');
```

### `getStats(doctorId)`
Statistiques des patients d'un médecin.

```typescript
const stats = await patientService.getStats('doctor-uuid');
// Retourne: { total, withChronicDiseases }
```

---

## 📅 Appointment Service (`appointmentService`)

### `getAll(doctorId?, filters?)`
Récupère les rendez-vous.

```typescript
// Tous les rendez-vous d'un médecin
const appointments = await appointmentService.getAll('doctor-uuid');

// Avec filtres
const filtered = await appointmentService.getAll('doctor-uuid', {
  date: '2024-01-15',
  status: 'scheduled',
});
```

### `getById(id)`
Récupère un rendez-vous par ID.

```typescript
const appointment = await appointmentService.getById('appointment-uuid');
```

### `create(appointment)`
Crée un nouveau rendez-vous.

```typescript
const newAppointment = await appointmentService.create({
  patient_id: 'patient-uuid',
  patient_name: 'Jean Dupont',
  doctor_id: 'doctor-uuid',
  date: '2024-01-15',
  time: '14:30:00',
  duration: 30,
  type: 'consultation',  // 'consultation' | 'follow-up' | 'emergency'
  status: 'scheduled',
  notes: 'Première consultation',
  created_by: 'user-uuid',
});
```

### `update(id, updates)`
Met à jour un rendez-vous.

```typescript
const updated = await appointmentService.update('appointment-uuid', {
  status: 'completed',
  notes: 'Consultation terminée',
});
```

### `delete(id)`
Supprime un rendez-vous.

```typescript
await appointmentService.delete('appointment-uuid');
```

### `getStats(doctorId, startDate?, endDate?)`
Statistiques des rendez-vous.

```typescript
const stats = await appointmentService.getStats('doctor-uuid');
// Retourne: { total, completed, scheduled, cancelled }

// Avec période
const monthStats = await appointmentService.getStats(
  'doctor-uuid',
  '2024-01-01',
  '2024-01-31'
);
```

### `checkConflicts(doctorId, date, time, excludeId?)`
Vérifie les conflits d'horaires.

```typescript
const hasConflict = await appointmentService.checkConflicts(
  'doctor-uuid',
  '2024-01-15',
  '14:30:00'
);
```

---

## 🩺 Consultation Service (`consultationService`)

### `getAll(doctorId?, patientId?)`
Récupère les consultations.

```typescript
// Toutes les consultations d'un médecin
const consultations = await consultationService.getAll('doctor-uuid');

// Toutes les consultations d'un patient
const patientConsults = await consultationService.getAll(undefined, 'patient-uuid');
```

### `getById(id)`
Récupère une consultation par ID.

```typescript
const consultation = await consultationService.getById('consultation-uuid');
```

### `create(consultation)`
Crée une nouvelle consultation.

```typescript
const newConsultation = await consultationService.create({
  patient_id: 'patient-uuid',
  patient_name: 'Jean Dupont',
  doctor_id: 'doctor-uuid',
  date: '2024-01-15',
  time: '14:30:00',
  symptoms: 'Maux de tête persistants',
  diagnosis: 'Migraine',
  prescription: 'Paracétamol 500mg, 3x/jour',
  notes: 'Revoir dans 1 semaine',
  files: [],
});
```

### `update(id, updates)`
Met à jour une consultation.

```typescript
const updated = await consultationService.update('consultation-uuid', {
  diagnosis: 'Migraine chronique',
  prescription: 'Paracétamol 1000mg, 3x/jour',
});
```

### `delete(id)`
Supprime une consultation.

```typescript
await consultationService.delete('consultation-uuid');
```

### `getStats(doctorId, startDate?, endDate?)`
Statistiques des consultations.

```typescript
const stats = await consultationService.getStats('doctor-uuid', '2024-01-01', '2024-01-31');
// Retourne: { total, consultations }
```

---

## 💬 Chat Service (`chatService`)

### `getConversations(userId)`
Récupère les conversations d'un utilisateur.

```typescript
const conversations = await chatService.getConversations('user-uuid');
// Retourne: [{ userId, lastMessage, unreadCount }, ...]
```

### `getMessages(userId1, userId2)`
Récupère les messages entre deux utilisateurs.

```typescript
const messages = await chatService.getMessages('user1-uuid', 'user2-uuid');
```

### `sendMessage(message)`
Envoie un message.

```typescript
const newMessage = await chatService.sendMessage({
  sender_id: 'user1-uuid',
  sender_name: 'Dr. Dupont',
  recipient_id: 'user2-uuid',
  content: 'Bonjour, comment allez-vous ?',
  files: [],
});
```

### `markAsRead(senderId, recipientId)`
Marque les messages comme lus.

```typescript
await chatService.markAsRead('sender-uuid', 'recipient-uuid');
```

### `editMessage(id, newContent)`
Modifie un message.

```typescript
const edited = await chatService.editMessage('message-uuid', 'Nouveau contenu');
```

### `deleteMessage(id)`
Supprime un message.

```typescript
await chatService.deleteMessage('message-uuid');
```

### `countUnread(userId)`
Compte les messages non lus.

```typescript
const count = await chatService.countUnread('user-uuid');
```

### `subscribeToMessages(userId, callback)`
S'abonne aux nouveaux messages en temps réel.

```typescript
const subscription = chatService.subscribeToMessages('user-uuid', (message) => {
  console.log('Nouveau message:', message);
});

// Désabonnement
subscription.unsubscribe();
```

---

## 📄 Referral Service (`referralService`)

### `getAll(doctorId?)`
Récupère les lettres d'orientation.

```typescript
const referrals = await referralService.getAll('doctor-uuid');
```

### `getById(id)`
Récupère une lettre par ID.

```typescript
const referral = await referralService.getById('referral-uuid');
```

### `create(referral)`
Crée une lettre d'orientation.

```typescript
const newReferral = await referralService.create({
  patient_id: 'patient-uuid',
  patient_name: 'Jean Dupont',
  from_doctor_id: 'doctor1-uuid',
  from_doctor_name: 'Dr. Dupont',
  to_doctor_id: 'doctor2-uuid',  // null pour impression
  to_doctor_name: 'Dr. Martin',
  specialty: 'Cardiologie',
  type: 'digital',  // 'digital' ou 'print'
  content: 'Lettre d\'orientation...',
  status: 'pending',
  files: [],
});
```

### `update(id, updates)`
Met à jour une lettre.

```typescript
const updated = await referralService.update('referral-uuid', {
  status: 'sent',
});
```

### `delete(id)`
Supprime une lettre.

```typescript
await referralService.delete('referral-uuid');
```

---

## 🔔 Notification Service (`notificationService`)

### `getByUser(userId)`
Récupère les notifications d'un utilisateur.

```typescript
const notifications = await notificationService.getByUser('user-uuid');
```

### `create(notification)`
Crée une notification.

```typescript
const newNotif = await notificationService.create({
  user_id: 'user-uuid',
  type: 'appointment',  // 'message' | 'appointment' | 'referral' | 'system'
  title: 'Nouveau rendez-vous',
  message: 'Vous avez un rendez-vous à 14h30',
  link: '/appointments',
});
```

### `markAsRead(id)`
Marque une notification comme lue.

```typescript
await notificationService.markAsRead('notification-uuid');
```

### `delete(id)`
Supprime une notification.

```typescript
await notificationService.delete('notification-uuid');
```

### `countUnread(userId)`
Compte les notifications non lues.

```typescript
const count = await notificationService.countUnread('user-uuid');
```

---

## 💰 Revenue Service (`revenueService`)

### `getAll(doctorId?)`
Récupère les revenus.

```typescript
const revenues = await revenueService.getAll('doctor-uuid');
```

### `getById(id)`
Récupère un revenu par ID.

```typescript
const revenue = await revenueService.getById('revenue-uuid');
```

### `create(revenue)`
Crée un revenu.

```typescript
const newRevenue = await revenueService.create({
  doctor_id: 'doctor-uuid',
  amount: 60.00,
  date: '2024-01-15',
  type: 'consultation',  // 'consultation' | 'procedure' | 'other'
  description: 'Consultation standard',
  patient_id: 'patient-uuid',
  patient_name: 'Jean Dupont',
});
```

### `update(id, updates)`
Met à jour un revenu.

```typescript
const updated = await revenueService.update('revenue-uuid', {
  amount: 80.00,
  description: 'Consultation approfondie',
});
```

### `delete(id)`
Supprime un revenu.

```typescript
await revenueService.delete('revenue-uuid');
```

### `getStats(doctorId, startDate?, endDate?)`
Statistiques des revenus.

```typescript
const stats = await revenueService.getStats('doctor-uuid', '2024-01-01', '2024-01-31');
// Retourne: { total, count, average, revenues }
```

### `getStatsByPeriod(doctorId, period)`
Statistiques par période.

```typescript
const dayStats = await revenueService.getStatsByPeriod('doctor-uuid', 'day');
const weekStats = await revenueService.getStatsByPeriod('doctor-uuid', 'week');
const monthStats = await revenueService.getStatsByPeriod('doctor-uuid', 'month');
const yearStats = await revenueService.getStatsByPeriod('doctor-uuid', 'year');
```

---

## 🔧 Gestion des Erreurs

Toutes les fonctions peuvent lever des exceptions. Utilisez try/catch :

```typescript
try {
  const patients = await patientService.getAll('doctor-uuid');
  console.log('Patients récupérés:', patients);
} catch (error) {
  console.error('Erreur:', error);
  // Gérer l'erreur (afficher un message, etc.)
}
```

---

## 📝 Types TypeScript

Tous les types sont générés automatiquement depuis votre schéma Supabase :

```typescript
import type { Database } from './lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
// etc...
```

---

## ✅ Bonnes Pratiques

1. **Toujours gérer les erreurs** avec try/catch
2. **Vérifier l'authentification** avant d'appeler les services
3. **Utiliser les filtres** pour limiter les données récupérées
4. **Ne pas stocker de données sensibles** côté client
5. **Se désabonner** des subscriptions temps réel quand elles ne sont plus nécessaires

---

**🎉 Vous avez maintenant accès à toutes les fonctionnalités de la base de données !**
