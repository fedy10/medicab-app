import { useState } from 'react';
import { motion } from 'motion/react';
import { Database, AlertCircle, ExternalLink } from 'lucide-react';

export function SupabaseSetup() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration Supabase
          </h1>
          <p className="text-gray-600">
            Connectez votre application à Supabase pour commencer
          </p>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium mb-1">
              ⚠️ Supabase non configuré
            </p>
            <p className="text-sm text-yellow-700">
              Veuillez configurer vos variables d'environnement Supabase pour utiliser l'application.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-blue-900 font-medium">
              {showInstructions ? '▼' : '▶'} Instructions de configuration
            </span>
          </button>

          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-6 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. Créer un projet Supabase
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Allez sur{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  et créez un nouveau projet (gratuit).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. Récupérer les clés
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Dans votre projet Supabase :
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
                  <li>Allez dans Settings → API</li>
                  <li>Copiez l'URL du projet</li>
                  <li>Copiez la clé "anon public"</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. Configurer les variables d'environnement
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Créez un fichier <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> à la racine du projet :
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  <div>VITE_SUPABASE_URL=https://votre-projet.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. Exécuter le schéma SQL
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Dans le SQL Editor de Supabase, exécutez le fichier{' '}
                  <code className="bg-gray-200 px-2 py-1 rounded">/supabase/schema.sql</code>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5. Redémarrer l'application
                </h3>
                <p className="text-sm text-gray-700">
                  Arrêtez et relancez le serveur de développement :
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono mt-2">
                  <div># Ctrl+C pour arrêter</div>
                  <div>npm run dev</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Liens utiles
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
              Supabase
            </a>
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Note :</strong> Une fois configuré, l'application se connectera automatiquement
            à votre base de données Supabase.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
