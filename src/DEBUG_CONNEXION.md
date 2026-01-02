# 🐛 Guide de débogage - Problème de connexion

## 🎯 Symptôme

La page de login reste bloquée après avoir cliqué sur "Se connecter".

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. **Suppression des anciens fichiers**
- ✅ Supprimé `/components/LoginPage.tsx` (ancien)
- ✅ Supprimé `/components/RegisterPage.tsx` (ancien)
- ✅ Supprimé les comptes de démonstration

### 2. **Ajout de logs de débogage**
Des messages apparaîtront maintenant dans la **console du navigateur** (F12) :

```
🔄 useAuth: Initialisation...
🔐 Tentative de connexion... email@example.com
📊 Résultat login: {...}
✅ Connexion réussie !
```

Ou en cas d'erreur :
```
❌ Erreur de connexion: Email ou mot de passe incorrect
⚠️ Veuillez vérifier votre email...
```

### 3. **Timeout amélioré**
Si Supabase ne répond pas en 3 secondes → Affiche la page de login

---

## 🔍 COMMENT DÉBOGUER

### **Étape 1 : Ouvrir la console**

1. Appuyez sur **F12** (ou clic droit → Inspecter)
2. Allez dans l'onglet **Console**
3. **Gardez-la ouverte** pendant que vous testez

### **Étape 2 : Vider le cache**

```bash
Ctrl + Shift + Delete
→ Cochez "Cookies" et "Cache"
→ Effacer
```

Ou plus simple : **Mode navigation privée** (Ctrl+Shift+N)

### **Étape 3 : Redémarrer le serveur**

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### **Étape 4 : Tester la connexion**

1. Allez sur `http://localhost:5173` (ou le port affiché)
2. Entrez votre email et mot de passe
3. **REGARDEZ LA CONSOLE** pendant que vous cliquez sur "Se connecter"

---

## 📊 MESSAGES DE LA CONSOLE - QUE SIGNIFIENT-ILS ?

### ✅ **Tout va bien**

```
🔄 useAuth: Initialisation...
✅ Session récupérée: Non connecté
🔐 Tentative de connexion... testy0@gmail.com
📊 Résultat login: {success: true, user: {...}, profile: {...}}
✅ Connexion réussie !
```

👉 **La connexion fonctionne** - Vous devriez voir le dashboard

---

### ❌ **Email non confirmé**

```
🔐 Tentative de connexion... testy0@gmail.com
📊 Résultat login: {success: false, error: "Email not confirmed"}
❌ Erreur de connexion: ⚠️ Vous devez vérifier votre email...
```

👉 **Solution** : 
1. Consultez votre boîte mail
2. Cliquez sur le lien de vérification
3. **OU** désactivez la confirmation d'email (voir `DESACTIVER_EMAIL_CONFIRMATION.md`)

---

### ❌ **Mot de passe incorrect**

```
🔐 Tentative de connexion... testy0@gmail.com
📊 Résultat login: {success: false, error: "Invalid login credentials"}
❌ Erreur de connexion: Email ou mot de passe incorrect
```

👉 **Solution** :
- Vérifiez le mot de passe (8 caractères minimum)
- Recréez le compte si nécessaire

---

### ❌ **Profil non trouvé**

```
🔐 Tentative de connexion... testy0@gmail.com
📊 Résultat login: {success: false, error: "Profil non trouvé. Contactez l'administrateur."}
```

👉 **Solution** :
1. Le compte existe dans Auth mais pas dans la table `profiles`
2. Allez sur Supabase → **Table Editor** → `profiles`
3. Vérifiez si votre utilisateur existe
4. Si non, le trigger n'a pas fonctionné → Recréez le compte

---

### ❌ **Compte suspendu**

```
📊 Résultat login: {success: false, error: "Votre compte a été suspendu..."}
```

👉 **Solution** :
1. Allez sur Supabase → `profiles`
2. Trouvez votre utilisateur
3. Changez `status` de `suspended` à `active`
4. Réessayez de vous connecter

---

### ⚠️ **Timeout**

```
🔄 useAuth: Initialisation...
⚠️ Timeout lors de la vérification de session
✅ Session récupérée: Non connecté
```

👉 **Causes possibles** :
1. **Clés Supabase incorrectes** → Vérifiez `.env`
2. **Pas de connexion Internet** → Vérifiez votre réseau
3. **Projet Supabase en pause** → Allez sur supabase.com et réveillez-le

---

### ❌ **Erreur réseau**

```
❌ Erreur lors de la récupération de session: NetworkError...
```

👉 **Causes possibles** :
1. Pas d'Internet
2. URL Supabase incorrecte dans `.env`
3. Firewall bloque Supabase

---

## 🛠️ SOLUTIONS PAR PROBLÈME

