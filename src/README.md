# 🏥 MEDICAB - Gestion de Cabinet Médical

Application moderne de gestion de cabinet médical multi-utilisateur avec interface 3D interactive, entièrement connectée à Supabase.

## ✨ Fonctionnalités

### 👨‍⚕️ Pour les Médecins
- 📋 Gestion complète des patients
- 📅 Agenda intelligent avec gestion des rendez-vous
- 🩺 Dossiers de consultations détaillés
- 💰 Suivi des revenus avec statistiques 3D
- 📨 Lettres d'orientation
- 💬 Chat privé avec collègues et secrétaires
- 🎤 Reconnaissance vocale pour les notes
- 🌐 Interface multilingue (FR, EN, AR)

### 🔐 Pour l'Administrateur
- 👥 Gestion des médecins (validation, suspension)
- 📊 Vue d'ensemble des activités
- 💬 Communication avec les médecins
- 📈 Statistiques globales

### 📝 Pour les Secrétaires
- 📅 Gestion de l'agenda du médecin assigné
- 👤 Gestion des patients
- 📞 Prise de rendez-vous
- 💬 Communication avec le médecin

## 🚀 Démarrage Rapide

### 1. Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit)

### 2. Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd medicab

# Installer les dépendances
npm install
```

### 3. Configuration Supabase

#### a) Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Attendre la fin de la création (2-3 min)

#### b) Exécuter le Schema SQL

1. Dans Supabase, aller dans **SQL Editor**
2. Copier-coller le schema SQL fourni
3. Exécuter (Run)

#### c) Configurer l'application

```bash
# Copier le template de configuration
cp .env.example .env

# Éditer .env et ajouter vos identifiants Supabase
# (disponibles dans Settings → API)
```

Votre fichier `.env` doit contenir :

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### d) Créer le premier admin

Dans Supabase → Authentication → Users :
1. Créer un utilisateur
2. Dans Table Editor → profiles :
   - Mettre `role = 'admin'`
   - Mettre `status = 'active'`

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Guide de démarrage en 5 minutes
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Checklist complète de configuration
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée de l'application
- **[SERVICES_GUIDE.md](./SERVICES_GUIDE.md)** - Documentation des services Supabase
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Exemples de code pour chaque fonctionnalité

## 🏗️ Stack Technique

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling
- **Motion (Framer Motion)** - Animations
- **Recharts** - Graphiques 3D
- **Lucide React** - Icônes

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL (Base de données)
  - Authentication (JWT)
  - Row Level Security (RLS)
  - Realtime (WebSockets)
  - Storage (Fichiers)

### Fonctionnalités Clés
- ✅ **Authentification sécurisée** avec validation email
- ✅ **Row Level Security** - Chaque utilisateur ne voit que ses données
- ✅ **Temps réel** - Chat et notifications instantanés
- ✅ **Multilingue** - Français, Anglais, Arabe (700+ traductions)
- ✅ **Responsive** - Desktop, tablette, mobile
- ✅ **TypeScript complet** - Type safety à 100%

## 📁 Structure du Projet

```
/
├── lib/
│   ├── supabase.ts              # Configuration Supabase
│   ├── database.types.ts        # Types TypeScript
│   └── services/
│       └── supabaseService.ts   # Tous les services
│
├── hooks/
│   ├── useAuth.ts               # Hook d'authentification
│   └── useSupabase.ts           # Hooks personnalisés
│
├── components/
│   ├── auth/                    # Login, Register
│   ├── dashboards/              # Dashboards par rôle
│   ├── doctor/                  # Vues médecin
│   ├── admin/                   # Vues admin
│   └── ui/                      # Composants réutilisables
│
├── contexts/
│   └── LanguageContext.tsx      # Contexte multilingue
│
└── App.tsx                      # Point d'entrée
```

## 🎯 Services Disponibles

### Authentification
```typescript
import { authService } from './lib/services/supabaseService';

await authService.login(email, password);
await authService.register(userData);
await authService.logout();
```

### Patients
```typescript
import { patientService } from './lib/services/supabaseService';

const patients = await patientService.getByDoctor(doctorId);
const patient = await patientService.create({ name, age, ... });
await patientService.update(id, updates);
```

### Rendez-vous
```typescript
import { appointmentService } from './lib/services/supabaseService';

const appointments = await appointmentService.getByDoctor(doctorId);
const appointment = await appointmentService.create({ ... });
await appointmentService.markAsCompleted(id);
```

### Consultations
```typescript
import { consultationService } from './lib/services/supabaseService';

const consultations = await consultationService.getByDoctor(doctorId);
const consultation = await consultationService.create({ ... });
```

### Revenus
```typescript
import { revenueService } from './lib/services/supabaseService';

const stats = await revenueService.getStats(doctorId);
const dayStats = await revenueService.getByPeriod(doctorId, 'day');
```

**Voir [SERVICES_GUIDE.md](./SERVICES_GUIDE.md) pour la documentation complète.**

## 🪝 Hooks Personnalisés

```typescript
import { usePatients, useAppointments } from './hooks/useSupabase';

function MyComponent() {
  const { patients, loading, createPatient } = usePatients(doctorId);
  const { appointments, markAsCompleted } = useAppointments(doctorId);
  
  // Données automatiquement chargées et synchronisées !
}
```

**Voir [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) pour des exemples complets.**

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS activées :

- **Profiles** : Chaque utilisateur ne voit que son profil et ceux autorisés
- **Patients** : Visibles uniquement par le médecin propriétaire et sa secrétaire
- **Rendez-vous** : Même principe que les patients
- **Consultations** : Médecin uniquement (données sensibles)
- **Revenus** : Médecin uniquement
- **Chat** : Expéditeur et destinataire uniquement

### Authentification

- JWT tokens sécurisés
- Auto-refresh des tokens
- Session persistante
- Validation email (optionnelle)
- Hachage des mots de passe (bcrypt)

## 🌍 Multilingue

L'application supporte 3 langues :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe (RTL supporté)

Plus de 700 traductions intégrées.

## 📱 Responsive Design

L'application s'adapte automatiquement à tous les écrans :
- 💻 Desktop (1920px+)
- 📱 Tablette (768px - 1919px)
- 📱 Mobile (< 768px)

## 🧪 Tests

```bash
# Lancer les tests (à implémenter)
npm test

# Coverage
npm run test:coverage
```

## 🚀 Déploiement

### Recommandé: Vercel

1. Push sur GitHub
2. Importer dans Vercel
3. Ajouter les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Déployer

### Alternatives

- **Netlify** - Configuration similaire à Vercel
- **Cloudflare Pages** - Build Vite supporté
- **Firebase Hosting** - Build puis deploy

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour faciliter la gestion des cabinets médicaux.

## 🆘 Support

Des questions ? Consultez :
1. [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
2. [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Problèmes courants
3. [Documentation Supabase](https://supabase.com/docs)

## 🎉 Remerciements

- **Supabase** - Backend incroyable
- **React** - Framework UI moderne
- **Tailwind CSS** - Styling rapide
- **TypeScript** - Type safety

---

**MEDICAB - La gestion de cabinet médical simplifiée** 🏥✨
