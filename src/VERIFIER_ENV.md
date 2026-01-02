# 🔑 Vérifier votre fichier `.env`

## 🎯 Objectif

S'assurer que votre fichier `.env` est **correct** et que les **clés Supabase** sont bien chargées.

---

## ✅ ÉTAPE 1 : Vérifier que le fichier `.env` existe

### **Fichier** : `.env` (à la **racine** du projet, au même niveau que `package.json`)

**Contenu attendu** :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

## 🚨 ERREURS FRÉQUENTES

### ❌ **Erreur 1 : Le fichier n'existe pas**

**Symptôme** : La console affiche :
```
❌ MANQUANTE
```

**Solution** :
1. Créez un fichier nommé **exactement** `.env` (avec le point au début)
2. Placez-le à la racine du projet
3. Ajoutez vos clés Supabase

---

### ❌ **Erreur 2 : Le fichier s'appelle `env` au lieu de `.env`**

**Symptôme** : Le fichier existe mais les variables ne sont pas chargées

**Solution** :
1. Renommez `env` → `.env` (avec le point au début)
2. Redémarrez le serveur

---

### ❌ **Erreur 3 : Les valeurs par défaut ne sont pas remplacées**

**Symptôme** : La console affiche :
```
❌ NON
```

**Solution** :
1. Ouvrez `.env`
2. Remplacez `https://votre-projet-id.supabase.co` par votre **vraie URL**
3. Remplacez `votre-cle-anon-ici` par votre **vraie clé**

---

### ❌ **Erreur 4 : Espaces ou guillemets**

**Mauvais** :
```env
VITE_SUPABASE_URL = "https://..."
VITE_SUPABASE_ANON_KEY = "eyJ..."
```

**Bon** :
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

➡️ **Pas d'espaces** autour du `=`
➡️ **Pas de guillemets** autour des valeurs

---

### ❌ **Erreur 5 : Fichier `.env.local` au lieu de `.env`**

Vite lit **`.env`** par défaut, pas `.env.local` (sauf si configuré).

**Solution** :
- Renommez `.env.local` → `.env`
- **OU** créez un `.env` avec les mêmes valeurs

---

### ❌ **Erreur 6 : Le serveur n'a pas été redémarré**

Après avoir modifié `.env`, vous **DEVEZ** redémarrer le serveur.

**Solution** :
```bash
Ctrl + C    # Arrêter le serveur
npm run dev # Relancer
```

---

## 🧪 ÉTAPE 2 : Tester dans la console

### **Test 1 : Variables chargées ?**

Ouvrez la console (F12) et tapez :

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Résultat attendu** :
```
URL: https://votre-projet-id.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si `undefined`** :
- Le fichier `.env` n'est pas trouvé
- Le serveur n'a pas été redémarré
- Les noms de variables sont incorrects

---

### **Test 2 : Connexion à Supabase**

Tapez dans la console :

```javascript
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/')
  .then(r => r.ok ? console.log('✅ Supabase accessible') : console.log('❌ Erreur HTTP:', r.status))
  .catch(e => console.log('❌ Pas de connexion:', e.message));
```

**Résultat attendu** :
```
✅ Supabase accessible
```

**Si erreur** :
- `❌ Erreur HTTP: 401` → Clé API incorrecte
- `❌ Erreur HTTP: 404` → URL incorrecte
- `❌ Pas de connexion` → Pas d'Internet ou firewall

---

## 📋 ÉTAPE 3 : Récupérer vos VRAIES clés

### **1. Allez sur Supabase**

https://supabase.com → Connectez-vous → Sélectionnez votre projet

---

### **2. Ouvrez les paramètres**

Menu de gauche → **Settings** (⚙️) → **API**

---

### **3. Copiez les valeurs**

Vous verrez deux sections importantes :

#### **Project URL** (URL du projet)
```
https://abcdefghijklmnop.supabase.co
```
➡️ Copiez cette valeur → Mettez-la dans `.env` comme `VITE_SUPABASE_URL`

---

#### **Project API keys** (Clés API)
Vous verrez plusieurs clés :
- `anon` / `public` ← **Utilisez CELLE-CI**
- `service_role` ← **NE PAS UTILISER** (clé secrète)

➡️ Cliquez sur **"Copy"** à côté de `anon public` → Mettez-la dans `.env` comme `VITE_SUPABASE_ANON_KEY`

---

### **4. Mettez à jour `.env`**

Ouvrez le fichier `.env` et remplacez :

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY...
```

