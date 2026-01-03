# 📚 Guide des Services Supabase - MEDICAB

Tous les services sont disponibles dans `/lib/services/supabaseService.ts`

## 🔐 Authentication Service (`authService`)

```typescript
import { authService } from './lib/services/supabaseService';

// Connexion
const result = await authService.login(email, password);
// Returns: { success: boolean, user?: User, profile?: Profile, error?: string }

// Inscription
const result = await authService.register({
  email, password, name, role, phone, address, specialty, assignedDoctorId
});
// Returns: { success: boolean, user?: User, profile?: Profile, error?: string }

// Déconnexion
await authService.logout();

// Session actuelle
const session = await authService.getCurrentSession();
// Returns: { user: User, profile: Profile } | null

// Écouter les changements
authService.onAuthStateChange((session) => {
  console.log('Session changed:', session);
});
```

---

## 👤 Profile Service (`profileService`)

```typescript
import { profileService } from './lib/services/supabaseService';

// Récupérer tous les profils (admin)
const profiles = await profileService.getAll();

// Récupérer un profil par ID
const profile = await profileService.getById(id);

// Récupérer tous les médecins
const doctors = await profileService.getAllDoctors();

// Récupérer médecins actifs uniquement
const activeDoctors = await profileService.getActiveDoctors();

// Récupérer les secrétaires d'un médecin
const secretaries = await profileService.getSecretariesByDoctor(doctorId);

// Mettre à jour un profil
const updated = await profileService.update(id, { name: 'New Name', phone: '123' });

// Changer le statut (admin)
const updated = await profileService.updateStatus(id, 'active' | 'suspended');

// Supprimer un profil (admin)
await profileService.delete(id);
```

---

## 🏥 Patient Service (`patientService`)

```typescript
import { patientService } from './lib/services/supabaseService';

// Récupérer patients d'un médecin
const patients = await patientService.getByDoctor(doctorId);

// Récupérer un patient par ID
const patient = await patientService.getById(id);

// Créer un patient
const newPatient = await patientService.create({
  name: 'John Doe',
  age: 35,
  phone: '123456',
  email: 'john@example.com',
  address: '123 Street',
  diseases: [{ id: '1', name: 'Diabetes', emoji: '💉' }],
  doctor_id: doctorId,
});

// Mettre à jour un patient
const updated = await patientService.update(id, { age: 36 });

// Supprimer un patient
await patientService.delete(id);

// Rechercher des patients
const results = await patientService.search(doctorId, 'John');

// Statistiques
const stats = await patientService.getStats(doctorId);
// Returns: { total: number, withDiseases: number }
```

---

## 📅 Appointment Service (`appointmentService`)

```typescript
import { appointmentService } from './lib/services/supabaseService';

// Récupérer rendez-vous d'un médecin
const appointments = await appointmentService.getByDoctor(doctorId, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'scheduled',
});

// Récupérer rendez-vous d'un patient
const appointments = await appointmentService.getByPatient(patientId);

// Récupérer un rendez-vous par ID
const appointment = await appointmentService.getById(id);

// Créer un rendez-vous
const newAppointment = await appointmentService.create({
  patient_id: patientId,
  patient_name: 'John Doe',
  doctor_id: doctorId,
  date: '2024-06-15',
  time: '14:30',
  duration: 30,
  type: 'consultation',
  status: 'scheduled',
  notes: 'First visit',
  created_by: userId,
});

// Mettre à jour
const updated = await appointmentService.update(id, { time: '15:00' });

// Supprimer
await appointmentService.delete(id);

// Marquer comme complété
await appointmentService.markAsCompleted(id);

// Annuler
await appointmentService.cancel(id);

// Vérifier les conflits d'horaire
const hasConflict = await appointmentService.checkConflict(
  doctorId, 
  '2024-06-15', 
  '14:30', 
  30, 
  excludeId // optionnel
);

// Statistiques
const stats = await appointmentService.getStats(doctorId, startDate, endDate);
// Returns: { total, scheduled, completed, cancelled }
```

---

## 🩺 Consultation Service (`consultationService`)

