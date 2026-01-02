/**
 * Script de vérification de la connexion Supabase
 * Utilisez ce fichier pour tester que votre configuration Supabase fonctionne correctement
 */

import { supabase } from '../../lib/supabase';

export async function checkSupabaseConnection() {
  const results = {
    config: false,
    connection: false,
    tables: false,
    auth: false,
    storage: false,
    errors: [] as string[],
  };

  console.log('🔍 Vérification de la configuration Supabase...\n');

  // 1. Vérifier la configuration
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      results.errors.push('⚠️  Variables d\'environnement manquantes (VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY)');
      console.error('❌ Configuration: ÉCHEC');
      console.error('   → Vérifiez votre fichier .env\n');
    } else {
      results.config = true;
      console.log('✅ Configuration: OK');
      console.log(`   → URL: ${url.substring(0, 30)}...`);
      console.log(`   → Key: ${key.substring(0, 20)}...\n`);
    }
  } catch (error: any) {
    results.errors.push(`Erreur config: ${error.message}`);
    console.error('❌ Configuration: ERREUR\n');
  }

  // 2. Vérifier la connexion
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      results.errors.push(`Erreur connexion: ${error.message}`);
      console.error('❌ Connexion: ÉCHEC');
      console.error(`   → ${error.message}\n`);
    } else {
      results.connection = true;
      console.log('✅ Connexion: OK');
      console.log('   → Communication avec Supabase établie\n');
    }
  } catch (error: any) {
    results.errors.push(`Erreur connexion: ${error.message}`);
    console.error('❌ Connexion: ERREUR\n');
  }

  // 3. Vérifier les tables
  try {
    const tables = [
      'profiles',
      'patients',
      'appointments',
      'consultations',
      'chat_messages',
      'referral_letters',
      'notifications',
      'revenues',
      'medical_files',
    ];

    console.log('📊 Vérification des tables:');
    
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error(`   ❌ ${table}: ${error.message}`);
          results.errors.push(`Table ${table}: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`   ✅ ${table}`);
        }
      } catch (err: any) {
        console.error(`   ❌ ${table}: ${err.message}`);
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      results.tables = true;
      console.log('\n✅ Tables: OK (toutes les tables existent)\n');
    } else {
      console.log('\n❌ Tables: ÉCHEC (certaines tables manquent)');
      console.log('   → Exécutez le script SQL dans Supabase (voir SUPABASE_SETUP.md)\n');
    }
  } catch (error: any) {
    results.errors.push(`Erreur tables: ${error.message}`);
    console.error('❌ Tables: ERREUR\n');
  }

  // 4. Vérifier l'authentification
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      results.auth = true;
      console.log('✅ Authentification: OK');
      console.log(`   → Utilisateur connecté: ${session.user.email}\n`);
    } else {
      console.log('ℹ️  Authentification: Aucune session active');
      console.log('   → Ceci est normal si vous n\'êtes pas connecté\n');
    }
  } catch (error: any) {
    results.errors.push(`Erreur auth: ${error.message}`);
    console.error('❌ Authentification: ERREUR\n');
  }

  // 5. Vérifier le storage
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage: ÉCHEC');
      console.error(`   → ${error.message}\n`);
    } else {
      const medicalFilesBucket = data.find(b => b.name === 'medical-files');
      
      if (medicalFilesBucket) {
        results.storage = true;
        console.log('✅ Storage: OK');
        console.log('   → Bucket "medical-files" existe\n');
      } else {
        console.log('⚠️  Storage: Bucket "medical-files" manquant');
        console.log('   → Créez le bucket dans Supabase → Storage\n');
      }
    }
  } catch (error: any) {
    results.errors.push(`Erreur storage: ${error.message}`);
    console.error('❌ Storage: ERREUR\n');
  }

  // Résumé final
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════════\n');

  const totalChecks = 5;
  const passedChecks = [
    results.config,
    results.connection,
    results.tables,
    results.auth || true, // Auth is optional
    results.storage,
  ].filter(Boolean).length;

  if (results.config && results.connection && results.tables) {
    console.log('🎉 SUCCÈS ! Supabase est correctement configuré');
    console.log(`   ${passedChecks}/${totalChecks} vérifications réussies\n`);
    
    if (!results.storage) {
      console.log('⚠️  Action requise: Créer le bucket "medical-files"');
    }
  } else {
    console.log('❌ ÉCHEC - Configuration incomplète');
    console.log(`   ${passedChecks}/${totalChecks} vérifications réussies\n`);
    
    console.log('🔧 Actions requises:');
    if (!results.config) {
      console.log('   1. Créer un fichier .env avec vos clés Supabase');
    }
    if (!results.connection) {
      console.log('   2. Vérifier que votre projet Supabase est actif');
    }
    if (!results.tables) {
      console.log('   3. Exécuter le script SQL (supabase/schema.sql)');
    }
    if (!results.storage) {
      console.log('   4. Créer le bucket "medical-files" dans Storage');
    }
    
    console.log('\n📖 Consultez SUPABASE_SETUP.md pour plus de détails\n');
  }

  if (results.errors.length > 0) {
    console.log('⚠️  Erreurs détectées:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
    console.log('');
  }

  return results;
}

// Fonction helper pour tester une connexion simple
export async function quickTest() {
  console.log('🚀 Test rapide de connexion Supabase...\n');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);

    if (error) {
      console.error('❌ Échec:', error.message);
      return false;
    }

    console.log('✅ Connexion réussie !');
    if (data && data.length > 0) {
      console.log(`   Premier utilisateur: ${data[0].email}\n`);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Fonction pour vérifier un utilisateur spécifique
export async function checkUser(email: string) {
  console.log(`🔍 Recherche de l'utilisateur: ${email}\n`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ Utilisateur non trouvé');
      console.error(`   → ${error.message}\n`);
      return null;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Nom: ${data.name}`);
    console.log(`   Rôle: ${data.role}`);
    console.log(`   Status: ${data.status}\n`);
    
    return data;
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Auto-exécution si appelé directement
if (import.meta.url === new URL(import.meta.url).href) {
  checkSupabaseConnection();
}
