import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { MedecinDashboard } from "./components/dashboards/MedecinDashboard";
import { SecretaireDashboard } from "./components/dashboards/SecretaireDashboard";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import { authService } from "./lib/services/supabaseService";
import { isSupabaseConfigured } from "./lib/supabase";
import { AlertCircle } from "lucide-react";

export type UserRole = "admin" | "doctor" | "secretary";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  doctorCode?: string;
  isActive: boolean;
  specialty?: string;
  phone?: string;
}

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Mapping des rôles Supabase vers les rôles de l'interface
  const getMappedRole = () => {
    if (!profile) return null;
    
    // Mapper les rôles
    const roleMapping: { [key: string]: string } = {
      'admin': 'admin',
      'doctor': 'medecin',
      'secretary': 'secretaire',
    };
    
    return roleMapping[profile.role] || profile.role;
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion...', email);
      
      const result = await authService.login(email, password);
      
      console.log('📊 Résultat login:', result);
      
      if (!result.success) {
        // Messages d'erreur plus explicites
        let errorMessage = result.error || "Erreur de connexion";
        
        // Détecter les erreurs courantes
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage = "⚠️ Vous devez vérifier votre email. Consultez votre boîte mail et cliquez sur le lien de vérification.";
        } else if (errorMessage.includes("User not found")) {
          errorMessage = "Aucun compte trouvé avec cet email";
        } else if (errorMessage.includes("suspended")) {
          errorMessage = "Votre compte a été suspendu. Contactez l'administrateur.";
        }
        
        console.error('❌ Erreur de connexion:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Connexion réussie !');
      
      // La session est gérée automatiquement par useAuth
      return result;
    } catch (error: any) {
      console.error('💥 Exception lors de la connexion:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  const handleRegister = async (userData: any) => {
    try {
      const result = await authService.register({
        email: userData.email,
        password: userData.password,
        name: `${userData.prenom} ${userData.nom}`,
        role: userData.role === 'medecin' ? 'doctor' : 'secretary',
        phone: userData.telephone,
        specialty: userData.specialite,
        assignedDoctorId: userData.medecin_id,
      });

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'inscription");
      }

      return {
        message: result.profile?.role === 'doctor' 
          ? "Inscription réussie. Votre compte est en attente de validation par l'administrateur."
          : "Inscription réussie !",
        user: result.profile,
      };
    } catch (error: any) {
      throw error;
    }
  };

  // Afficher un message si Supabase n'est pas configuré
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configuration Supabase Requise</h1>
              <p className="text-gray-600">Votre base de données n'est pas encore connectée</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">📋 Étapes à suivre :</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Créer un projet Supabase</strong>
                  <p className="text-sm text-gray-600">Allez sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> et créez un nouveau projet</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Récupérer les identifiants</strong>
                  <p className="text-sm text-gray-600">Dans Settings → API, copiez le "Project URL" et la clé "anon/public"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Configurer le fichier .env</strong>
                  <p className="text-sm text-gray-600">Ouvrez le fichier <code className="bg-gray-200 px-2 py-1 rounded">.env</code> et remplacez les valeurs</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                <div>
                  <strong>Exécuter le schema SQL</strong>
                  <p className="text-sm text-gray-600">Dans Supabase SQL Editor, collez le contenu de <code className="bg-gray-200 px-2 py-1 rounded">supabase/schema.sql</code></p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">5</span>
                <div>
                  <strong>Redémarrer le serveur</strong>
                  <p className="text-sm text-gray-600">Arrêtez et relancez : <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code></p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📚 <strong>Documentation complète :</strong> Consultez le fichier <code className="bg-blue-100 px-2 py-1 rounded">PROCHAINES_ETAPES.md</code> pour des instructions détaillées
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <LanguageProvider>
        <AnimatePresence mode="wait">
          {showRegister ? (
            <RegisterPage
              key="register"
              onRegister={handleRegister}
              onBackToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginPage
              key="login"
              onLogin={handleLogin}
              onShowRegister={() => setShowRegister(true)}
            />
          )}
        </AnimatePresence>
      </LanguageProvider>
    );
  }

  // Créer un objet profile compatible avec l'interface existante
  const mappedProfile = {
    ...profile,
    role: getMappedRole(),
    telephone: profile.phone,
    specialite: profile.specialty,
    status: profile.status,
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AnimatePresence mode="wait">
          {profile.role === "admin" && (
            <AdminDashboard
              key="admin"
              user={user}
              profile={mappedProfile}
              onLogout={handleLogout}
            />
          )}
          {profile.role === "doctor" && (
            <MedecinDashboard
              key="doctor"
              user={user}
              profile={mappedProfile}
              onLogout={handleLogout}
            />
          )}
          {profile.role === "secretary" && (
            <SecretaireDashboard
              key="secretary"
              user={user}
              profile={mappedProfile}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
}