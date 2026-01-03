# 📦 Migration des Données Existantes vers Supabase

Si vous aviez des données dans localStorage que vous souhaitez migrer vers Supabase, voici comment faire.

## ⚠️ Important

Cette migration est **optionnelle**. Si vous démarrez de zéro, ignorez ce fichier.

---

## 🔍 Vérifier les Données localStorage

Ouvrez la console de votre navigateur (F12) et exécutez :

```javascript
// Vérifier quelles données existent
Object.keys(localStorage).forEach(key => {
  if (key.includes('medicab') || key.includes('demo')) {
    console.log(key, ':', localStorage.getItem(key));
  }
});
```

---

## 📊 Migration Manuelle

### Étape 1 : Exporter les Données

```javascript
// Dans la console navigateur
const data = {
  users: JSON.parse(localStorage.getItem('demo_users') || '[]'),
  patients: JSON.parse(localStorage.getItem('medicab_patients') || '[]'),
  appointments: JSON.parse(localStorage.getItem('medicab_appointments') || '[]'),
  consultations: JSON.parse(localStorage.getItem('medicab_consultations') || '[]'),
  revenues: JSON.parse(localStorage.getItem('medicab_revenues') || '[]'),
};

// Copier dans le presse-papier
copy(JSON.stringify(data, null, 2));

// Ou télécharger
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'medicab_backup.json';
a.click();
```

### Étape 2 : Créer les Utilisateurs dans Supabase

Pour chaque utilisateur (médecin/secrétaire) de votre backup :

```sql
-- Médecin
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),  -- ou utilisez l'ancien ID si UUID
  'authenticated', 'authenticated',
  'email@example.com',  -- Email de l'utilisateur
  crypt('MotDePasse123!', gen_salt('bf')),  -- Nouveau mot de passe
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Nom Utilisateur","role":"doctor"}',  -- ou "secretary"
  NOW(), NOW()
) RETURNING id;

-- Créer le profil (remplacez par l'UUID retourné)
INSERT INTO public.profiles (
  id, email, name, role, phone, address, specialty, status
) VALUES (
  'uuid-retourné',
  'email@example.com',
  'Nom Utilisateur',
  'doctor',  -- ou 'secretary'
  '+216 12 345 678',
  'Adresse',
  'Spécialité',
  'active'
);
```

### Étape 3 : Migrer les Patients

```sql
-- Pour chaque patient
INSERT INTO public.patients (
  name, age, phone, email, address, diseases, doctor_id
) VALUES (
  'Nom Patient',
  45,
  '+216 12 345 678',
  'patient@email.com',
  'Adresse patient',
  '[]'::jsonb,  -- ou un tableau JSON de maladies
  'uuid-du-medecin'
);
```

### Étape 4 : Migrer les Rendez-vous

```sql
-- Pour chaque rendez-vous
INSERT INTO public.appointments (
  patient_id, patient_name, doctor_id,
  date, time, duration, type, status, notes, created_by
) VALUES (
  'uuid-patient',
  'Nom Patient',
  'uuid-doctor',
  '2024-01-15',
  '14:30:00',
  30,
  'consultation',
  'scheduled',
  'Notes',
  'uuid-created-by'
);
```

### Étape 5 : Migrer les Consultations

```sql
-- Pour chaque consultation
INSERT INTO public.consultations (
  patient_id, patient_name, doctor_id,
  date, time, symptoms, diagnosis, prescription, notes
) VALUES (
  'uuid-patient',
  'Nom Patient',
  'uuid-doctor',
  '2024-01-15',
  '14:30:00',
  'Symptômes',
  'Diagnostic',
  'Prescription',
  'Notes'
);
```

### Étape 6 : Migrer les Revenus

```sql
-- Pour chaque revenu
INSERT INTO public.revenues (
  doctor_id, amount, date, type, description, patient_id, patient_name
) VALUES (
  'uuid-doctor',
  60.00,
  '2024-01-15',
  'consultation',
  'Description',
  'uuid-patient',
  'Nom Patient'
);
```

---

## 🤖 Script de Migration Automatique

