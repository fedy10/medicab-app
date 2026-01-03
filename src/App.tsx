import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Users,
  FileText,
  TrendingUp,
  User,
  LogOut,
  Stethoscope,
  Activity,
  Settings,
  Database,
  AlertCircle,
} from "lucide-react";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { MedecinDashboard } from "./components/dashboards/MedecinDashboard";
import { SecretaireDashboard } from "./components/dashboards/SecretaireDashboard";
import { SupabaseSetup } from "./components/SupabaseSetup";
import { LanguageProvider } from "./contexts/LanguageContext";
import { authService } from "./lib/services/supabaseService";
import { isSupabaseConfigured } from "./lib/supabase";

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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nettoyer localStorage (migration vers Supabase)
    console.log('✅ Migration vers Supabase - localStorage nettoyé');
    
    // Vérifier la session Supabase
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('🔄 Vérification de la session Supabase...');
      const session = await authService.getCurrentSession();
      
      if (session) {
        console.log('✅ Session trouvée:', session.profile.email);
        setCurrentUser(session.user);
        setProfile(session.profile);
      } else {
        console.log('ℹ️ Pas de session active');
      }
    } catch (error) {
      console.error('❌ Erreur vérification session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentative de connexion avec Supabase:', email);
      const result = await authService.login(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Erreur de connexion');
      }

      if (!result.user || !result.profile) {
        throw new Error('Données utilisateur manquantes');
      }

      console.log('✅ Connexion réussie:', result.profile.name);
      setCurrentUser(result.user);
      setProfile(result.profile);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Déconnexion...');
      await authService.logout();
      setCurrentUser(null);
      setProfile(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: "doctor" | "secretary";
    telephone?: string;
    adresse?: string;
    specialite?: string;
    medecin_id?: string;
  }) => {
    try {
      console.log('📝 Tentative d\'inscription avec Supabase:', userData.email);
      
      const name = `${userData.prenom} ${userData.nom}`;
      
      const result = await authService.register({
        email: userData.email,
        password: userData.password,
        name: name,
        role: userData.role,
        phone: userData.telephone,
        address: userData.adresse,
        specialty: userData.specialite,
        assignedDoctorId: userData.medecin_id,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erreur d\'inscription',
        };
      }

      console.log('✅ Inscription réussie:', name);
      
      // Message personnalisé selon le rôle
      if (userData.role === 'doctor') {
        return {
          success: true,
          message: '✅ Votre compte a été créé avec succès ! Veuillez attendre la validation de l\'administrateur avant de vous connecter.',
        };
      } else {
        return {
          success: true,
          message: '✅ Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.',
        };
      }
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'inscription',
      };
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
          <p className="text-sm text-gray-400 mt-2">Connexion à Supabase...</p>
        </div>
      </div>
    );
  }

  // Show Supabase setup if not configured
  if (!isSupabaseConfigured) {
    return <SupabaseSetup />;
  }

  // Login/Register pages
  if (!currentUser || !profile) {
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

  // Dashboard based on role
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {profile.role === "admin" && (
          <AdminDashboard
            profile={profile}
            onLogout={handleLogout}
          />
        )}
        {profile.role === "doctor" && (
          <MedecinDashboard
            profile={profile}
            onLogout={handleLogout}
          />
        )}
        {profile.role === "secretary" && (
          <SecretaireDashboard
            profile={profile}
            onLogout={handleLogout}
          />
        )}
      </div>
    </LanguageProvider>
  );
}