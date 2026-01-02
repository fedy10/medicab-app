# 🔍 Diagnostic - Écran de chargement infini

## Problème

L'écran reste blanc avec l'icône de chargement après avoir modifié le fichier `.env`.

## ✅ Corrections appliquées

### 1. Timeout ajouté dans `useAuth` (3 secondes)
- Si Supabase ne répond pas en 3 secondes → affiche la page de login
- Évite le chargement infini

### 2. Gestion d'erreur améliorée
- Tous les appels Supabase sont dans des `try/catch`
- Les erreurs sont loggées dans la console

## 🔍 Comment diagnostiquer

### Étape 1 : Ouvrir la console du navigateur

**Chrome/Firefox/Edge** : Appuyez sur `F12` ou `Ctrl+Shift+I`

### Étape 2 : Regarder les erreurs

Vous devriez voir des messages comme :

#### ✅ Si tout va bien :
```
✅ Migration vers Supabase - localStorage nettoyé
```

#### ❌ Si les clés sont incorrectes :
```
❌ Erreur getSession: Invalid API key
❌ Erreur dans getCurrentSession: ...
```

#### ❌ Si Supabase n'est pas accessible :
```
❌ Failed to fetch
❌ Network error
```

## 🛠️ Solutions selon l'erreur

### Erreur : "Invalid API key"

**Cause** : La clé dans `.env` est incorrecte

**Solution** :
1. Allez sur https://supabase.com → Votre projet
2. Settings → API
3. Copiez **exactement** :
   - Project URL (commence par `https://`)
   - anon/public key (très longue, commence par `eyJ...`)
4. Collez dans `.env`
5. **Redémarrez** : `Ctrl+C` puis `npm run dev`

### Erreur : "Failed to fetch" ou "Network error"

**Cause** : Impossible de se connecter à Supabase

**Solutions** :
1. Vérifiez votre connexion Internet
2. Vérifiez que l'URL Supabase est correcte
3. Vérifiez que votre projet Supabase est bien démarré

### Erreur : "relation 'profiles' does not exist"

**Cause** : Le schema SQL n'a pas été exécuté

**Solution** :
1. Allez sur Supabase → SQL Editor
2. Copiez TOUT le contenu de `supabase/schema.sql`
3. Collez et exécutez (Run)

### Pas d'erreur mais chargement infini

**Cause** : Timeout dépassé (Supabase lent ou inaccessible)

**Solution** :
1. Attendez 3 secondes → La page de login devrait s'afficher
2. Si non, videz le cache : `Ctrl+Shift+Delete` → Vider le cache
3. Rechargez : `Ctrl+R`

## ✅ Checklist de vérification

### Fichier `.env`

```bash
# ❌ INCORRECT (valeurs par défaut)
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ici

# ✅ CORRECT (vraies valeurs)
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Points à vérifier

- [ ] Le fichier `.env` est à la **racine** du projet (pas dans un sous-dossier)
- [ ] Les valeurs commencent bien par `VITE_` (pas `REACT_` ou autre)
- [ ] L'URL commence par `https://`
- [ ] La clé commence par `eyJ`
- [ ] Il n'y a pas d'espaces avant ou après les valeurs
- [ ] Il n'y a pas de guillemets autour des valeurs
- [ ] Le serveur a été redémarré après modification

## 🧪 Test rapide

### Dans la console du navigateur (F12), tapez :

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Résultat attendu :

```
https://votre-projet.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Si vous voyez `undefined` :

Le fichier `.env` n'est pas lu correctement :
1. Vérifiez qu'il s'appelle exactement `.env` (pas `.env.txt`)
2. Vérifiez qu'il est à la racine
3. Redémarrez le serveur

## 📊 Comportement normal

### Avec les bonnes clés :

```
[0.1s] Vérification de session...
[0.5s] Aucune session trouvée
[0.6s] Affichage page de login
```

### Avec de mauvaises clés :

```
[0.1s] Vérification de session...
[1.0s] ❌ Erreur : Invalid API key
[1.1s] Affichage page de login
```

### Si Supabase est lent :

```
[0.1s] Vérification de session...
[3.0s] ⚠️ Timeout lors de la vérification de session
[3.1s] Affichage page de login
```

## 🎯 Prochaine étape

### Si la page de login s'affiche maintenant :

✅ **Problème résolu !**

Créez votre premier utilisateur :
1. Consultez `CONFIGURATION_RAPIDE.md`
2. Section "Créer votre premier utilisateur"

### Si l'écran reste blanc :

1. **Vérifiez la console** (F12)
2. **Copiez l'erreur exacte**
3. **Cherchez dans ce fichier** la solution correspondante

### Si vous ne trouvez pas la solution :

1. Consultez `SUPABASE_FAQ.md`
2. Vérifiez `STATUS.md` pour l'état général

## 💡 Astuce

Gardez la console ouverte (F12) pendant que vous développez.
Cela vous permet de voir immédiatement les erreurs !

---

**Dernière mise à jour** : 31 Décembre 2025
