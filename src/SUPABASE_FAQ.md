# ❓ FAQ - Questions Fréquentes sur Supabase

## 🎯 Questions Générales

### Qu'est-ce que Supabase ?

Supabase est une alternative open-source à Firebase. C'est une plateforme qui vous fournit :
- Une base de données PostgreSQL
- Une authentification complète
- Un système de storage pour les fichiers
- Des API REST automatiques
- Du temps réel (websockets)

### Pourquoi migrer de localStorage vers Supabase ?

| localStorage | Supabase |
|--------------|----------|
| ❌ Local uniquement | ✅ Cloud + sync multi-devices |
| ❌ ~5 MB max | ✅ Illimité |
| ❌ Pas de sécurité | ✅ RLS + Authentification |
| ❌ Pas de backup | ✅ Backups automatiques |
| ❌ 1 utilisateur | ✅ Multi-utilisateurs |
| ❌ Fichiers en base64 | ✅ Storage dédié |

### Supabase est-il gratuit ?

Oui ! Le plan gratuit inclut :
- ✅ 500 MB de base de données
- ✅ 1 GB de storage
- ✅ 2 GB de bande passante
- ✅ 50 000 utilisateurs actifs mensuels
- ✅ Real-time illimité

**Largement suffisant pour démarrer !** 🚀

### Dois-je payer pour une application médicale ?

Pour une application en production avec des **données médicales réelles**, il est recommandé de :
1. Passer au plan **Pro** (~25$/mois)
2. Activer les backups quotidiens
3. Configurer la conformité HIPAA/RGPD si nécessaire

⚠️ **Important** : Figma Make n'est pas conçu pour des données sensibles en production.

---

## 🔧 Configuration

### Comment obtenir les clés API Supabase ?

1. Aller sur https://supabase.com
2. Créer un projet
3. Aller dans **Settings** → **API**
4. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Où mettre les clés API ?

Dans un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...votre-cle-ici
```

⚠️ **Ne jamais committer le fichier `.env` dans Git !**

### Comment vérifier que ma configuration fonctionne ?

3 méthodes :

**1. Panneau visuel** (recommandé) :
```typescript
import { SupabaseStatusPanel } from './components/admin/SupabaseStatusPanel';
// Ajouter dans votre dashboard
<SupabaseStatusPanel />
```

**2. Script de vérification** :
```typescript
import { checkSupabaseConnection } from './utils/supabase/checkConnection';
checkSupabaseConnection();
```

**3. Test manuel** :
Ouvrir la console et essayer de se connecter avec `admin@medicab.tn` / `admin123`

---

## 🗄️ Base de Données

### Comment créer les tables ?

1. Ouvrir Supabase Dashboard
2. Menu latéral → **SQL Editor**
3. Copier le contenu de `/supabase/schema.sql`
4. Coller et cliquer sur **Run** (Ctrl/Cmd + Enter)

### Les tables sont-elles créées automatiquement ?

❌ Non, vous devez exécuter le script SQL manuellement.

### J'ai une erreur "relation does not exist"

Cela signifie que les tables n'ont pas été créées. Exécutez le script SQL.

### Comment voir mes données ?

Supabase Dashboard → **Table Editor** → Sélectionner une table

### Comment supprimer toutes les données ?

**Option 1 : Supprimer les lignes**
```sql
DELETE FROM table_name;
```

**Option 2 : Réinitialiser complètement**
Supprimer le projet Supabase et en créer un nouveau.

---

## 👥 Utilisateurs

### Comment créer les utilisateurs de test ?

**Via l'interface** :
1. Supabase → **Authentication** → **Users**
2. Cliquer **Add user**
3. Remplir email/password
4. ✅ Cocher "Auto Confirm User"
5. Cliquer "Create user"

**Via SQL** (après avoir créé via Auth) :
```sql
UPDATE profiles 
SET role = 'admin', name = 'Administrateur'
WHERE email = 'admin@medicab.tn';
```

### Pourquoi mes utilisateurs n'ont pas de profil ?

Le profil est créé automatiquement grâce à un trigger :

```sql
-- Ce trigger est déjà dans schema.sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

