# ✅ Vérification du fichier .env

## 🎯 Objectif

Vérifier que votre fichier `.env` est correctement configuré.

---

## 📍 Localisation du fichier

Le fichier `.env` doit être à la **racine du projet** :

```
votre-projet/
├── .env           ← ICI !
├── .env.example
├── App.tsx
├── package.json
└── ...
```

**PAS dans** :
- ❌ `/src/.env`
- ❌ `/components/.env`
- ❌ `/lib/.env`

---

## 📝 Format correct

### ✅ CORRECT

```bash
VITE_SUPABASE_URL=https://xyzabc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyM2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.abcdefghijklmnopqrstuvwxyz123456
```

### ❌ INCORRECT

```bash
# ❌ Guillemets
VITE_SUPABASE_URL="https://xyzabc123def.supabase.co"

# ❌ Espaces
VITE_SUPABASE_URL = https://xyzabc123def.supabase.co

# ❌ Valeurs par défaut
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ici

# ❌ Mauvais préfixe
REACT_APP_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
```

---

## 🔍 Vérifications

### 1️⃣ Vérifier que le fichier existe

**Windows** :
```bash
dir .env
```

**Mac/Linux** :
```bash
ls -la .env
```

**Résultat attendu** :
```
.env
```

Si "fichier introuvable" → Créez le fichier

### 2️⃣ Vérifier le contenu

**Ouvrir le fichier** dans un éditeur de texte (VS Code, Notepad++, etc.)

**Vérifier** :
- [ ] Pas de guillemets `"` ou `'`
- [ ] Pas d'espaces autour du `=`
- [ ] L'URL commence par `https://`
- [ ] La clé commence par `eyJ`
- [ ] Les valeurs ne sont PAS les valeurs par défaut

### 3️⃣ Vérifier dans le navigateur

1. Démarrez l'application : `npm run dev`
2. Ouvrez le navigateur
3. Ouvrez la console (F12)
4. Tapez :

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Résultat attendu** :
```
URL: https://xyzabc123def.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si `undefined`** :
- Le fichier `.env` n'est pas lu
- Vérifiez l'emplacement
- Redémarrez le serveur

---

## 🔑 Obtenir les bonnes valeurs

### Étape 1 : Aller sur Supabase

1. Allez sur https://supabase.com
2. Connectez-vous
3. Sélectionnez votre projet (ou créez-en un)

### Étape 2 : Accéder aux paramètres API

1. Dans le menu de gauche, cliquez **Settings** (⚙️ en bas)
2. Cliquez **API**

### Étape 3 : Copier les valeurs

Vous verrez deux sections importantes :

#### 📍 Project URL

```
Configuration
Project URL
https://xyzabc123def.supabase.co
```

👉 **Copiez cette URL complète**

#### 🔑 API Keys

```
Project API keys
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

👉 **Cliquez sur l'icône "copier"** à droite de la clé

⚠️ **Copiez la clé `anon/public`**, PAS la clé `service_role` !

### Étape 4 : Coller dans .env

```bash
VITE_SUPABASE_URL=https://xyzabc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Attention** :
- Pas de guillemets
- Pas d'espaces
- Collez TOUTE la clé (elle est très longue, c'est normal)

### Étape 5 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## 🧪 Test complet

### Script de test

Créez un fichier `test-env.js` à la racine :

```javascript
// test-env.js
console.log('\n=== VÉRIFICATION DU FICHIER .env ===\n');

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('1. Fichier .env lu par Vite');
console.log('   URL:', url ? '✅' : '❌');
console.log('   Key:', key ? '✅' : '❌');

if (!url || !key) {
  console.log('\n❌ Fichier .env manquant ou mal lu');
  console.log('   → Vérifiez que .env est à la racine');
  console.log('   → Redémarrez le serveur\n');
  process.exit(1);
}

console.log('\n2. Format des valeurs');
console.log('   URL commence par https://?', url.startsWith('https://') ? '✅' : '❌');
console.log('   Key commence par eyJ?', key.startsWith('eyJ') ? '✅' : '❌');

if (!url.startsWith('https://') || !key.startsWith('eyJ')) {
  console.log('\n❌ Format incorrect');
  console.log('   → Vérifiez les valeurs copiées depuis Supabase\n');
  process.exit(1);
}

console.log('\n3. Valeurs par défaut?');
const isDefault = url.includes('votre-projet-id') || key.includes('votre-cle');
console.log('   Valeurs personnalisées?', !isDefault ? '✅' : '❌');

if (isDefault) {
  console.log('\n❌ Vous utilisez encore les valeurs par défaut');
  console.log('   → Remplacez par vos vraies valeurs Supabase\n');
  process.exit(1);
}

console.log('\n✅ Fichier .env correctement configuré !\n');
```

### Exécuter le test

```bash
node test-env.js
```

**Si tout est OK** : vous verrez des ✅

**Si problème** : suivez les instructions affichées

---

## 🐛 Problèmes courants

### Le fichier .env n'est pas lu

**Solutions** :
1. Vérifiez qu'il s'appelle exactement `.env` (pas `.env.txt`)
2. Vérifiez qu'il est à la racine du projet
3. Redémarrez **complètement** le serveur (Ctrl+C puis npm run dev)
4. Videz le cache : Suppr fichiers `.vite` si présent

### Les valeurs sont `undefined` dans le navigateur

**Solutions** :
1. Les variables doivent commencer par `VITE_` (obligatoire)
2. Redémarrez le serveur après modification
3. Rechargez la page (Ctrl+R)

### "Invalid API key" dans la console

**Solutions** :
1. Vérifiez que vous avez copié la BONNE clé (anon/public)
2. Vérifiez que la clé est complète (très longue)
3. Vérifiez qu'il n'y a pas de retour à la ligne au milieu

### Le projet Supabase n'existe pas

**Solutions** :
1. Créez un projet sur https://supabase.com
2. Attendez 1-2 minutes que le projet soit créé
3. Puis récupérez les identifiants

---

## ✅ Checklist finale

Avant de continuer, vérifiez :

- [ ] Fichier `.env` existe à la racine
- [ ] Contient `VITE_SUPABASE_URL=...`
- [ ] Contient `VITE_SUPABASE_ANON_KEY=...`
- [ ] Pas de guillemets
- [ ] Pas d'espaces
- [ ] URL commence par `https://`
- [ ] Key commence par `eyJ`
- [ ] Ce ne sont PAS les valeurs par défaut
- [ ] Serveur redémarré
- [ ] Console navigateur affiche les bonnes valeurs

**Tout coché ?** ✅ Vous êtes prêt !

---

## 🎯 Prochaine étape

Maintenant que votre `.env` est correct :

1. **Exécutez le schema SQL** dans Supabase
2. **Créez votre premier utilisateur**
3. **Testez la connexion**

👉 Voir `CONFIGURATION_RAPIDE.md`

---

**Besoin d'aide ?** Consultez `DIAGNOSTIC.md` pour le dépannage.
