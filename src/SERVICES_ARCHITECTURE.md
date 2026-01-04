# 🎯 Architecture des Services - Documentation

## 📁 Structure Organisée par Entité

L'application utilise désormais une **architecture modulaire** où chaque entité métier possède son propre service.

```
/lib/services/
├── index.ts                    # Point d'entrée central (exports)
├── authService.ts             # 🔐 Authentification
├── profileService.ts          # 👤 Profils utilisateurs
├── patientService.ts          # 🏥 Gestion patients
├── appointmentService.ts      # 📅 Rendez-vous
├── consultationService.ts     # 📋 Consultations médicales
├── chatService.ts             # 💬 Messagerie
├── referralService.ts         # 📨 Lettres d'orientation
├── notificationService.ts     # 🔔 Notifications
└── revenueService.ts          # 💰 Revenus & statistiques
```

---

## 🚀 Utilisation

### Import Simplifié

```typescript
// ✅ NOUVEAU - Import depuis le point d'entrée central
import { 
  authService, 
  patientService, 
  appointmentService 
} from './lib/services';

// ❌ ANCIEN - Ne plus utiliser
import { authService } from './lib/services/supabaseService';
```

### Import Sélectif

```typescript
// Import d'un seul service
import { patientService } from './lib/services';

// Import de plusieurs services
import { 
  consultationService, 
  referralService 
} from './lib/services';
```

### Import des Types

```typescript
// Import des types TypeScript
import type { 
  Patient, 
  Appointment, 
  Consultation 
} from './lib/services';
```

---

## 📚 Services Disponibles

### 1. **authService** 🔐 - Authentification

Gère l'authentification des utilisateurs.

```typescript
// Connexion
const result = await authService.login(email, password);

// Inscription
const result = await authService.register(email, password, userData);

// Déconnexion
await authService.logout();

// Session actuelle
const { user } = await authService.getCurrentUser();
```

---

### 2. **profileService** 👤 - Profils

Gère les profils (médecins, secrétaires, admin).

```typescript
// Récupérer tous les profils
const profiles = await profileService.getAll();

// Récupérer un profil
const profile = await profileService.getById(id);

// Récupérer les médecins actifs
const doctors = await profileService.getActiveDoctors();

// Mettre à jour un profil
await profileService.update(id, { name: 'Nouveau nom' });

// Changer le statut (admin uniquement)
await profileService.updateStatus(id, 'active' | 'suspended');
```

---

### 3. **patientService** 🏥 - Patients

Gère les patients d'un médecin.

```typescript
// Récupérer tous les patients d'un médecin
const patients = await patientService.getByDoctor(doctorId);

// Récupérer un patient par téléphone
const patient = await patientService.getByPhone(phone, doctorId);

// Créer un patient
const newPatient = await patientService.create({
  name: 'Mohamed Ali',
  phone: '+216 98 123 456',
  doctor_id: doctorId,
  // ...
});

// Mettre à jour un patient
await patientService.update(patientId, { address: 'Nouvelle adresse' });

// Rechercher des patients
const results = await patientService.search(doctorId, 'Mohamed');

// Statistiques
const stats = await patientService.getStats(doctorId);
// { total: 150, withDiseases: 45 }
```

---

### 4. **appointmentService** 📅 - Rendez-vous

Gère les rendez-vous médicaux.

```typescript
// Récupérer les rendez-vous d'un médecin
const appointments = await appointmentService.getByDoctor(doctorId, {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  status: 'scheduled'
});

// Récupérer les rendez-vous d'un patient
const patientAppointments = await appointmentService.getByPatient(patientId);

// Créer un rendez-vous
const newAppointment = await appointmentService.create({
  patient_id: patientId,
  doctor_id: doctorId,
  date: '2026-01-15',
  time: '14:30',
  duration: 30,
  status: 'scheduled'
});

// Marquer comme complété
await appointmentService.markAsCompleted(appointmentId);

// Annuler un rendez-vous
await appointmentService.cancel(appointmentId);

// Vérifier les conflits d'horaire
const hasConflict = await appointmentService.checkConflict(
  doctorId, 
  '2026-01-15', 
  '14:30', 
  30
);

// Statistiques
const stats = await appointmentService.getStats(doctorId);
// { total: 250, scheduled: 50, completed: 180, cancelled: 20 }
```