Si le profil n'est pas créé, vérifiez que le trigger existe.

### Comment réinitialiser le mot de passe d'un utilisateur ?

**Via l'interface** :
1. Authentication → Users
2. Cliquer sur l'utilisateur
3. **Reset Password**

**Via code** :
```typescript
await supabase.auth.resetPasswordForEmail('email@example.com');
```

### Comment supprimer un utilisateur ?

1. Authentication → Users → Cliquer sur l'utilisateur → **Delete user**
2. Le profil dans la table `profiles` sera supprimé automatiquement (CASCADE)

---

## 🔐 Sécurité (RLS)

### Qu'est-ce que Row Level Security (RLS) ?

RLS permet de contrôler qui peut voir/modifier quelles lignes dans une table.

Exemple : Un médecin ne voit que **ses** patients.

### Comment vérifier que RLS fonctionne ?

1. Se connecter avec un médecin
2. Créer un patient
3. Se déconnecter
4. Se connecter avec un autre médecin
5. Vérifier qu'il ne voit **pas** le patient du premier médecin

### J'ai "Row Level Security policy violation"

Cela signifie que vous essayez d'accéder à des données que vous n'avez pas le droit de voir.

**Causes communes** :
- L'utilisateur n'existe pas dans `profiles`
- Le rôle est incorrect
- Les policies RLS ne sont pas créées

**Solution** :
```sql
-- Vérifier que l'utilisateur existe
SELECT * FROM profiles WHERE id = 'votre-user-id';

-- Vérifier le rôle
SELECT role FROM profiles WHERE id = 'votre-user-id';

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'patients';
```

### Comment désactiver RLS temporairement (pour tester) ?

⚠️ **À faire uniquement en développement !**

```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
```

Pour réactiver :
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
```

---

## 💾 Données

### Comment importer des données existantes ?

**Via CSV** :
1. Table Editor → Sélectionner table → **Import data**
2. Upload fichier CSV

**Via SQL** :
```sql
INSERT INTO patients (name, age, doctor_id)
VALUES 
  ('Patient 1', 45, 'doctor-id'),
  ('Patient 2', 32, 'doctor-id');
```

### Comment exporter mes données ?

1. Table Editor → Sélectionner table
2. Cliquer sur **Export** → CSV/JSON

### Mes données disparaissent après redémarrage

Si vous utilisez Supabase, les données sont **persistantes** dans le cloud.

Si elles disparaissent, c'est que vous utilisez encore localStorage !

### Comment migrer les données de localStorage vers Supabase ?

**Script d'export** :
```typescript
// 1. Exporter depuis localStorage
const patients = JSON.parse(localStorage.getItem('medicab_patients') || '[]');

// 2. Importer dans Supabase
for (const patient of patients) {
  await patientService.create(patient);
}
```

---

## 📁 Fichiers (Storage)

### Comment créer le bucket medical-files ?

Il est normalement créé par le script SQL, mais si ce n'est pas le cas :

1. Supabase → **Storage**
2. **New bucket**
3. Nom : `medical-files`
4. Public : ❌ Décoché (privé)

### Comment uploader un fichier ?

```typescript
import { fileService } from './lib/services/supabaseService';

const file = await fileService.upload(
  fileObject,  // File from <input type="file">
  patientId,
  uploadedBy
);

console.log(file.url); // URL du fichier
```

### Quelle est la taille maximale d'upload ?

Par défaut : **50 MB**

Pour augmenter : Settings → Storage → File upload limit

### Comment supprimer un fichier ?

```typescript
await fileService.delete(fileId);
```

### Les fichiers sont-ils publics ?

❌ Non, le bucket est **privé** par défaut.

Seuls les utilisateurs autorisés (médecin, secrétaire du patient) peuvent y accéder grâce aux policies.

---

## 🔄 Real-time

### Comment activer le real-time ?

C'est déjà activé ! Il suffit de s'abonner :

```typescript
const subscription = chatService.subscribeToMessages(
  userId,
  (newMessage) => {
    console.log('Nouveau message !', newMessage);
  }
);

