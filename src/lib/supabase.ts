import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifier si les variables sont configurées
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://votre-projet-id.supabase.co' && 
  supabaseAnonKey !== 'votre-cle-anon-ici';

if (!isConfigured) {
  console.warn(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  CONFIGURATION SUPABASE REQUISE                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Les variables d'environnement Supabase ne sont pas            ║
║  configurées. Suivez ces étapes :                              ║
║                                                                ║
║  1. Ouvrez le fichier .env à la racine du projet               ║
║  2. Remplacez les valeurs par vos identifiants Supabase        ║
║  3. Redémarrez le serveur : npm run dev                        ║
║                                                                ║
║  📚 Voir PROCHAINES_ETAPES.md pour les instructions            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// Créer le client avec des valeurs par défaut si non configuré (évite l'erreur)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // ⚠️ DÉSACTIVÉ TEMPORAIREMENT POUR DEBUG
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Export pour vérifier si Supabase est configuré
export const isSupabaseConfigured = isConfigured;