---

### 5. **consultationService** 📋 - Consultations

Gère les consultations médicales.

```typescript
// Récupérer les consultations d'un médecin
const consultations = await consultationService.getByDoctor(doctorId, {
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

// Récupérer les consultations d'un patient
const patientConsultations = await consultationService.getByPatient(patientId);

// Récupérer consultation par appointment_id
const consultation = await consultationService.getByAppointmentId(appointmentId);

// Créer une consultation
const newConsultation = await consultationService.create({
  patient_id: patientId,
  doctor_id: doctorId,
  appointment_id: appointmentId,
  date: '2026-01-15',
  time: '14:30',
  diagnosis: 'Grippe saisonnière',
  prescription: 'Paracétamol 500mg...',
  // ...
});

// Mettre à jour une consultation
await consultationService.update(consultationId, {
  prescription: 'Prescription mise à jour...',
  notes: 'Notes additionnelles'
});

// Statistiques
const stats = await consultationService.getStats(doctorId);
// { total: 180, consultations: [...] }
```

---

### 6. **chatService** 💬 - Messagerie

Gère la messagerie instantanée entre utilisateurs.

```typescript
// Récupérer les conversations d'un utilisateur
const conversations = await chatService.getConversations(userId);

// Récupérer les messages entre deux utilisateurs
const messages = await chatService.getMessages(userId, otherUserId);

// Envoyer un message
const newMessage = await chatService.sendMessage({
  sender_id: userId,
  recipient_id: otherUserId,
  content: 'Bonjour docteur !',
  context: 'private'
});

// Marquer les messages comme lus
await chatService.markAsRead(userId, otherUserId);

// Modifier un message
await chatService.editMessage(messageId, 'Message modifié');

// Supprimer un message
await chatService.deleteMessage(messageId);

// Compter les messages non lus
const unreadCount = await chatService.countUnread(userId);

// S'abonner aux nouveaux messages (temps réel)
const subscription = chatService.subscribeToMessages(userId, (message) => {
  console.log('Nouveau message:', message);
});
```

---

### 7. **referralService** 📨 - Lettres d'Orientation

Gère les lettres d'orientation entre médecins.

```typescript
// Récupérer toutes les orientations d'un médecin
const referrals = await referralService.getAll(doctorId);

// Récupérer les orientations envoyées
const sent = await referralService.getSentByDoctor(doctorId);

// Récupérer les orientations reçues
const received = await referralService.getReceivedByDoctor(doctorId);

// Récupérer les orientations d'un patient
const patientReferrals = await referralService.getByPatient(patientId);

// Créer une orientation
const newReferral = await referralService.create({
  from_doctor_id: doctorId,
  to_doctor_id: specialistId,
  patient_id: patientId,
  patient_name: 'Mohamed Ali',
  specialty: 'Cardiologue',
  type: 'digital',
  content: 'Patient présentant...',
  status: 'sent'
});

// Marquer comme vue
await referralService.markAsViewed(referralId, doctorId);

// Ajouter une réponse
await referralService.addResponse(referralId, 'Réponse du spécialiste...');

// Envoyer un message dans le chat de l'orientation
await referralService.sendReferralMessage(
  referralId,
  senderId,
  senderName,
  recipientId,
  'Message concernant le patient...'
);

// Récupérer les messages d'une orientation
const messages = await referralService.getReferralMessages(referralId);

// Statistiques
const stats = await referralService.getStats(doctorId);
// { total_sent: 45, total_received: 23, ... }

// Compter les messages non lus
const unreadCount = await referralService.countUnreadMessages(doctorId);
```

---

### 8. **notificationService** 🔔 - Notifications

Gère les notifications système.

```typescript
// Récupérer les notifications d'un utilisateur
const notifications = await notificationService.getByUser(userId);

// Créer une notification
const newNotification = await notificationService.create({
  user_id: userId,
  type: 'appointment',
  title: 'Nouveau rendez-vous',
  message: 'Vous avez un rendez-vous à 14h30',
  read: false
});

// Marquer comme lue
await notificationService.markAsRead(notificationId);

// Marquer toutes comme lues
await notificationService.markAllAsRead(userId);

// Supprimer une notification
await notificationService.delete(notificationId);

// Compter les notifications non lues
const unreadCount = await notificationService.countUnread(userId);
```

