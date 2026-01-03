# ✅ Vérification de l'Installation - MEDICAB

## 🔍 Checklist de Vérification

Utilisez ce guide pour vérifier que votre installation est complète et fonctionnelle.

---

## 1️⃣ Vérification des Fichiers

### Fichiers de Configuration

```bash
# Vérifier que ces fichiers existent :
ls -la .env                    # ✅ Doit exister (créé depuis .env.example)
ls -la lib/supabase.ts        # ✅ Doit exister
ls -la lib/database.types.ts  # ✅ Doit exister
```

### Fichiers de Services

```bash
ls -la lib/services/supabaseService.ts  # ✅ Doit contenir ~2000 lignes
ls -la hooks/useAuth.ts                 # ✅ Doit exister
ls -la hooks/useSupabase.ts             # ✅ Doit exister
```

### Documentation

```bash
ls -la README.md              # ✅ Doit exister
ls -la QUICK_START.md         # ✅ Doit exister
ls -la SETUP_CHECKLIST.md     # ✅ Doit exister
ls -la SERVICES_GUIDE.md      # ✅ Doit exister
ls -la USAGE_EXAMPLES.md      # ✅ Doit exister
ls -la ARCHITECTURE.md        # ✅ Doit exister
ls -la FILES_SUMMARY.md       # ✅ Doit exister
```

---

## 2️⃣ Vérification de la Configuration

### Variables d'Environnement

Vérifier que `.env` contient :

```bash
cat .env

# Doit afficher :
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Tests :**
- [ ] La variable `VITE_SUPABASE_URL` commence par `https://` et finit par `.supabase.co`
- [ ] La variable `VITE_SUPABASE_ANON_KEY` commence par `eyJ`
- [ ] Aucune des deux ne contient `VOTRE_`

### Configuration Supabase

Ouvrir la console du navigateur et taper :

```javascript
// Dans la console du navigateur (F12)
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Les deux doivent afficher vos vraies valeurs
// PAS "undefined" ou "VOTRE_..."
```

---

## 3️⃣ Vérification Supabase

### Se Connecter à Supabase

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Vérifier que le projet est actif (statut vert)

### Vérifier les Tables

Dans Supabase → **Table Editor**, vérifier que ces tables existent :

- [ ] `profiles`
- [ ] `patients`
- [ ] `appointments`
- [ ] `consultations`
- [ ] `chat_messages`
- [ ] `referral_letters`
- [ ] `notifications`
- [ ] `revenues`

### Vérifier les Fonctions

Dans Supabase → **Database** → **Functions**, vérifier :

- [ ] `update_updated_at_column()`
- [ ] `get_user_role(user_uuid)`
- [ ] `check_is_admin(user_uuid)`
- [ ] `get_assigned_doctor_id(user_uuid)`
- [ ] `handle_new_user()`

### Vérifier les Triggers

Dans Supabase → **Database** → **Triggers**, vérifier :

- [ ] `tr_upd_profiles`
- [ ] `tr_upd_patients`
- [ ] `tr_upd_appointments`
- [ ] `tr_upd_consultations`
- [ ] `tr_upd_referrals`
- [ ] `on_auth_user_created`

### Vérifier RLS (Row Level Security)

Dans Supabase → **Authentication** → **Policies**, vérifier que toutes les tables ont des policies.

Exécuter ce SQL pour vérifier :

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'patients', 'appointments', 'consultations',
  'chat_messages', 'referral_letters', 'notifications', 'revenues'
);

-- Toutes les lignes doivent avoir rowsecurity = true
```

---

## 4️⃣ Vérification de l'Application

### Démarrer l'Application

```bash
npm run dev
```

**Vérifications :**
- [ ] Le serveur démarre sans erreur
- [ ] L'URL est affichée : `http://localhost:5173`
- [ ] Aucun warning TypeScript rouge

### Console du Navigateur

Ouvrir la console (F12) et vérifier :

```
✅ Migration vers Supabase - localStorage nettoyé
🔄 useAuth: Initialisation...
🔍 getCurrentSession: Début...
```