```typescript
import { consultationService } from './lib/services/supabaseService';

// Récupérer consultations d'un médecin
const consultations = await consultationService.getByDoctor(doctorId, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

// Récupérer consultations d'un patient
const consultations = await consultationService.getByPatient(patientId);

// Récupérer une consultation par ID
const consultation = await consultationService.getById(id);

// Créer une consultation
const newConsultation = await consultationService.create({
  patient_id: patientId,
  patient_name: 'John Doe',
  doctor_id: doctorId,
  date: '2024-06-15',
  time: '14:30',
  symptoms: 'Fever, headache',
  diagnosis: 'Common cold',
  prescription: 'Paracetamol 500mg',
  notes: 'Rest recommended',
  files: [{ name: 'scan.pdf', url: 'https://...', type: 'pdf', size: 12345 }],
});

// Mettre à jour
const updated = await consultationService.update(id, { diagnosis: 'Updated' });

// Supprimer
await consultationService.delete(id);

// Statistiques
const stats = await consultationService.getStats(doctorId, startDate, endDate);
// Returns: { total, consultations }
```

---

## 💬 Chat Service (`chatService`)

```typescript
import { chatService } from './lib/services/supabaseService';

// Récupérer toutes les conversations
const conversations = await chatService.getConversations(userId);

// Récupérer messages entre 2 utilisateurs
const messages = await chatService.getMessages(userId, otherUserId);

// Envoyer un message
const message = await chatService.sendMessage({
  sender_id: userId,
  sender_name: 'Dr. Smith',
  recipient_id: otherUserId,
  content: 'Hello!',
  files: [],
});

// Marquer comme lu
await chatService.markAsRead(userId, otherUserId);

// Modifier un message
const edited = await chatService.editMessage(messageId, 'New content');

// Supprimer un message
await chatService.deleteMessage(messageId);

// Compter messages non lus
const unreadCount = await chatService.countUnread(userId);

// Temps réel - S'abonner aux nouveaux messages
const subscription = chatService.subscribeToMessages(userId, (message) => {
  console.log('New message:', message);
});

// Pour se désabonner
subscription.unsubscribe();
```

---

## 📄 Referral Service (`referralService`)

```typescript
import { referralService } from './lib/services/supabaseService';

// Récupérer toutes les orientations
const referrals = await referralService.getAll(doctorId);

// Récupérer une orientation par ID
const referral = await referralService.getById(id);

// Créer une orientation
const newReferral = await referralService.create({
  patient_id: patientId,
  patient_name: 'John Doe',
  from_doctor_id: doctorId,
  from_doctor_name: 'Dr. Smith',
  to_doctor_id: otherDoctorId,
  to_doctor_name: 'Dr. Johnson',
  specialty: 'Cardiology',
  type: 'digital',
  content: 'Referral letter content...',
  status: 'pending',
  files: [],
});

// Mettre à jour
const updated = await referralService.update(id, { status: 'sent' });

// Supprimer
await referralService.delete(id);
```

---

## 🔔 Notification Service (`notificationService`)

```typescript
import { notificationService } from './lib/services/supabaseService';

// Récupérer notifications d'un utilisateur
const notifications = await notificationService.getByUser(userId);

// Créer une notification
const notification = await notificationService.create({
  user_id: userId,
  type: 'appointment',
  title: 'New Appointment',
  message: 'You have a new appointment tomorrow',
  read: false,
  link: '/appointments/123',
});

// Marquer comme lue
await notificationService.markAsRead(notificationId);

// Supprimer
await notificationService.delete(notificationId);

// Compter non lues
const unreadCount = await notificationService.countUnread(userId);
```

---

## 💰 Revenue Service (`revenueService`)

