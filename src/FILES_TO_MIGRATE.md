# 📝 Fichiers à Migrer vers Supabase

Liste complète de tous les fichiers qui utilisent encore localStorage et doivent être migrés vers Supabase.

---

## 🔴 Priorité HAUTE (Fonctionnalités Core)

### 1. Doctor Components (5 fichiers)

#### `/components/doctor/CalendarView.tsx`
- **localStorage utilisé** : `appointments_${doctorId}`
- **Hook à utiliser** : `useAppointments(doctorId)`
- **Temps estimé** : 20 min
- **Impact** : Agenda des rendez-vous

#### `/components/doctor/PatientsView.tsx`
- **localStorage utilisé** : Probablement `patients_${doctorId}`
- **Hook à utiliser** : `usePatients(doctorId)`
- **Temps estimé** : 20 min
- **Impact** : Gestion des patients (non visible dans la recherche, à vérifier)

#### `/components/doctor/ConsultationsView.tsx`
- **localStorage utilisé** : Probablement `consultations_${doctorId}`
- **Hook à utiliser** : `useConsultations(doctorId)`
- **Temps estimé** : 20 min
- **Impact** : Gestion des consultations (non visible dans la recherche, à vérifier)

#### `/components/doctor/RevenueView.tsx`
- **localStorage utilisé** : `appointments_${doctorId}` (pour calculer les revenus)
- **Hook à utiliser** : `useRevenues(doctorId)`
- **Temps estimé** : 15 min
- **Impact** : Suivi des revenus

#### `/components/doctor/AIAssistant.tsx`
- **localStorage utilisé** : `ai-chat-${doctorId}`
- **Action** : Peut rester en localStorage (historique local seulement)
- **Temps estimé** : 0 min (optionnel)
- **Impact** : Assistant IA (historique local OK)

---

### 2. Secretary Components (3 fichiers)

#### `/components/secretary/SecretaryAgendaView.tsx`
- **localStorage utilisé** : `appointments_secretary_${doctorId}`
- **Hook à utiliser** : `useAppointments(doctorId)`
- **Temps estimé** : 20 min
- **Impact** : Agenda secrétaire

#### `/components/secretary/SecretaryAgendaView_NEW.tsx`
- **localStorage utilisé** : `appointments_secretary_${doctorId}`
- **Hook à utiliser** : `useAppointments(doctorId)`
- **Temps estimé** : 20 min
- **Impact** : Agenda secrétaire (nouvelle version)

#### `/components/secretary/SecretaryProfileView.tsx`
- **localStorage utilisé** : `demo_users`
- **Hook à utiliser** : `profileService.update()`
- **Temps estimé** : 10 min
- **Impact** : Profil secrétaire

---

### 3. Admin Components (1 fichier)

#### `/components/admin/AdminRevenueView.tsx`
- **localStorage utilisé** : `demo_users`, `payments_${doctor.id}`
- **Hook à utiliser** : `useRevenues()` + `useProfiles()`
- **Temps estimé** : 15 min
- **Impact** : Revenus globaux (admin)

---

## 🟡 Priorité MOYENNE (Modals & Details)

### 4. Modals (2 fichiers)

#### `/components/modals/ProfileModal.tsx`
- **localStorage utilisé** : `demo_users`
- **Hook à utiliser** : `profileService.update()`
- **Temps estimé** : 10 min
- **Impact** : Modification profil utilisateur

#### `/components/modals/MedecinDetailsModal.tsx`
- **localStorage utilisé** : `demo_users`, `payments_${medecin.id}`
- **Hook à utiliser** : `profileService.update()` + `revenueService.getAll()`
- **Temps estimé** : 15 min
- **Impact** : Détails médecin (admin)

---

## 🟢 Priorité BASSE (Chat - Peut utiliser chatService)

### 5. Chat Components (4 fichiers)

#### `/components/chat/AdminChat.tsx`
- **localStorage utilisé** : `demo_users`, `messages_${userId}_${otherId}`
- **Hook à utiliser** : `useChat(userId, otherUserId)`
- **Temps estimé** : 25 min
- **Impact** : Chat admin ↔ médecins
- **Note** : Temps réel disponible

#### `/components/chat/DoctorAdminChat.tsx`
- **localStorage utilisé** : `demo_users`, `messages_${userId}_${adminId}`
- **Hook à utiliser** : `useChat(userId, adminId)`
- **Temps estimé** : 25 min
- **Impact** : Chat médecin ↔ admin
- **Note** : Temps réel disponible

#### `/components/chat/DoctorSecretaryChat.tsx`
- **localStorage utilisé** : `demo_users`, `messages_${userId}_${otherId}`
- **Hook à utiliser** : `useChat(userId, otherUserId)`
- **Temps estimé** : 25 min
- **Impact** : Chat médecin ↔ secrétaire
- **Note** : Temps réel disponible

#### `/components/doctor/PatientReferralChat.tsx`
- **localStorage utilisé** : `referral_chat_${patientId}_${doctorId}`, `chat_notifications`
- **Action** : Utiliser `chatService` ou `referralService`
- **Temps estimé** : 30 min
- **Impact** : Chat orientation patient
- **Note** : Fonctionnalité spécifique, peut nécessiter une table dédiée