// Cleanup
subscription.unsubscribe();
```

### Le real-time ne fonctionne pas

1. Vérifier dans Supabase → **Database** → **Replication**
2. Activer la réplication sur la table `chat_messages`

### Combien coûte le real-time ?

✅ **Gratuit et illimité** dans tous les plans !

---

## 🐛 Dépannage

### Erreur : "Invalid API key"

**Cause** : Mauvaise clé API ou fichier `.env` non chargé

**Solution** :
```bash
# Vérifier .env
cat .env

# Vérifier que les variables sont chargées
console.log(import.meta.env.VITE_SUPABASE_URL);

# Redémarrer le serveur
npm run dev
```

### Erreur : "Failed to fetch"

**Cause** : Pas de connexion internet ou projet Supabase en pause

**Solution** :
- Vérifier la connexion internet
- Vérifier que le projet Supabase est actif (Dashboard)

### Les requêtes sont très lentes

**Causes** :
- Pas d'index sur les colonnes
- Trop de données dans la table
- Plan gratuit limité

**Solutions** :
```sql
-- Ajouter des index
CREATE INDEX idx_patients_doctor ON patients(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
```

### Erreur : "JWT expired"

**Cause** : Session expirée (après 1 heure par défaut)

**Solution** : Se reconnecter
```typescript
await authService.logout();
await authService.login(email, password);
```

---

## 📊 Migration

### Combien de temps prend la migration ?

Selon la complexité :
- **Authentification** : ~30 min
- **Patients** : ~1h
- **Tout migrer** : ~4-8h

### Dois-je tout migrer d'un coup ?

❌ Non ! Migrez **progressivement** :
1. Auth
2. Patients
3. Rendez-vous
4. Etc.

### Puis-je garder localStorage en backup ?

✅ Oui ! Ne supprimez `dataStore.ts` qu'une fois tout testé.

### Comment tester que ma migration fonctionne ?

1. Créer des données via l'interface
2. Vérifier dans Supabase → Table Editor
3. Rafraîchir l'application
4. Vérifier que les données sont toujours là ✅

---

## 💰 Pricing

### Le plan gratuit suffit-il ?

Pour **développement et tests** : ✅ Oui !

Pour **production** : Ça dépend du nombre d'utilisateurs et de données.

### Quand passer au plan Pro ?

Quand vous dépassez :
- 500 MB de base de données
- 1 GB de storage
- 50 000 utilisateurs actifs/mois

Ou si vous avez besoin de :
- Backups quotidiens automatiques
- Support prioritaire
- Métriques avancées

### Combien coûte le plan Pro ?

~**25$/mois** (peut varier selon la région)

---

## 🆘 Où trouver de l'aide ?

1. **Documentation de ce projet** :
   - `README_SUPABASE.md` - Vue d'ensemble
   - `SUPABASE_SETUP.md` - Configuration
   - `MIGRATION_GUIDE.md` - Migration
   - `examples/` - Exemples de code

2. **Documentation officielle Supabase** :
   - https://supabase.com/docs

3. **Communauté** :
   - Discord Supabase : https://discord.supabase.com
   - GitHub Discussions : https://github.com/supabase/supabase/discussions

4. **Logs et debugging** :
   - Supabase Dashboard → **Logs**
   - Console navigateur (F12)

---

## 🎯 Checklist Rapide

Avant de demander de l'aide, vérifiez :

- [ ] Fichier `.env` existe et contient les bonnes valeurs
- [ ] Script SQL (`schema.sql`) a été exécuté sans erreur
- [ ] Tables visibles dans Table Editor
- [ ] Utilisateurs créés dans Authentication
- [ ] Profils existent dans la table `profiles`
- [ ] Bucket `medical-files` créé dans Storage
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Pas d'erreurs dans la console navigateur
- [ ] SupabaseStatusPanel affiche "OK" ✅

---

**Bonne chance avec Supabase ! 🚀**

Si vous avez d'autres questions, consultez la documentation ou rejoignez la communauté Supabase.
