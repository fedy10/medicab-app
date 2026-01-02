/**
 * EXEMPLE DE MIGRATION : LoginPage avec Supabase
 * 
 * Ce fichier montre comment migrer LoginPage.tsx de localStorage vers Supabase
 * Comparez avec /components/auth/LoginPage.tsx pour voir les différences
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner@2.0.3";
import { AnimatedBackground } from "../components/ui/AnimatedBackground";
import { FloatingElement } from "../components/ui/FloatingElement";

interface LoginPageProps {
  onLogin: (userRole: string) => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  // ✨ CHANGEMENT 1 : Utiliser le hook useAuth au lieu de dataStore
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    // ✨ CHANGEMENT 2 : Utiliser authService au lieu de dataStore
    // AVANT : const result = await dataStore.login(email, password);
    // APRÈS :
    const result = await login(email, password);

    if (result.success && result.profile) {
      toast.success(`Bienvenue ${result.profile.name} !`, {
        description: "Connexion réussie",
        duration: 3000,
      });
      
      // ✨ CHANGEMENT 3 : Le profil vient de Supabase
      onLogin(result.profile.role);
    } else {
      setError(result.error || "Erreur de connexion");
      toast.error("Échec de la connexion", {
        description: result.error || "Email ou mot de passe incorrect",
        duration: 4000,
      });
    }
  };

  // Comptes de démonstration - Inchangé
  const demoAccounts = [
    {
      role: "admin",
      name: "Administrateur",
      email: "admin@medicab.tn",
      password: "admin123",
      icon: User,
      color: "from-purple-500 to-pink-500",
    },
    {
      role: "doctor",
      name: "Médecin",
      email: "dr.ben.ali@medicab.tn",
      password: "doctor123",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      role: "secretary",
      name: "Secrétaire",
      email: "fatma.sec@medicab.tn",
      password: "secretary123",
      icon: User,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <FloatingElement delay={0} className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl" />
        <FloatingElement delay={1} className="absolute bottom-40 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl" />
        <FloatingElement delay={2} className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-200/30 rounded-full blur-2xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              MediCab Pro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600"
            >
              Gestion Intelligente de Cabinet Médical
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulaire de connexion */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl mb-8 text-gray-800">
                Connexion
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* ✨ CHANGEMENT 4 : Afficher l'état de chargement */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Pas encore de compte ? <strong>S'inscrire</strong>
                </button>
              </div>
            </motion.div>

            {/* Comptes de démonstration - Inchangé */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-2xl text-gray-800 mb-6">
                Comptes de démonstration
              </h3>
              
              {demoAccounts.map((account, index) => (
                <motion.div
                  key={account.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => fillDemoAccount(account.email, account.password)}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${account.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <account.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-800 mb-1">{account.name}</h4>
                      <p className="text-sm text-gray-500">{account.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Mot de passe: {account.password}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * 📝 RÉSUMÉ DES CHANGEMENTS :
 * 
 * 1. Import du hook useAuth au lieu de dataStore
 * 2. Utilisation de login() du hook au lieu de dataStore.login()
 * 3. Gestion de l'état loading fourni par useAuth
 * 4. Le reste du code est identique (UI, validation, etc.)
 * 
 * ✅ AVANTAGES :
 * - Données persistées dans le cloud (Supabase)
 * - Authentification sécurisée
 * - Session management automatique
 * - Possibilité de reset password, confirmation email, etc.
 * 
 * 🔄 POUR APPLIQUER À VOTRE FICHIER :
 * 1. Ouvrir /components/auth/LoginPage.tsx
 * 2. Remplacer les lignes marquées avec ✨ CHANGEMENT
 * 3. Tester la connexion
 */
