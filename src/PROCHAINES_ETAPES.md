# 🎯 Prochaines Étapes - Migration Supabase

## ✅ Ce qui a été fait

1. ✅ Données statiques supprimées de `seedData.ts`
2. ✅ Données par défaut désactivées dans `dataStore.ts`
3. ✅ `App.tsx` modifié pour utiliser Supabase (hook `useAuth`)
4. ✅ L'application est prête à tester avec Supabase

## 🚀 Ce que VOUS devez faire maintenant

### 1️⃣ Configurer Supabase (si pas encore fait)

#### A. Créer le fichier `.env`
```bash
# À la racine du projet
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ici
```

#### B. Installer les dépendances
```bash
npm install @supabase/supabase-js
```

### 2️⃣ Créer les utilisateurs de test dans Supabase

Vous DEVEZ créer ces 3 utilisateurs dans Supabase Auth :

1. **Admin** : `admin@medicab.tn` / `admin123`
2. **Médecin** : `dr.ben.ali@medicab.tn` / `doctor123`
3. **Secrétaire** : `fatma.sec@medicab.tn` / `secretary123`

#### Comment créer les utilisateurs ?

**Via l'interface Supabase** :

1. Aller sur https://supabase.com → Votre projet
2. Menu **Authentication** → **Users**
3. Cliquer **Add user** → **Create new user**

Pour chaque utilisateur :
- Email : `admin@medicab.tn` (ou autre)
- Password : `admin123` (ou autre)
- ✅ **Cocher "Auto Confirm User"** (important !)
- Cliquer **Create user**

4. **Ensuite**, modifier le profil dans la table `profiles` :

Aller dans **Table Editor** → **profiles** → Trouver la ligne et modifier :

**Pour l'admin** :
```
role = admin
name = Administrateur
status = active
```

**Pour le médecin** :
```
role = doctor
name = Dr. Ahmed Ben Ali
specialty = Médecine générale
status = active
phone = +216 98 765 432
```

**Pour la secrétaire** :
```
role = secretary
name = Fatma Trabelsi
status = active
assigned_doctor_id = [ID du médecin créé ci-dessus]
```

### 3️⃣ Tester la connexion

```bash
npm run dev
```

1. Ouvrir l'application
2. Essayer de se connecter avec : `admin@medicab.tn` / `admin123`
3. Vérifier que vous arrivez sur le dashboard admin ✅

### 4️⃣ Vérifier que tout fonctionne

- [ ] Login fonctionne
- [ ] Dashboard s'affiche
- [ ] Pas d'erreurs dans la console
- [ ] L'utilisateur est bien récupéré de Supabase

## 🔧 Debugging

### Problème : "Invalid API key"

**Solution** :
- Vérifier le fichier `.env`
- Redémarrer le serveur : `npm run dev`

### Problème : "User not found"

**Solution** :
- Vérifier que l'utilisateur existe dans **Authentication** → **Users**
- Vérifier que le profil existe dans **Table Editor** → **profiles**
- Vérifier que le rôle est correct (`admin`, `doctor`, ou `secretary`)

### Problème : "Permission denied"

**Solution** :
- Vérifier que RLS est bien configuré (le script SQL a été exécuté)
- Vérifier que le statut est `active` dans la table `profiles`

### Erreur dans la console

Ouvrir la console navigateur (F12) et regarder les erreurs.

## 📊 État actuel de l'application

### ✅ Fonctionne avec Supabase :
- Authentification (login/logout)
- Session management
- Vérification des rôles

### 🔄 À migrer progressivement :
- [ ] Patients (voir `MIGRATION_GUIDE.md`)
- [ ] Rendez-vous
- [ ] Consultations
- [ ] Chat
- [ ] Revenus
- [ ] Fichiers

**Note** : L'ancien code localStorage est toujours présent dans les composants. Vous devrez les migrer un par un en suivant le `MIGRATION_GUIDE.md`.

## 📚 Documentation

- **README_SUPABASE.md** - Vue d'ensemble
- **SUPABASE_SETUP.md** - Configuration détaillée
- **MIGRATION_GUIDE.md** - Guide de migration
- **SUPABASE_FAQ.md** - Questions fréquentes

## 🎯 Ordre de migration recommandé

1. ✅ **Authentification** (FAIT !)
2. **Patients** - Commencer par ici
3. **Rendez-vous**
4. **Consultations**
5. **Chat**
6. **Revenus**
7. **Fichiers**

## 💡 Conseil

Ne migrez qu'**une fonctionnalité à la fois** et testez après chaque migration.

---

**Bon courage ! 🚀**

Si vous rencontrez un problème, consultez la FAQ ou les guides de documentation.
