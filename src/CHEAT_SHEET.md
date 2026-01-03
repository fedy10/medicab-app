# ⚡ Cheat Sheet - MEDICAB Supabase

## 🚀 Démarrage Ultra-Rapide

```bash
# 1. Copier la config
cp .env.example .env

# 2. Éditer .env avec vos identifiants Supabase
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 3. Installer et lancer
npm install
npm run dev
```

---

## 📚 Services Disponibles

### Authentication
```typescript
import { authService } from './lib/services/supabaseService';

// Connexion
await authService.login(email, password);

// Inscription
await authService.register({ email, password, name, role, ... });

// Déconnexion
await authService.logout();

// Session
const session = await authService.getCurrentSession();
```

### Patients
```typescript
import { patientService } from './lib/services/supabaseService';

// Récupérer
const patients = await patientService.getByDoctor(doctorId);

// Créer
const patient = await patientService.create({
  name, age, phone, email, doctor_id, diseases: []
});

// Modifier
await patientService.update(id, { age: 36 });

// Supprimer
await patientService.delete(id);
```

### Rendez-vous
```typescript
import { appointmentService } from './lib/services/supabaseService';

// Récupérer
const appointments = await appointmentService.getByDoctor(doctorId);

// Créer
const appointment = await appointmentService.create({
  patient_id, patient_name, doctor_id, date, time,
  duration: 30, type: 'consultation', status: 'scheduled',
  created_by: userId
});

// Marquer complété
await appointmentService.markAsCompleted(id);

// Vérifier conflits
const hasConflict = await appointmentService.checkConflict(
  doctorId, date, time, duration
);
```

### Consultations
```typescript
import { consultationService } from './lib/services/supabaseService';

// Récupérer
const consultations = await consultationService.getByDoctor(doctorId);

// Créer
const consultation = await consultationService.create({
  patient_id, patient_name, doctor_id, date, time,
  symptoms, diagnosis, prescription, notes, files: []
});
```

### Revenus
```typescript
import { revenueService } from './lib/services/supabaseService';

// Statistiques
const stats = await revenueService.getStats(doctorId);
// → { total, count, average, revenues }

// Par période
const dayStats = await revenueService.getByPeriod(doctorId, 'day');
```

---

## 🪝 Hooks Personnalisés

### usePatients
```typescript
import { usePatients } from './hooks/useSupabase';

const { 
  patients,      // Données auto-chargées
  loading,       // État de chargement
  error,         // Erreur éventuelle
  createPatient, // Créer
  updatePatient, // Modifier
  deletePatient, // Supprimer
  refresh        // Recharger
} = usePatients(doctorId);
```

### useAppointments
```typescript
import { useAppointments } from './hooks/useSupabase';

const {
  appointments,
  loading,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  markAsCompleted,
  cancelAppointment
} = useAppointments(doctorId, {
  startDate: '2024-01-01',
  status: 'scheduled'
});
```

### useConsultations
```typescript
import { useConsultations } from './hooks/useSupabase';

const {
  consultations,
  loading,
  createConsultation,
  updateConsultation,
  deleteConsultation
} = useConsultations(doctorId);
```

### useRevenues
```typescript
import { useRevenues } from './hooks/useSupabase';

const {
  revenues,
  stats,        // Auto-calculé
  loading,
  createRevenue,
  updateRevenue,
  deleteRevenue
} = useRevenues(doctorId);
```

### useProfiles (Admin)
```typescript
import { useProfiles } from './hooks/useSupabase';

const {
  profiles,      // Tous les profils
  doctors,       // Tous les médecins
  loading,
  updateProfile,
  updateStatus,
  deleteProfile
} = useProfiles();
```

---

## 🔄 Migration localStorage → Supabase

### Avant
```typescript
const [data, setData] = useState([]);

useEffect(() => {
  const stored = localStorage.getItem('key');
  if (stored) setData(JSON.parse(stored));
}, []);

const handleCreate = (item) => {
  const updated = [...data, item];
  setData(updated);
  localStorage.setItem('key', JSON.stringify(updated));
};
```

### Après
```typescript
import { usePatients } from './hooks/useSupabase';

const { data, loading, createData } = usePatients(doctorId);

const handleCreate = async (itemData) => {
  try {
    await createData(itemData);
    alert('✅ Créé !');
  } catch (error: any) {
    alert('❌ Erreur: ' + error.message);
  }
};
```

---

## 🔍 Debugging

### Console du Navigateur (F12)
```javascript
// Vérifier la session
const session = await authService.getCurrentSession();
console.log(session);

// Vérifier les données
const patients = await patientService.getByDoctor('doctor-uuid');
console.log(patients);

// Nettoyer localStorage (test)
localStorage.clear();
location.reload();
```

### Logs Supabase
```
Supabase Dashboard → Logs → API
→ Voir toutes les requêtes en temps réel
```

---

## 🛠️ Commandes Utiles

```bash
# Démarrer
npm run dev

# Build
npm run build

# Tester le build
npm run preview

# Trouver localStorage
grep -r "localStorage" components/ --include="*.tsx" -l

# Vérifier les erreurs
npx tsc --noEmit

# Déployer
vercel --prod
```

---

## 📊 Tables Supabase

```sql
-- Voir toutes les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Compter les données
SELECT 
  'profiles' as table, COUNT(*) FROM profiles
UNION ALL SELECT 'patients', COUNT(*) FROM patients
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments;

-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## ⚠️ Erreurs Courantes

### "Invalid API key"
✅ Vérifier `.env` (clé anon, pas service_role)

### "Email not confirmed"
✅ Désactiver "Email confirmations" dans Auth Settings

### "Row Level Security policy violation"
✅ Vérifier que `status = 'active'` dans profiles

### "Failed to fetch module"
✅ `rm -rf node_modules .vite && npm install`

---

## ✅ Checklist Rapide

### Configuration
- [ ] Projet Supabase créé
- [ ] Schema SQL exécuté
- [ ] `.env` configuré
- [ ] Admin créé et actif

### Développement
- [ ] `npm run dev` fonctionne
- [ ] Connexion admin OK
- [ ] Dashboard s'affiche

### Migration
- [ ] Fichiers migrés (voir FILES_TO_MIGRATE.md)
- [ ] Plus de localStorage
- [ ] Données persistent après refresh

---

## 🎯 Workflow Typique

```typescript
// 1. Importer le hook
import { usePatients } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';

// 2. Utiliser dans le composant
function MyComponent() {
  const { profile } = useAuth();
  const { patients, loading, createPatient } = usePatients(profile.id);

  // 3. Gérer le loading
  if (loading) return <div>Chargement...</div>;

  // 4. Afficher les données
  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

---

## 📞 Aide Rapide

| Problème | Solution |
|----------|----------|
| Configuration | SETUP_CHECKLIST.md → Dépannage |
| Utiliser un service | SERVICES_GUIDE.md |
| Exemple de code | USAGE_EXAMPLES.md |
| Migrer un fichier | NEXT_STEPS.md |
| Tests | VERIFICATION.md |
| Commandes | COMMANDS.md |

---

## 🚀 Prochaines Étapes

1. **Configurer** Supabase (10 min)
   → START_HERE.md

2. **Migrer** les composants (2-3h)
   → FILES_TO_MIGRATE.md

3. **Tester** (15 min)
   → VERIFICATION.md

4. **Déployer** (10 min)
   → `npm run build && vercel --prod`

---

**Temps total : ~3h pour une migration complète** ⏱️

**Ou 30 min pour l'essentiel** ⚡