### **Problème : La page reste bloquée (spinner infini)**

**Causes** :
- Le `useAuth` attend une réponse qui ne vient jamais
- Le timeout ne se déclenche pas

**Solutions** :
1. **Videz le cache** du navigateur
2. **Redémarrez le serveur** : `Ctrl+C` puis `npm run dev`
3. **Mode navigation privée** pour tester
4. **Vérifiez la console** : Y a-t-il des erreurs ?

---

### **Problème : "Invalid API key"**

**Cause** : Clés Supabase incorrectes dans `.env`

**Solution** :
1. Allez sur https://supabase.com → Settings → API
2. **Recopiez** exactement :
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
3. **Redémarrez** le serveur

---

### **Problème : Port 3000 au lieu de 5173**

**Cause** : Configuration personnalisée ou autre serveur

**Solutions** :
1. Vérifiez quel port est affiché quand vous faites `npm run dev`
2. Utilisez CE port dans Supabase :
   - Settings → Authentication → **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : `http://localhost:3000/**`

---

### **Problème : Le bouton de langue au milieu du formulaire**

**Cause** : Anciens fichiers en cache

**Solution** :
✅ **DÉJÀ CORRIGÉ** - J'ai supprimé les anciens fichiers
1. **Videz le cache** : Ctrl+Shift+Delete
2. **Rechargez** : Ctrl+R
3. Le bouton devrait maintenant être **en haut à droite**

---

### **Problème : Les comptes de démonstration s'affichent toujours**

**Cause** : Cache navigateur

**Solution** :
✅ **DÉJÀ CORRIGÉ** - J'ai supprimé l'affichage
1. **Videz le cache**
2. **Rechargez**
3. Les comptes de démo ne devraient plus apparaître

---

## 🧪 TESTS RECOMMANDÉS

### **Test 1 : Vérifier que Supabase est accessible**

Ouvrez la console (F12) et tapez :

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Résultat attendu** :
```
https://votre-projet.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si `undefined`** → Le fichier `.env` n'est pas lu → Redémarrez le serveur

---

### **Test 2 : Vérifier la connexion Supabase**

Tapez dans la console :

```javascript
fetch('https://votre-projet.supabase.co/rest/v1/')
  .then(r => r.ok ? console.log('✅ Supabase accessible') : console.log('❌ Erreur'))
  .catch(() => console.log('❌ Pas de connexion'));
```

**Résultat** : `✅ Supabase accessible`

---

### **Test 3 : Connexion manuelle**

Tapez dans la console :

```javascript
// Remplacez par VOS valeurs
const email = "testy0@gmail.com";
const password = "votreMotDePasse";

fetch('https://votre-projet.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'votre-cle-anon',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
})
.then(r => r.json())
.then(console.log);
```

**Résultat attendu** : Un objet avec `access_token`, `user`, etc.

**Si erreur** : Lisez le message d'erreur

---

## 📋 CHECKLIST DE VÉRIFICATION

Avant de continuer, vérifiez :

- [ ] **Console ouverte** (F12)
- [ ] **Cache vidé** (Ctrl+Shift+Delete)
- [ ] **Serveur redémarré** (`npm run dev`)
- [ ] **Fichier `.env` correct** (URL et Key valides)
- [ ] **Email confirmé** OU confirmation désactivée dans Supabase
- [ ] **Schema SQL exécuté** dans Supabase
- [ ] **Compte créé** dans Supabase avec un vrai email
- [ ] **Mot de passe** : 8+ caractères avec majuscules/chiffres

---

## 🎯 PROCHAINES ÉTAPES

### **Si ça marche maintenant** : ✅

Félicitations ! Continuez avec `CONFIGURATION_RAPIDE.md`

### **Si ça ne marche toujours pas** : ❌

1. **Copiez TOUTE la console** (Ctrl+A dans la console, puis Ctrl+C)
2. **Créez un nouveau compte** dans Supabase Dashboard :
   - SQL Editor → Tapez :
   ```sql
   SELECT * FROM auth.users;
   SELECT * FROM profiles;
   ```
3. **Partagez** les erreurs de console et les résultats SQL

---

## 💡 ASTUCES

### **Navigation privée**

Testez toujours en **mode navigation privée** pour éviter les problèmes de cache :
- Chrome : `Ctrl + Shift + N`
- Firefox : `Ctrl + Shift + P`

### **Console toujours ouverte**

Gardez la console ouverte (F12) pendant le développement.
C'est votre **meilleur ami** pour déboguer !

### **Logs personnalisés**

Les emojis dans les logs vous aident à identifier rapidement :
- 🔄 = En cours
- ✅ = Succès
- ❌ = Erreur
- ⚠️ = Attention
- 🔐 = Authentification
- 📊 = Données

---

**Bonne chance ! 🚀**