---

### 9. **revenueService** 💰 - Revenus

Gère les revenus et statistiques financières.

```typescript
// Récupérer tous les revenus d'un médecin
const revenues = await revenueService.getAll(doctorId);

// Créer un revenu
const newRevenue = await revenueService.create({
  doctor_id: doctorId,
  amount: 50.00,
  source: 'consultation',
  date: '2026-01-15',
  payment_type: 'normal'
});

// Mettre à jour un revenu
await revenueService.update(revenueId, { amount: 60.00 });

// Supprimer un revenu
await revenueService.delete(revenueId);

// Statistiques
const stats = await revenueService.getStats(doctorId, '2026-01-01', '2026-01-31');
// { total: 5000, count: 100, average: 50, revenues: [...] }

// Revenus par période
const monthStats = await revenueService.getByPeriod(doctorId, 'month');
const weekStats = await revenueService.getByPeriod(doctorId, 'week');
```

---

## 🔧 Avantages de la Nouvelle Architecture

### ✅ Maintenabilité
- Chaque service = 1 fichier ≈ 100-250 lignes
- Facile à comprendre et modifier
- Responsabilités claires

### ✅ Testabilité
- Services isolés et testables indépendamment
- Pas de dépendances circulaires
- Mock facile pour les tests

### ✅ Réutilisabilité
- Import seulement des services nécessaires
- Pas de code inutile chargé
- Performance optimale

### ✅ Évolutivité
- Ajout de nouveaux services sans impact
- Modification d'un service = 1 fichier
- Collaboration facilitée

---

## 📊 Comparaison Avant/Après

### ❌ Avant (1 fichier monolithique)

```typescript
// supabaseService.ts - 1254 lignes 😱
export const authService = { ... };
export const profileService = { ... };
export const patientService = { ... };
// ... 9 services dans 1 fichier
```

**Problèmes** :
- Fichier énorme et difficile à naviguer
- Modifications risquées (conflits Git)
- Chargement de tout même si besoin d'1 service
- Difficile à maintenir

### ✅ Maintenant (9 fichiers modulaires)

```typescript
// 9 fichiers séparés
authService.ts          // 223 lignes
profileService.ts       // 106 lignes
patientService.ts       // 114 lignes
appointmentService.ts   // 175 lignes
consultationService.ts  // 131 lignes
chatService.ts          // 118 lignes
referralService.ts      // 241 lignes
notificationService.ts  //  87 lignes
revenueService.ts       // 130 lignes
```

**Avantages** :
- Fichiers de taille raisonnable
- Modifications ciblées
- Import à la demande
- Maintenance facilitée

---

## 🎯 Migration Complète

### Fichiers Mis à Jour

✅ `/App.tsx`  
✅ `/components/admin/MedecinsManagement.tsx`  
✅ `/components/doctor/CalendarView.tsx`  
✅ `/components/doctor/ConsultationsViewSupabase.tsx`  
✅ `/components/modals/ProfileModal.tsx`  
✅ `/hooks/useAuth.ts`  
✅ `/hooks/useSupabase.ts`  

### Fichiers Supprimés

🗑️ `/lib/services/supabaseService.ts` (1254 lignes)  
🗑️ Tous les fichiers de documentation (`.md`)  
🗑️ Tous les fichiers SQL de migration  
🗑️ Composants en double et inutilisés  

---

## 📝 Conventions de Code

### Nommage
- Service : `nomService` (camelCase)
- Méthode : `getById`, `create`, `update`, `delete`
- Paramètres : descriptifs (`doctorId`, `patientId`)

### Structure des Méthodes
```typescript
async methodName(params) {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    // ... requête

  if (error) throw error;
  return data || [];
}
```

### Gestion d'Erreurs
- Lever l'erreur (`throw error`)
- Laisser le composant gérer l'erreur
- Logger pour debug

---

## 🚀 Prochaines Étapes

1. ✅ Migration complétée
2. ⏳ Tests unitaires par service
3. ⏳ Documentation API complète
4. ⏳ Optimisations performance

---

**Date de Création** : 2026-01-03  
**Version** : 2.0  
**Statut** : ✅ Production Ready
