# 🏥 MEDICAB - Gestion de Cabinet Médical

Application moderne de gestion de cabinet médical multi-utilisateur avec interface 3D interactive, entièrement connectée à Supabase.

## ✨ Fonctionnalités

### 👨‍⚕️ Pour les Médecins
- 📋 Gestion complète des patients
- 📅 Agenda intelligent avec gestion des rendez-vous
- 🩺 Dossiers de consultations détaillés
- 💰 Suivi des revenus avec statistiques 3D
- 📨 Lettres d'orientation (digitales et imprimables)
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

---

## 🚀 Démarrage Rapide

### 1. Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit sur supabase.com)

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

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé API (anon key)

#### b) Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon
```

#### c) Exécuter le schéma SQL

Dans le SQL Editor de Supabase, exécutez le fichier `/supabase/schema.sql`

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

---

## 🏗️ Architecture

### Structure du Projet

```
/
├── /components/          # Composants React
│   ├── /auth/           # Login, Register
│   ├── /admin/          # Dashboard admin
│   ├── /dashboards/     # Dashboards principaux
│   ├── /doctor/         # Composants médecin
│   ├── /secretary/      # Composants secrétaire
│   ├── /chat/           # Messagerie
│   ├── /modals/         # Modals réutilisables
│   └── /ui/             # Composants UI (60+)
│
├── /lib/services/       # ⭐ Services modulaires
│   ├── authService.ts
│   ├── profileService.ts
│   ├── patientService.ts
│   ├── appointmentService.ts
│   ├── consultationService.ts
│   ├── chatService.ts
│   ├── referralService.ts
│   ├── notificationService.ts
│   └── revenueService.ts
│
├── /hooks/              # Hooks React personnalisés
├── /contexts/           # Contextes React
└── /supabase/           # Configuration Supabase
```

### Services (Architecture Modulaire)

L'application utilise une architecture par entité, où chaque service gère une fonctionnalité spécifique.

```typescript
// Import simplifié depuis le point d'entrée central
import { 
  authService, 
  patientService, 
  appointmentService 
} from './lib/services';

// Utilisation
const patients = await patientService.getByDoctor(doctorId);
const appointments = await appointmentService.getByDoctor(doctorId);
```

**📚 Documentation complète** : Voir [SERVICES_ARCHITECTURE.md](./SERVICES_ARCHITECTURE.md)

---

## 🔑 Comptes par Défaut

Pour tester l'application, utilisez ces comptes :

### Admin
- **Email** : admin@medicab.com
- **Mot de passe** : admin123

### Médecin
- **Email** : docteur@medicab.com
- **Mot de passe** : doctor123

### Secrétaire
- **Email** : secretaire@medicab.com
- **Mot de passe** : secretary123

---

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS v4
- **Animations** : Motion (Framer Motion)
- **Backend** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Realtime** : Supabase Realtime
- **Icons** : Lucide React
- **Charts** : Recharts
- **Build** : Vite

---

## 📱 Fonctionnalités Détaillées

### Gestion des Patients
- Création et modification de patients
- Historique complet des consultations
- Maladies chroniques avec catégorisation
- Recherche avancée
- Export de données

### Gestion des Rendez-vous
- Calendrier interactif
- Vérification des conflits d'horaire
- Confirmation avec gestion du paiement
- Notifications automatiques
- Statistiques par période

### Consultations Médicales
- Saisie ordonnances, analyses, imagerie
- Assistant IA pour suggestions
- Impression des documents
- Historique patient complet
- Lettres d'orientation intégrées

### Lettres d'Orientation
- **Mode Digital** : Chat intégré entre médecins
- **Mode Print** : Impression traditionnelle
- Traçabilité complète
- Notifications de réception
- Historique des échanges

### Système de Revenus
- Enregistrement automatique des paiements
- Types de paiement : Normal, CNAM, Assurance, Gratuit
- Statistiques 3D interactives
- Export de rapports
- Vue par période (jour, semaine, mois, année)

### Messagerie
- Chat en temps réel (Supabase Realtime)
- Messages privés entre utilisateurs
- Contexte des lettres d'orientation
- Notifications non lues
- Historique complet

---

## 🌍 Multilingue

L'application supporte 3 langues :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe

Plus de 700 traductions intégrées.

---

## 🔐 Sécurité

### Authentification
- Connexion sécurisée via Supabase Auth
- Vérification d'email obligatoire
- Gestion des sessions
- Déconnexion automatique

### Autorisations
- Row Level Security (RLS) dans Supabase
- Permissions par rôle (admin, doctor, secretary)
- Isolation des données par médecin
- Validation côté serveur

### Données
- Chiffrement en transit (HTTPS)
- Chiffrement au repos (Supabase)
- Backups automatiques
- Conformité RGPD

---

## 📊 Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `profiles` | Utilisateurs (admin, médecins, secrétaires) |
| `patients` | Patients d'un médecin |
| `appointments` | Rendez-vous médicaux |
| `consultations` | Consultations complétées |
| `chat_messages` | Messages entre utilisateurs |
| `referral_letters` | Lettres d'orientation |
| `notifications` | Notifications système |
| `revenues` | Revenus et paiements |

**Schéma complet** : Voir `/supabase/schema.sql`

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans Vercel Dashboard
```

### Variables d'Environnement (Production)

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique
```

---

## 🧪 Tests

```bash
# Lancer l'application en mode dev
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

---

## 📚 Documentation Complémentaire

- **[SERVICES_ARCHITECTURE.md](./SERVICES_ARCHITECTURE.md)** - Architecture détaillée des services
- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Résumé du nettoyage et réorganisation
- **[/supabase/schema.sql](./supabase/schema.sql)** - Schéma de base de données

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 💡 Support

Pour toute question ou problème :

1. Consultez la [documentation des services](./SERVICES_ARCHITECTURE.md)
2. Vérifiez les [issues GitHub](https://github.com/votre-repo/issues)
3. Créez une nouvelle issue si nécessaire

---

## 🎉 Crédits

Développé avec ❤️ pour améliorer la gestion des cabinets médicaux.

**Technologies utilisées** :
- React, TypeScript, Tailwind CSS
- Supabase (Backend as a Service)
- Motion (Animations)
- Recharts (Graphiques)
- Lucide React (Icons)

---

**Version** : 2.0  
**Dernière mise à jour** : 2026-01-03  
**Statut** : ✅ Production Ready