**Erreurs à NE PAS voir :**
- ❌ `⚠️ Supabase non configuré`
- ❌ `Invalid API key`
- ❌ `Failed to fetch`

### Tester la Connexion

1. Aller sur la page de connexion
2. Entrer les identifiants admin
3. Cliquer sur "Se connecter"

**Console doit afficher :**
```
🔑 Connexion Supabase...
🔍 Récupération du profil...
✅ Connexion réussie !
```

**Dashboard admin doit s'afficher**

---

## 5️⃣ Test des Services (Manuel)

Ouvrir la console du navigateur et tester manuellement :

### Test Profile Service

```javascript
import { profileService } from './lib/services/supabaseService';

// Récupérer tous les profils (si admin)
const profiles = await profileService.getAll();
console.log('Profiles:', profiles);

// Devrait afficher au moins le profil admin
```

### Test Patient Service

```javascript
import { patientService } from './lib/services/supabaseService';

// Récupérer les patients du médecin
const patients = await patientService.getByDoctor('doctor-uuid');
console.log('Patients:', patients);

// Devrait afficher [] si aucun patient, ou la liste
```

### Test Appointment Service

```javascript
import { appointmentService } from './lib/services/supabaseService';

// Récupérer les rendez-vous du médecin
const appointments = await appointmentService.getByDoctor('doctor-uuid');
console.log('Appointments:', appointments);
```

---

## 6️⃣ Test des Hooks (Manuel)

Dans un composant React, tester :

```tsx
import { usePatients } from './hooks/useSupabase';

function TestComponent() {
  const { patients, loading, error } = usePatients(doctorId);
  
  console.log('Hook usePatients:', { patients, loading, error });
  
  // Devrait afficher :
  // loading: true (puis false)
  // error: null
  // patients: []
  
  return <div>Test OK</div>;
}
```

---

## 7️⃣ Test Fonctionnel Complet

### Scénario 1 : Créer un Médecin

1. **En tant qu'admin** :
   - [ ] Aller dans "Gestion des Médecins"
   - [ ] Ou via la page d'inscription
   - [ ] Créer un médecin
   - [ ] Vérifier qu'il apparaît en "En attente"
   - [ ] L'approuver

2. **Vérifier dans Supabase** :
   - [ ] Aller dans Table Editor → profiles
   - [ ] Le médecin existe avec `status = 'active'`

### Scénario 2 : Créer un Patient

1. **En tant que médecin** :
   - [ ] Se connecter
   - [ ] Aller dans "Patients"
   - [ ] Créer un patient
   - [ ] Vérifier qu'il apparaît dans la liste

2. **Vérifier dans Supabase** :
   - [ ] Table Editor → patients
   - [ ] Le patient existe avec le bon `doctor_id`

### Scénario 3 : Créer un Rendez-vous

1. **En tant que médecin** :
   - [ ] Aller dans "Agenda"
   - [ ] Créer un rendez-vous
   - [ ] Vérifier qu'il apparaît dans le calendrier

2. **Vérifier dans Supabase** :
   - [ ] Table Editor → appointments
   - [ ] Le rendez-vous existe

### Scénario 4 : Créer une Consultation

1. **En tant que médecin** :
   - [ ] Marquer le rendez-vous comme "Complété"
   - [ ] Créer une consultation
   - [ ] Vérifier qu'elle apparaît

2. **Vérifier dans Supabase** :
   - [ ] Table Editor → consultations
   - [ ] La consultation existe

### Scénario 5 : Vérifier les Revenus

1. **En tant que médecin** :
   - [ ] Aller dans "Revenus"
   - [ ] Vérifier que le revenu est enregistré
   - [ ] Vérifier les statistiques

2. **Vérifier dans Supabase** :
   - [ ] Table Editor → revenues
   - [ ] Le revenu existe

---

## 8️⃣ Test de Sécurité RLS

### Test 1 : Isolation des Données

1. **Créer 2 médecins** (A et B)
2. **En tant que médecin A** :
   - Créer un patient "Patient A"