```typescript
import { revenueService } from './lib/services/supabaseService';

// Récupérer tous les revenus
const revenues = await revenueService.getAll(doctorId);

// Récupérer un revenu par ID
const revenue = await revenueService.getById(id);

// Créer un revenu
const newRevenue = await revenueService.create({
  doctor_id: doctorId,
  amount: 60.00,
  date: '2024-06-15',
  type: 'consultation',
  description: 'General consultation',
  patient_id: patientId,
  patient_name: 'John Doe',
});

// Mettre à jour
const updated = await revenueService.update(id, { amount: 75.00 });

// Supprimer
await revenueService.delete(id);

// Statistiques
const stats = await revenueService.getStats(doctorId, startDate, endDate);
// Returns: { total, count, average, revenues }

// Revenus par période
const dayStats = await revenueService.getByPeriod(doctorId, 'day');
const weekStats = await revenueService.getByPeriod(doctorId, 'week');
const monthStats = await revenueService.getByPeriod(doctorId, 'month');
const yearStats = await revenueService.getByPeriod(doctorId, 'year');
```

---

## 🎯 Exemples d'Utilisation Pratiques

### Créer un patient et lui assigner un rendez-vous

```typescript
// 1. Créer le patient
const patient = await patientService.create({
  name: 'Marie Dupont',
  age: 42,
  phone: '0612345678',
  email: 'marie@example.com',
  doctor_id: doctorId,
  diseases: [
    { id: '1', name: 'Hypertension', emoji: '💊' },
    { id: '2', name: 'Diabète', emoji: '💉' },
  ],
});

// 2. Créer un rendez-vous
const appointment = await appointmentService.create({
  patient_id: patient.id,
  patient_name: patient.name,
  doctor_id: doctorId,
  date: '2024-06-20',
  time: '10:00',
  duration: 30,
  type: 'consultation',
  status: 'scheduled',
  created_by: userId,
});

// 3. Créer une notification
await notificationService.create({
  user_id: doctorId,
  type: 'appointment',
  title: 'Nouveau rendez-vous',
  message: `Rendez-vous avec ${patient.name} le 20/06/2024 à 10h00`,
  read: false,
});
```

### Compléter un rendez-vous avec consultation et revenu

```typescript
// 1. Marquer le rendez-vous comme complété
await appointmentService.markAsCompleted(appointmentId);

// 2. Créer la consultation
const consultation = await consultationService.create({
  patient_id: patientId,
  patient_name: 'Marie Dupont',
  doctor_id: doctorId,
  date: '2024-06-20',
  time: '10:00',
  symptoms: 'Fatigue, maux de tête',
  diagnosis: 'Migraine',
  prescription: 'Ibuprofène 400mg x3/jour',
  notes: 'Revoir dans 2 semaines',
});

// 3. Enregistrer le revenu
await revenueService.create({
  doctor_id: doctorId,
  amount: 60.00,
  date: '2024-06-20',
  type: 'consultation',
  description: 'Consultation générale',
  patient_id: patientId,
  patient_name: 'Marie Dupont',
});
```

---

## ⚠️ Gestion des Erreurs

Tous les services lancent des exceptions en cas d'erreur. Utilisez try/catch :

```typescript
try {
  const patient = await patientService.create({ ... });
  console.log('✅ Patient créé:', patient);
} catch (error: any) {
  console.error('❌ Erreur:', error.message);
  // Afficher un message à l'utilisateur
}
```

---

## 🔄 Temps Réel

Pour les mises à jour en temps réel (chat, notifications), utilisez les subscriptions :

```typescript
// Chat en temps réel
const chatSub = chatService.subscribeToMessages(userId, (newMessage) => {
  console.log('💬 Nouveau message:', newMessage);
  // Mettre à jour l'UI
});

// N'oubliez pas de se désabonner au démontage du composant
useEffect(() => {
  return () => {
    chatSub.unsubscribe();
  };
}, []);
```

---

## 🎨 Types TypeScript

Tous les types sont disponibles depuis `database.types.ts` :

```typescript
import type { Database } from './lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
// etc...
```

---

## ✅ Checklist Migration

- [x] Authentication complète (login, register, logout, session)
- [x] Profiles (CRUD + statistiques)
- [x] Patients (CRUD + recherche + statistiques)
- [x] Rendez-vous (CRUD + conflits + statistiques)
- [x] Consultations (CRUD + statistiques)
- [x] Chat (CRUD + temps réel)
- [x] Orientations (CRUD)
- [x] Notifications (CRUD + compteurs)
- [x] Revenus (CRUD + statistiques + périodes)

**Plus aucune donnée en localStorage ! Tout est géré par Supabase** ✨
