# 🏥 MEDICAB - Application de Gestion de Cabinet Médical

Application moderne de gestion de cabinet médical multi-utilisateur avec interfaces 3D interactives et base de données cloud Supabase.

## 🚀 Démarrage Rapide

### ⚡ Configuration en 5 minutes

**L'application nécessite une configuration Supabase avant de démarrer.**

👉 **Suivez le guide** : [CONFIGURATION_RAPIDE.md](./CONFIGURATION_RAPIDE.md)

### 📋 Étapes résumées :

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)
2. **Configurer le fichier `.env`** avec vos identifiants
3. **Exécuter le schema SQL** dans Supabase SQL Editor
4. **Redémarrer l'application** : `npm run dev`

## ✨ Fonctionnalités

### 👨‍⚕️ Pour les Médecins
- 📅 Gestion des rendez-vous avec agenda visuel
- 👥 Gestion complète des patients avec dossiers médicaux
- 📝 Consultations avec assistant IA
- 🎤 Reconnaissance vocale pour les notes médicales
- 💰 Suivi des revenus avec graphiques 3D
- 📧 Système de référencement entre médecins
- 💬 Chat privé avec l'administrateur et les secrétaires

### 👨‍💼 Pour l'Administrateur
- 👨‍⚕️ Gestion des médecins (validation, suspension)
- 📊 Tableau de bord statistiques global
- 💵 Vue d'ensemble des revenus de tous les médecins
- 👥 Gestion des utilisateurs
- 💬 Chat avec tous les médecins

### 👩‍💼 Pour les Secrétaires
- 📅 Gestion de l'agenda du médecin assigné
- 👥 Gestion des patients
- 📞 Prise de rendez-vous
- 💬 Chat avec le médecin

### 🌍 Système Multilingue
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe
- Plus de 700 traductions

## 🛠️ Technologies

- **Frontend** : React + TypeScript + Vite
- **UI** : Tailwind CSS + Motion (Framer Motion)
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **3D/Animations** : Motion/React
- **Charts** : Recharts
- **État** : React Context + Hooks

## 📦 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Supabase (voir CONFIGURATION_RAPIDE.md)
# - Créer un projet sur supabase.com
# - Modifier le fichier .env
# - Exécuter supabase/schema.sql

# 3. Démarrer l'application
npm run dev
```

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| **[CONFIGURATION_RAPIDE.md](./CONFIGURATION_RAPIDE.md)** | ⚡ Guide de démarrage 5 minutes |
| **[PROCHAINES_ETAPES.md](./PROCHAINES_ETAPES.md)** | 📋 Instructions détaillées |
| **[README_SUPABASE.md](./README_SUPABASE.md)** | 📖 Vue d'ensemble Supabase |
| **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** | 🔧 Configuration avancée |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | 🔄 Guide de migration |
| **[SUPABASE_FAQ.md](./SUPABASE_FAQ.md)** | ❓ Questions fréquentes |
| **[ERREURS_CORRIGEES.md](./ERREURS_CORRIGEES.md)** | 🐛 Résolution de problèmes |

## 🎯 Architecture

```
/
├── components/          # Composants React
│   ├── auth/           # Authentification (Login/Register)
│   ├── dashboards/     # Dashboards (Admin/Médecin/Secrétaire)
│   ├── doctor/         # Composants médecin
│   ├── secretary/      # Composants secrétaire
│   ├── admin/          # Composants admin
│   └── ui/             # Composants UI réutilisables
├── lib/                # Services et configuration
│   ├── supabase.ts     # Client Supabase
│   ├── database.types.ts # Types TypeScript
│   └── services/       # Services Supabase
├── hooks/              # React Hooks personnalisés
├── contexts/           # React Contexts
├── utils/              # Utilitaires
├── supabase/           # Configuration Supabase
│   └── schema.sql      # Schéma de base de données
└── styles/             # Styles globaux
```

## 🗄️ Base de données (Supabase)

### Tables principales :

- **profiles** - Utilisateurs (admin, médecins, secrétaires)
- **patients** - Dossiers patients
- **appointments** - Rendez-vous
- **consultations** - Consultations médicales
- **revenues** - Revenus et paiements
- **chat_messages** - Messages privés
- **referral_letters** - Lettres de référencement
- **notifications** - Notifications
- **medical_files** - Fichiers médicaux

Voir `supabase/schema.sql` pour le schéma complet.

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Authentification Supabase Auth
- ✅ Validation des rôles (admin, doctor, secretary)
- ✅ Tokens JWT sécurisés
- ✅ Variables d'environnement (.env non commité)

## 🚀 Déploiement

### Variables d'environnement requises :

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### Hébergement recommandé :

- **Frontend** : Vercel, Netlify, ou Cloudflare Pages
- **Base de données** : Supabase (déjà configuré)

```bash
# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🧪 Comptes de test

Après avoir exécuté le schema SQL et créé les utilisateurs, vous pouvez tester avec :

- **Admin** : `admin@medicab.tn` / `admin123`
- **Médecin** : `dr.ben.ali@medicab.tn` / `doctor123`
- **Secrétaire** : `fatma.sec@medicab.tn` / `secretary123`

> **Note** : Vous devez créer ces utilisateurs dans Supabase. Voir [CONFIGURATION_RAPIDE.md](./CONFIGURATION_RAPIDE.md)

## 🤝 Contribution

Ce projet est une application complète de gestion de cabinet médical. Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 🆘 Support

### Problèmes courants :

#### ❌ "Variables Supabase manquantes"
➡️ Voir [CONFIGURATION_RAPIDE.md](./CONFIGURATION_RAPIDE.md)

#### ❌ "Invalid API key"
➡️ Vérifiez votre fichier `.env` et redémarrez le serveur

#### ❌ "Permission denied"
➡️ Vérifiez que le schema SQL a été exécuté correctement

### Documentation :

Consultez les fichiers de documentation dans le dossier racine pour plus d'informations.

## ✨ Auteurs

Développé avec ❤️ pour les professionnels de santé

---

**Version** : 2.0.0 (Supabase Edition)  
**Dernière mise à jour** : Décembre 2025

**🎉 Prêt à démarrer ? → [CONFIGURATION_RAPIDE.md](./CONFIGURATION_RAPIDE.md)**