3. **En tant que médecin B** :
   - Vérifier que "Patient A" n'apparaît **PAS**
   - ✅ RLS fonctionne !

### Test 2 : Secrétaire

1. **Créer une secrétaire** assignée au médecin A
2. **En tant que secrétaire** :
   - Vérifier qu'elle voit les patients du médecin A
   - Vérifier qu'elle peut créer des rendez-vous
   - Vérifier qu'elle ne peut **PAS** créer de consultations

---

## 9️⃣ Logs et Monitoring

### Logs Supabase

1. Aller dans Supabase → **Logs** → **API**
2. Effectuer une action dans l'app
3. Vérifier que les requêtes apparaissent
4. Vérifier qu'il n'y a pas d'erreur 500

### Logs Console

Ouvrir la console (F12) et vérifier :
- [ ] Pas d'erreur rouge
- [ ] Les logs de succès s'affichent (`✅`, `🔍`, etc.)
- [ ] Pas de warning de sécurité

---

## 🔟 Performance

### Temps de Chargement

Mesurer dans la console :

```javascript
console.time('loadPatients');
const patients = await patientService.getByDoctor(doctorId);
console.timeEnd('loadPatients');

// Devrait être < 500ms en local
// Devrait être < 2000ms en production
```

### Taille Bundle

```bash
npm run build

# Vérifier la taille du bundle
ls -lh dist/assets/*.js

# Le JS principal devrait être < 500KB (gzippé)
```

---

## ✅ Checklist Finale

### Configuration
- [ ] ✅ Fichier `.env` créé et rempli
- [ ] ✅ Supabase URL configurée
- [ ] ✅ Supabase Anon Key configurée
- [ ] ✅ Pas de warning dans la console

### Supabase
- [ ] ✅ Projet créé et actif
- [ ] ✅ 8 tables créées
- [ ] ✅ 5 fonctions créées
- [ ] ✅ 6 triggers créés
- [ ] ✅ RLS activé sur toutes les tables
- [ ] ✅ Policies créées

### Application
- [ ] ✅ Serveur démarre sans erreur
- [ ] ✅ Page de connexion s'affiche
- [ ] ✅ Connexion admin fonctionne
- [ ] ✅ Dashboard s'affiche

### Services
- [ ] ✅ authService fonctionne
- [ ] ✅ profileService fonctionne
- [ ] ✅ patientService fonctionne
- [ ] ✅ appointmentService fonctionne
- [ ] ✅ consultationService fonctionne
- [ ] ✅ revenueService fonctionne

### Hooks
- [ ] ✅ useAuth fonctionne
- [ ] ✅ usePatients fonctionne
- [ ] ✅ useAppointments fonctionne
- [ ] ✅ useConsultations fonctionne
- [ ] ✅ useRevenues fonctionne

### Sécurité
- [ ] ✅ RLS testé et fonctionnel
- [ ] ✅ Isolation des données OK
- [ ] ✅ Permissions secrétaire OK

### Tests Fonctionnels
- [ ] ✅ Création médecin OK
- [ ] ✅ Création patient OK
- [ ] ✅ Création rendez-vous OK
- [ ] ✅ Création consultation OK
- [ ] ✅ Revenus enregistrés OK

---

## 🎉 Résultat

Si toutes les cases sont cochées, **félicitations !** 🎊

Votre application MEDICAB est :
- ✅ Complètement configurée
- ✅ Connectée à Supabase
- ✅ Sécurisée (RLS)
- ✅ Fonctionnelle
- ✅ Prête à être utilisée

**Prochaine étape** : Migrer tous vos composants pour utiliser les hooks !

---

## 🐛 En Cas de Problème

1. **Consulter** [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) section "Dépannage"
2. **Vérifier** les logs Supabase (Dashboard → Logs → API)
3. **Vérifier** la console navigateur (F12)
4. **Tester** manuellement les services dans la console

---

## 📞 Support

Si un test échoue, consultez :
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Problèmes courants
- [Supabase Docs](https://supabase.com/docs) - Documentation officielle
- Logs Supabase - Pour voir les erreurs backend
