# 🎮 Commandes Utiles - MEDICAB

Guide de toutes les commandes utiles pour développer, tester et déployer MEDICAB.

---

## 📦 Installation et Démarrage

### Première Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd medicab

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env

# Éditer .env avec vos identifiants Supabase
nano .env  # ou code .env (VSCode)

# Lancer le serveur de développement
npm run dev
```

### Démarrage Quotidien

```bash
# Lancer le serveur de développement
npm run dev

# Le serveur sera accessible sur http://localhost:5173
```

---

## 🏗️ Build et Production

### Build pour Production

```bash
# Créer un build optimisé
npm run build

# Le build sera dans le dossier /dist
ls -la dist/

# Tester le build en local
npm run preview
```

### Analyser la Taille du Bundle

```bash
# Build avec analyse
npm run build

# Voir la taille des fichiers
ls -lh dist/assets/

# Le fichier JS principal devrait être < 500KB (gzippé)
```

---

## 🧹 Nettoyage

### Nettoyer les Dépendances

```bash
# Supprimer node_modules
rm -rf node_modules

# Supprimer le cache
rm -rf .vite

# Réinstaller
npm install
```

### Nettoyer le Build

```bash
# Supprimer le dossier dist
rm -rf dist

# Rebuild
npm run build
```

---

## 🧪 Tests (À Implémenter)

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests e2e
npm run test:e2e
```

---

## 📝 Développement

### Vérifier le Code

```bash
# Linter TypeScript
npm run lint

# Formatter avec Prettier (si configuré)
npm run format

# Type checking
npx tsc --noEmit
```

### Commandes Git

```bash
# État des fichiers
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: ajout de la fonctionnalité X"

# Push
git push origin main

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Merger une branche
git checkout main
git merge feature/nouvelle-fonctionnalite
```

---

## 🗄️ Supabase (via CLI - Optionnel)

### Installation Supabase CLI

```bash
# Installation globale
npm install -g supabase

# Vérifier l'installation
supabase --version
```

### Initialiser Supabase

```bash
# Se connecter
supabase login

# Lier le projet local
supabase link --project-ref <votre-project-ref>

# Générer les types TypeScript
supabase gen types typescript --linked > lib/database.types.ts
```

### Migrations

```bash
# Créer une migration
supabase migration new nom_de_la_migration

# Appliquer les migrations
supabase db push

# Reset la base de données
supabase db reset
```

---

## 🔍 Debugging

### Logs en Temps Réel

```bash
# Lancer avec verbose
npm run dev -- --debug

# Ou avec le CLI Supabase
supabase functions serve --debug
```

### Inspecter le Code

```bash
# Ouvrir dans VSCode
code .

# Rechercher dans tous les fichiers
grep -r "searchterm" .

# Trouver les fichiers TypeScript
find . -name "*.tsx" -o -name "*.ts"
```

---

## 📊 Monitoring et Performance

### Analyser les Performances

Ouvrir la console du navigateur (F12) :

```javascript
// Mesurer le temps de chargement
console.time('loadData');
const data = await service.getData();
console.timeEnd('loadData');

// Mesurer la mémoire
console.memory;

// Profiler React
// React DevTools → Profiler → Record
```

### Logs Supabase

```bash
# Via le dashboard
# 1. Aller sur supabase.com/dashboard
# 2. Sélectionner votre projet
# 3. Logs → API

# Ou via CLI
supabase logs
```

---

## 🚀 Déploiement

### Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod

# Configurer les variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Déployer sur Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser
netlify init

# Déployer
netlify deploy

# Déployer en production
netlify deploy --prod

# Configurer les variables d'environnement
netlify env:set VITE_SUPABASE_URL "https://..."
netlify env:set VITE_SUPABASE_ANON_KEY "eyJ..."
```

### Déployer Manuellement

```bash
# 1. Build
npm run build