Créez un fichier `migrate.js` :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://votre-projet.supabase.co';
const supabaseKey = 'votre-cle-anon';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  // Charger le backup
  const backup = require('./medicab_backup.json');
  
  console.log('🚀 Début de la migration...');
  
  // 1. Créer les profils
  console.log('👤 Migration des profils...');
  const profilesMap = new Map(); // oldId -> newId
  
  for (const user of backup.users) {
    if (user.role === 'admin') continue; // Admin déjà créé
    
    try {
      // Créer l'utilisateur dans auth (vous devrez faire ça manuellement dans Supabase UI)
      // Ensuite récupérer l'ID et créer le profil
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          email: user.email,
          name: user.name,
          role: user.role === 'medecin' ? 'doctor' : 'secretary',
          phone: user.telephone,
          specialty: user.specialite,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      profilesMap.set(user.id, profile.id);
      console.log(`✅ Profil créé: ${user.name}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${user.name}:`, error.message);
    }
  }
  
  // 2. Créer les patients
  console.log('\n🏥 Migration des patients...');
  const patientsMap = new Map(); // oldId -> newId
  
  for (const patient of backup.patients) {
    try {
      const doctorId = profilesMap.get(patient.doctor_id);
      if (!doctorId) {
        console.warn(`⚠️ Médecin non trouvé pour patient ${patient.name}`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: patient.name,
          age: patient.age,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          diseases: patient.diseases || [],
          doctor_id: doctorId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      patientsMap.set(patient.id, data.id);
      console.log(`✅ Patient créé: ${patient.name}`);
    } catch (error) {
      console.error(`❌ Erreur pour patient ${patient.name}:`, error.message);
    }
  }
  
  // 3. Créer les rendez-vous
  console.log('\n📅 Migration des rendez-vous...');
  
  for (const appointment of backup.appointments) {
    try {
      const patientId = patientsMap.get(appointment.patient_id);
      const doctorId = profilesMap.get(appointment.doctor_id);
      
      if (!patientId || !doctorId) {
        console.warn(`⚠️ Références manquantes pour rendez-vous`);
        continue;
      }
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          patient_name: appointment.patient_name,
          doctor_id: doctorId,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration || 30,
          type: appointment.type || 'consultation',
          status: appointment.status || 'scheduled',
          notes: appointment.notes,
          created_by: doctorId,
        });
      
      if (error) throw error;
      
      console.log(`✅ Rendez-vous créé: ${appointment.patient_name} - ${appointment.date}`);
    } catch (error) {
      console.error(`❌ Erreur pour rendez-vous:`, error.message);
    }
  }
  
  // 4. Créer les consultations
  console.log('\n🩺 Migration des consultations...');
  
  for (const consultation of backup.consultations) {
    try {
      const patientId = patientsMap.get(consultation.patient_id);
      const doctorId = profilesMap.get(consultation.doctor_id);
      
      if (!patientId || !doctorId) continue;
      
      const { error } = await supabase
        .from('consultations')
        .insert({
          patient_id: patientId,
          patient_name: consultation.patient_name,
          doctor_id: doctorId,
          date: consultation.date,
          time: consultation.time,
          symptoms: consultation.symptoms,
          diagnosis: consultation.diagnosis,
          prescription: consultation.prescription,
          notes: consultation.notes,
        });
      
      if (error) throw error;
      
      console.log(`✅ Consultation créée: ${consultation.patient_name} - ${consultation.date}`);
    } catch (error) {
      console.error(`❌ Erreur pour consultation:`, error.message);
    }
  }
  
  // 5. Créer les revenus
  console.log('\n💰 Migration des revenus...');
  
  for (const revenue of backup.revenues) {
    try {
      const doctorId = profilesMap.get(revenue.doctor_id);
      const patientId = patientsMap.get(revenue.patient_id);
      
      if (!doctorId) continue;
      
      const { error } = await supabase
        .from('revenues')
        .insert({
          doctor_id: doctorId,
          amount: revenue.amount,
          date: revenue.date,
          type: revenue.type || 'consultation',
          description: revenue.description,
          patient_id: patientId,
          patient_name: revenue.patient_name,
        });
      
      if (error) throw error;
      
      console.log(`✅ Revenu créé: ${revenue.amount}€ - ${revenue.date}`);
    } catch (error) {
      console.error(`❌ Erreur pour revenu:`, error.message);
    }
  }
  
  console.log('\n🎉 Migration terminée !');
}

// Exécuter la migration
migrateData().catch(console.error);
```

Pour l'exécuter :

```bash
node migrate.js
```

---

## 🧹 Nettoyage après Migration

Une fois la migration terminée et vérifiée :

```javascript
// Dans la console navigateur
localStorage.clear();
console.log('✅ localStorage nettoyé');
```

---

## ✅ Vérification Post-Migration

1. **Vérifier dans Supabase Table Editor** que toutes les données sont présentes
2. **Se connecter à l'application** avec vos nouveaux identifiants
3. **Vérifier chaque section** :
   - Patients
   - Rendez-vous
   - Consultations
   - Revenus
   - Chat (vide initialement)

---

## 🆘 En Cas de Problème

### Rollback

```sql
-- Supprimer toutes les données (ATTENTION : irréversible !)
TRUNCATE 
  public.patients,
  public.appointments,
  public.consultations,
  public.revenues,
  public.chat_messages,
  public.notifications,
  public.referral_letters
CASCADE;

-- Supprimer les profils non-admin
DELETE FROM public.profiles WHERE role != 'admin';
```

### Backup Supabase

Avant de commencer la migration, créez un backup :

1. Allez dans **Database** > **Backups** dans Supabase
2. Cliquez sur "Create backup"
3. Attendez la fin du backup

---

## 💡 Conseils

1. **Testez d'abord** avec un petit échantillon de données
2. **Vérifiez les UUIDs** - si vos anciens IDs ne sont pas des UUIDs, laissez Supabase les générer
3. **Mappage des rôles** - Assurez-vous que les rôles sont correctement mappés
4. **Dates** - Vérifiez le format des dates (ISO 8601 : `YYYY-MM-DD`)
5. **Relations** - Vérifiez que tous les foreign keys sont corrects

---

**🎯 Bonne migration !**