---

## 📊 Résumé

| Catégorie | Fichiers | Temps Estimé | Priorité |
|-----------|----------|--------------|----------|
| Doctor Components | 5 | 75 min | 🔴 HAUTE |
| Secretary Components | 3 | 50 min | 🔴 HAUTE |
| Admin Components | 1 | 15 min | 🔴 HAUTE |
| Modals | 2 | 25 min | 🟡 MOYENNE |
| Chat Components | 4 | 105 min | 🟢 BASSE |
| **TOTAL** | **15** | **~270 min (4h30)** | - |

---

## 🎯 Plan de Migration Recommandé

### Phase 1 : Core Fonctionnalités (2h)
**Objectif** : Fonctionnalités principales opérationnelles

1. ✅ CalendarView.tsx (20 min)
2. ✅ PatientsView.tsx (20 min)
3. ✅ ConsultationsView.tsx (20 min)
4. ✅ RevenueView.tsx (15 min)
5. ✅ AdminRevenueView.tsx (15 min)
6. ✅ SecretaryAgendaView.tsx (20 min)
7. ✅ SecretaryProfileView.tsx (10 min)

**Résultat** : Application fonctionnelle pour médecins, secrétaires et admin

---

### Phase 2 : Modals & Details (30 min)
**Objectif** : Détails et modifications de profils

1. ✅ ProfileModal.tsx (10 min)
2. ✅ MedecinDetailsModal.tsx (15 min)

**Résultat** : Gestion complète des profils

---

### Phase 3 : Chat (2h - Optionnel)
**Objectif** : Communication temps réel

1. ✅ AdminChat.tsx (25 min)
2. ✅ DoctorAdminChat.tsx (25 min)
3. ✅ DoctorSecretaryChat.tsx (25 min)
4. ✅ PatientReferralChat.tsx (30 min)

**Résultat** : Chat complet avec temps réel

---

## 💡 Guide de Migration par Fichier

### Template de Migration

Pour chaque fichier, suivre ces étapes :

```typescript
// ============================================
// ÉTAPE 1 : Importer le hook
// ============================================
import { usePatients } from '../../hooks/useSupabase';

// ============================================
// ÉTAPE 2 : Remplacer useState + useEffect
// ============================================
// ❌ SUPPRIMER
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const key = `data_${doctorId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    setData(JSON.parse(stored));
  }
  setLoading(false);
}, [doctorId]);

// ✅ REMPLACER PAR
const { data, loading, createData, updateData, deleteData } = usePatients(doctorId);

// ============================================
// ÉTAPE 3 : Remplacer les opérations CRUD
// ============================================
// ❌ SUPPRIMER
const handleCreate = (newItem) => {
  const updated = [...data, newItem];
  setData(updated);
  localStorage.setItem(`data_${doctorId}`, JSON.stringify(updated));
};

// ✅ REMPLACER PAR
const handleCreate = async (newItemData) => {
  try {
    await createData(newItemData);
    // Le hook met à jour automatiquement le state
    alert('✅ Créé avec succès !');
  } catch (error: any) {
    alert('❌ Erreur: ' + error.message);
  }
};

// ============================================
// ÉTAPE 4 : Gérer le loading
// ============================================
if (loading) {
  return <div>Chargement...</div>;
}

// ============================================
// ÉTAPE 5 : Tester
// ============================================
// 1. Créer une donnée
// 2. Rafraîchir la page (F5)
// 3. Vérifier que la donnée persiste
// 4. Vérifier dans Supabase → Table Editor
```

---

## 🔍 Commandes Utiles

### Trouver les fichiers à migrer
```bash
grep -r "localStorage" components/ --include="*.tsx" -l
```

### Vérifier qu'un fichier utilise localStorage
```bash
grep "localStorage" components/doctor/CalendarView.tsx
```

### Compter le nombre de fichiers restants
```bash
grep -r "localStorage" components/ --include="*.tsx" -l | wc -l
```

---

## ✅ Checklist de Validation

Après chaque migration :

- [ ] Le fichier n'utilise plus localStorage
- [ ] Les données se chargent au montage du composant
- [ ] La création fonctionne
- [ ] La modification fonctionne
- [ ] La suppression fonctionne
- [ ] Les données persistent après refresh
- [ ] Aucune erreur dans la console
- [ ] Les données sont visibles dans Supabase

---

## 🎉 Après Migration Complète

Une fois tous les fichiers migrés :

1. **Vérifier** qu'aucun fichier n'utilise localStorage
   ```bash
   grep -r "localStorage" components/ --include="*.tsx"
   # Devrait retourner 0 résultat
   ```

2. **Nettoyer** le code
   - Supprimer les imports inutiles
   - Supprimer les fonctions obsolètes
   - Formater le code

3. **Tester** l'application complète
   - Tester tous les workflows
   - Tester avec plusieurs utilisateurs
   - Vérifier RLS (isolation des données)

4. **Déployer** en production
   ```bash
   npm run build
   vercel --prod
   ```

---

**Temps total estimé** : 4h30 (ou 2h pour Phase 1 uniquement)

**Prochaine étape** : Commencer par CalendarView.tsx ! 🚀