# 2. Upload le dossier /dist sur votre serveur
scp -r dist/* user@server:/var/www/medicab/

# 3. Configurer nginx ou Apache
# Exemple nginx:
server {
    listen 80;
    server_name medicab.example.com;
    root /var/www/medicab;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔧 Utilitaires

### Générer des UUIDs

```bash
# En ligne de commande (Linux/Mac)
uuidgen

# Ou dans la console JavaScript
crypto.randomUUID()
```

### Formater du JSON

```bash
# Pretty print JSON
echo '{"key":"value"}' | jq '.'

# Ou dans la console JavaScript
JSON.stringify(obj, null, 2)
```

### Compresser/Décompresser

```bash
# Créer une archive
tar -czf medicab-backup.tar.gz .

# Extraire une archive
tar -xzf medicab-backup.tar.gz
```

---

## 📱 Mobile (React Native - Futur)

### Initialiser React Native

```bash
# Créer un nouveau projet
npx react-native init MedicabMobile

# Copier la logique métier
cp -r lib/ ../MedicabMobile/src/lib/
cp -r hooks/ ../MedicabMobile/src/hooks/

# Installer les dépendances
cd MedicabMobile
npm install @supabase/supabase-js
```

---

## 🔐 Sécurité

### Vérifier les Dépendances

```bash
# Audit de sécurité
npm audit

# Corriger automatiquement
npm audit fix

# Vérifier les vulnérabilités
npm audit --production
```

### Variables d'Environnement

```bash
# JAMAIS commit .env
# Vérifier .gitignore
cat .gitignore | grep .env

# Devrait afficher : .env

# Lister toutes les variables
cat .env

# Copier pour un environnement de test
cp .env .env.test
```

---

## 📚 Documentation

### Générer la Documentation

```bash
# TypeDoc (si configuré)
npm run docs

# Ouvrir la doc
open docs/index.html
```

### Mettre à Jour les Types

```bash
# Régénérer depuis Supabase
supabase gen types typescript --linked > lib/database.types.ts

# Ou copier depuis l'API Docs
# Supabase Dashboard → API Docs → TypeScript
```

---

## 🎨 Styles

### Tailwind

```bash
# Rebuild Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Voir les classes utilisées
grep -r "className=" components/
```

---

## 🧰 Outils de Développement

### VSCode Extensions Recommandées

```bash
# Installer depuis la ligne de commande
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension supabase.supabase-vscode
```

### React DevTools

```bash
# Installer React DevTools (Extension navigateur)
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org
```

---

## 📊 Base de Données

### Backup Supabase

```bash
# Via CLI
supabase db dump -f backup.sql

# Restaurer
supabase db reset
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

### Migrations SQL

```bash
# Créer une nouvelle migration
supabase migration new add_new_field

# Éditer la migration
nano supabase/migrations/20240101000000_add_new_field.sql

# Appliquer
supabase db push
```

---

## 🔄 CI/CD (GitHub Actions - Exemple)

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🎯 Commandes Rapides (Cheat Sheet)

```bash
# Démarrer
npm run dev

# Build
npm run build

# Test
npm test

# Déployer
vercel --prod

# Logs Supabase
supabase logs

# Backup DB
supabase db dump -f backup.sql

# Générer types
supabase gen types typescript --linked > lib/database.types.ts

# Clean install
rm -rf node_modules && npm install

# Vérifier sécurité
npm audit

# Git push
git add . && git commit -m "update" && git push
```

---

## 📖 Commandes par Cas d'Usage

### "J'ai modifié le schéma SQL"

```bash
# 1. Exécuter le nouveau SQL dans Supabase
# 2. Régénérer les types
supabase gen types typescript --linked > lib/database.types.ts
# 3. Redémarrer le serveur
npm run dev
```

### "J'ai une erreur TypeScript"

```bash
# Vérifier les erreurs
npx tsc --noEmit

# Nettoyer et réinstaller
rm -rf node_modules .vite
npm install
npm run dev
```

### "L'application ne démarre pas"

```bash
# 1. Vérifier les variables d'env
cat .env

# 2. Nettoyer
rm -rf node_modules .vite dist

# 3. Réinstaller
npm install

# 4. Relancer
npm run dev
```

### "Je veux déployer en production"

```bash
# 1. Vérifier que tout fonctionne
npm run build
npm run preview

# 2. Commit et push
git add .
git commit -m "ready for production"
git push origin main

# 3. Déployer
vercel --prod
# ou
netlify deploy --prod
```

---

## 🎓 Ressources

### Documentation

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)

### Outils en Ligne

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Netlify Dashboard](https://app.netlify.com)

---

**💡 Conseil** : Ajoutez ces commandes à vos favoris ou créez des alias bash pour aller encore plus vite !

```bash
# Ajouter à ~/.bashrc ou ~/.zshrc
alias mdev="cd ~/medicab && npm run dev"
alias mbuild="cd ~/medicab && npm run build"
alias mdeploy="cd ~/medicab && vercel --prod"
```
