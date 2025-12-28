# MediCab Pro - Gestion Intelligente de Cabinet Médical

Application moderne et immersive pour la gestion complète de cabinets médicaux, avec support multi-utilisateurs et interfaces 3D interactives.

## 🎯 Architecture Multi-Utilisateurs

L'application supporte 3 types d'utilisateurs avec des permissions spécifiques :

### 1. 👨‍💼 Administrateur
- Gestion complète des médecins (création, suspension, validation)
- Tableau de bord financier avec statistiques 3D
- Suivi des paiements et facturation automatique
- Alertes intelligentes pour retards de paiement
- Analyse des revenus par période

### 2. 👨‍⚕️ Médecin
- **Agenda interactif** : Calendrier 3D avec gestion complète des rendez-vous
- **Consultations** : Dossiers patients complets avec historique médical
- **Assistant IA** : Suggestions d'examens, aide au diagnostic, génération d'ordonnances
- **Patients** : Base de données complète avec recherche vocale
- **Revenus** : Statistiques détaillées et prévisions IA
- **Profil** : Gestion des secrétaires et paramètres du cabinet

### 3. 👩‍💼 Secrétaire
- Gestion de l'agenda du médecin
- Confirmation des rendez-vous
- Gestion des patients
- Visualisation des consultations (sans modification)

## 🔐 Comptes de Démonstration

### Administrateur
- **Email**: admin@medicab.tn
- **Mot de passe**: admin123

### Médecin
- **Email**: dr.ben.ali@medicab.tn
- **Mot de passe**: doctor123
- **Code médecin**: DOC-001

### Secrétaire
- **Email**: fatma.sec@medicab.tn
- **Mot de passe**: secretary123
- **Rattachée au**: DOC-001

## ✨ Fonctionnalités Principales

### 📅 Agenda / Calendrier
- Calendrier mensuel interactif avec animations 3D
- Timeline quotidienne avec créneaux horaires
- Ajout/modification/suppression de rendez-vous
- Confirmation en temps réel des présences
- Recherche intelligente de patients
- Distinction consultations / contrôles
- Gestion des modes de paiement (Normal, CNAM, Assurance, Gratuit)

### 🏥 Consultations
- Dossier médical complet automatique
- Historique chronologique 3D
- Maladies chroniques et antécédents
- Imageries (IRM, Scanner, Radio)
- Analyses biologiques
- Lettres médecin → médecin pré-remplies
- **Assistant IA médical intégré** :
  - Propositions d'examens pour nouveaux patients
  - Aide au diagnostic
  - Génération intelligente d'ordonnances
  - Résumé automatique de dossier

### 👥 Patients
- Liste complète avec filtres avancés
- **Recherche vocale** activée
- Recherche par nom, téléphone, adresse
- Cartes patients avec statistiques
- Historique complet des visites

### 💰 Revenus (Médecin uniquement)
- Graphiques 3D animés
- Statistiques par jour/semaine/mois/année
- Répartition par mode de paiement
- Prévisions IA du chiffre d'affaires
- Comparaisons mensuelles
- Objectifs et tendances

### 👤 Profil
**Pour médecins** :
- Modification des informations professionnelles
- Gestion des secrétaires (validation, suspension)
- Réinitialisation des mots de passe
- Partage du code médecin

**Pour secrétaires** :
- Modification des informations personnelles
- Visualisation du code médecin du cabinet

## 🎨 Design & UX

- **Interface moderne et immersive** avec animations fluides
- **Éléments 3D interactifs** utilisant Motion (Framer Motion)
- **Design responsive** adapté mobile et web
- **Animations de transition** entre les pages
- **Effets de hover et de clic** pour meilleure interactivité
- **Gradients colorés** et effets glassmorphism
- **Badges visuels** pour les statuts et états

## 🛠️ Technologies Utilisées

- **React** avec TypeScript
- **Motion (Framer Motion)** pour animations 3D
- **Tailwind CSS** pour le styling
- **Recharts** pour graphiques interactifs
- **Lucide React** pour les icônes
- **Web Speech API** pour recherche vocale

## ⚠️ Important - Données Médicales

**Cette application est un PROTOTYPE de démonstration.**

Pour une utilisation en production avec de vraies données médicales :
- ✅ Conformité RGPD obligatoire
- ✅ Hébergement certifié données de santé
- ✅ Chiffrement end-to-end
- ✅ Audits de sécurité réguliers
- ✅ Certifications médicales requises
- ✅ Backup et disaster recovery

**Ne pas utiliser avec de vraies données patients sans certification appropriée.**

## 🚀 Prochaines Fonctionnalités

- Intégration avec systèmes de paiement en ligne
- Notifications push et SMS pour rappels
- Export PDF des ordonnances et documents
- Synchronisation multi-appareils
- Chat sécurisé médecin-patient
- Téléconsultation intégrée
- Signature électronique des documents
- API pour intégration avec autres systèmes médicaux

## 📱 Utilisation

1. Connectez-vous avec un des comptes de démonstration
2. Explorez les différentes fonctionnalités selon votre rôle
3. Testez l'assistant IA médical dans les consultations
4. Utilisez la recherche vocale dans la section Patients
5. Visualisez les statistiques dans Revenus (médecin) ou Dashboard (admin)

---

**MediCab Pro** - Transformez la gestion de votre cabinet médical 🏥✨
