import { motion } from 'motion/react';
import { Database, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export function SupabaseSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration Supabase
          </h1>
          <p className="text-gray-600">
            Connectez votre base de données pour commencer
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Base de données non configurée
            </h3>
            <p className="text-sm text-yellow-800">
              L'application nécessite une connexion à Supabase pour fonctionner.
              Veuillez configurer votre projet Supabase ci-dessous.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Étapes de configuration :
          </h2>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Créez un projet Supabase
                </h3>
                <p className="text-sm text-gray-600">
                  Rendez-vous sur{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                  >
                    supabase.com
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  et créez un nouveau projet gratuitement.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Récupérez vos identifiants
                </h3>
                <p className="text-sm text-gray-600">
                  Dans votre projet Supabase, allez dans Settings → API et copiez :
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Project URL
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    anon / public key
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Exécutez les migrations SQL
                </h3>
                <p className="text-sm text-gray-600">
                  Copiez et exécutez le contenu des fichiers suivants dans le SQL Editor de Supabase :
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-0.5 rounded">migration.sql</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <code className="bg-gray-100 px-2 py-0.5 rounded">migration_consultation.sql</code>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Connectez l'application
                </h3>
                <p className="text-sm text-gray-600">
                  Cliquez sur le bouton ci-dessous pour configurer la connexion à votre base de données Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Cliquez sur le bouton pour commencer la configuration
          </p>
          <button
            onClick={() => {
              alert('Veuillez utiliser l\'outil supabase_connect de Figma Make pour configurer votre connexion Supabase.');
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Database className="w-5 h-5" />
            Connecter à Supabase
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Besoin d'aide ? Consultez la{' '}
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              documentation Supabase
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
