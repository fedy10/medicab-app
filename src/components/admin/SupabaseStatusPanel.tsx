/**
 * Panneau de statut Supabase
 * Composant visuel pour vérifier l'état de la connexion Supabase
 * À ajouter temporairement dans le dashboard admin pour tester
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { checkSupabaseConnection, quickTest, checkUser } from '../../utils/supabase/checkConnection';

export function SupabaseStatusPanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('admin@medicab.tn');

  const runCheck = async () => {
    setLoading(true);
    try {
      const results = await checkSupabaseConnection();
      setStatus(results);
    } catch (error) {
      console.error('Erreur vérification:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const runQuickTest = async () => {
    setLoading(true);
    await quickTest();
    setLoading(false);
  };

  const runUserCheck = async () => {
    setLoading(true);
    await checkUser(testEmail);
    setLoading(false);
  };

  const StatusIcon = ({ value }: { value: boolean }) => {
    if (value) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl text-gray-800">Statut Supabase</h3>
            <p className="text-sm text-gray-500">Vérification de la connexion</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runCheck}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Recharger
        </motion.button>
      </div>

      {loading && !status ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : status ? (
        <div className="space-y-4">
          {/* Résumé visuel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <StatusIcon value={status.config} />
              <p className="text-xs text-gray-600 mt-2">Config</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <StatusIcon value={status.connection} />
              <p className="text-xs text-gray-600 mt-2">Connexion</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <StatusIcon value={status.tables} />
              <p className="text-xs text-gray-600 mt-2">Tables</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              {status.auth ? (
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto" />
              )}
              <p className="text-xs text-gray-600 mt-2">Auth</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <StatusIcon value={status.storage} />
              <p className="text-xs text-gray-600 mt-2">Storage</p>
            </div>
          </div>

          {/* État global */}
          <div className={`p-4 rounded-xl border-2 ${
            status.config && status.connection && status.tables
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {status.config && status.connection && status.tables ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="text-green-800">Supabase est opérationnel ✅</h4>
                  <p className="text-sm text-green-600">Toutes les vérifications essentielles ont réussi</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-red-800">Configuration incomplète ❌</h4>
                  <p className="text-sm text-red-600">Certaines vérifications ont échoué</p>
                </div>
              </div>
            )}
          </div>

          {/* Erreurs */}
          {status.errors && status.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="text-yellow-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Erreurs détectées
              </h4>
              <ul className="space-y-1">
                {status.errors.map((error: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions rapides */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={runQuickTest}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              Test rapide
            </button>
            <button
              onClick={runUserCheck}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              Vérifier utilisateur
            </button>
          </div>

          {/* Test utilisateur */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Email à tester :</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                placeholder="email@example.com"
              />
              <button
                onClick={runUserCheck}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
              >
                Tester
              </button>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">📖 Documentation :</p>
            <div className="space-y-1">
              <a
                href="/SUPABASE_SETUP.md"
                target="_blank"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                → Guide de configuration
              </a>
              <a
                href="/MIGRATION_GUIDE.md"
                target="_blank"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                → Guide de migration
              </a>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                → Dashboard Supabase ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Cliquez sur "Recharger" pour vérifier la connexion
        </div>
      )}
    </motion.div>
  );
}

/**
 * 📌 UTILISATION :
 * 
 * Ajoutez ce composant temporairement dans votre AdminDashboard :
 * 
 * import { SupabaseStatusPanel } from './SupabaseStatusPanel';
 * 
 * // Dans le render:
 * <SupabaseStatusPanel />
 * 
 * Une fois que tout fonctionne, vous pouvez retirer ce composant.
 */