---

### **5. Redémarrez le serveur**

**IMPORTANT** : Après avoir modifié `.env`, vous DEVEZ redémarrer :

```bash
Ctrl + C
npm run dev
```

---

## 🎯 ÉTAPE 4 : Vérifier dans la console

Après le redémarrage, vous devriez voir dans la console :

```
🔧 Configuration Supabase:
   URL: https://abcdefghijklmnop.supabase.co
   KEY: ✅ Définie (eyJhbGciOiJIUzI1NiIsI...)
   Configuré: ✅ OUI
```

**Si vous voyez** :
```
   Configuré: ❌ NON
```

➡️ Les valeurs par défaut n'ont pas été remplacées. Vérifiez `.env`.

---

## 🐛 PROBLÈMES FRÉQUENTS

### **"undefined" dans la console**

**Cause** : Les variables ne sont pas chargées

**Solutions** :
1. Vérifiez que le fichier s'appelle **`.env`** (avec le point)
2. Vérifiez qu'il est à la **racine** du projet
3. Vérifiez que les noms commencent par **`VITE_`**
4. **Redémarrez** le serveur

---

### **"placeholder" dans l'URL**

**Cause** : L'URL n'a pas été remplacée

**Solution** :
1. Ouvrez `.env`
2. Remplacez `https://votre-projet-id.supabase.co` par votre URL
3. Redémarrez

---

### **"401 Unauthorized"**

**Cause** : La clé API est incorrecte

**Solutions** :
1. Retournez sur Supabase → Settings → API
2. **Re-copiez** la clé `anon public` (pas `service_role`)
3. Collez-la dans `.env` → `VITE_SUPABASE_ANON_KEY`
4. Redémarrez

---

### **"404 Not Found"**

**Cause** : L'URL du projet est incorrecte

**Solution** :
1. Vérifiez l'URL dans Supabase → Settings → API
2. Copiez-la **exactement** (avec `https://`)
3. Collez-la dans `.env`
4. Redémarrez

---

### **Le projet Supabase est en pause**

**Symptôme** : Timeout ou erreur réseau

**Solution** :
1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. S'il est en pause, cliquez sur **"Restore"** ou **"Unpause"**
4. Attendez 1-2 minutes
5. Réessayez

---

## 📸 EXEMPLE DE FICHIER `.env` CORRECT

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://klmnopqrstuvwxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbW5vcHFyc3R1dnd4eXoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

**Points importants** :
- ✅ Commence par `VITE_`
- ✅ Pas d'espaces autour du `=`
- ✅ Pas de guillemets
- ✅ URL commence par `https://`
- ✅ La clé est très longue (200+ caractères)

---

## 🚀 CHECKLIST FINALE

Avant de continuer, vérifiez :

- [ ] Le fichier **`.env`** existe à la racine
- [ ] Les noms des variables commencent par **`VITE_`**
- [ ] L'URL est **copiée depuis Supabase**
- [ ] La clé est la clé **`anon public`** (pas `service_role`)
- [ ] Il n'y a **pas d'espaces** ni de **guillemets**
- [ ] Le serveur a été **redémarré**
- [ ] La console affiche **`Configuré: ✅ OUI`**

---

## 🎯 PROCHAINE ÉTAPE

Une fois que la configuration est correcte, testez la connexion :

```bash
# Redémarrez le serveur
Ctrl + C
npm run dev

# Ouvrez http://localhost:5173
# Essayez de vous connecter
# Regardez la console (F12)
```

**Si vous voyez encore des erreurs**, consultez `DEBUG_CONNEXION.md`.

---

**Bonne chance ! 🚀**
