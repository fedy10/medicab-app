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
} from "lucide-react";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { MedecinDashboard } from "./components/dashboards/MedecinDashboard";
import { SecretaireDashboard } from "./components/dashboards/SecretaireDashboard";

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

// Comptes de démonstration
const demoAccounts = [
  {
    id: "admin-1",
    email: "admin@medicab.tn",
    password: "admin123",
    role: "admin" as const,
    name: "Administrateur",
    nom: "Admin",
    prenom: "System",
    isActive: true,
    status: "active",
  },
  {
    id: "doc-1",
    email: "dr.ben.ali@medicab.tn",
    password: "doctor123",
    role: "medecin" as const,
    name: "Dr. Ahmed Ben Ali",
    nom: "Ben Ali",
    prenom: "Ahmed",
    doctorCode: "DOC-001",
    specialty: "Cardiologue",
    specialite: "Cardiologue",
    phone: "+216 98 123 456",
    telephone: "+216 98 123 456",
    isActive: true,
    status: "active",
  },
  {
    id: "doc-2",
    email: "dr.pending@medicab.tn",
    password: "pending123",
    role: "medecin" as const,
    name: "Dr. Leila Gharbi",
    nom: "Gharbi",
    prenom: "Leila",
    doctorCode: "DOC-002",
    specialty: "Pédiatre",
    specialite: "Pédiatre",
    phone: "+216 98 765 432",
    telephone: "+216 98 765 432",
    adresse: "Avenue Habib Bourguiba, Tunis",
    isActive: false,
    status: "pending",
  },
  {
    id: "sec-1",
    email: "fatma.sec@medicab.tn",
    password: "secretary123",
    role: "secretaire" as const,
    name: "Fatma Trabelsi",
    nom: "Trabelsi",
    prenom: "Fatma",
    doctorCode: "DOC-001",
    medecin_id: "doc-1",
    phone: "+216 22 987 654",
    telephone: "+216 22 987 654",
    isActive: true,
    status: "active",
  },
];

// Initialize localStorage with demo accounts if empty
const initializeDemoData = () => {
  const users = localStorage.getItem("demo_users");
  if (!users) {
    localStorage.setItem("demo_users", JSON.stringify(demoAccounts));
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data
    initializeDemoData();

    // Check if user is already logged in
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const savedSession = localStorage.getItem("user_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        
        // Verify the user still exists and has valid status
        const usersData = localStorage.getItem("demo_users");
        const users = usersData ? JSON.parse(usersData) : demoAccounts;
        const currentUserData = users.find((u: any) => u.id === session.profile.id);
        
        if (!currentUserData) {
          // User no longer exists
          localStorage.removeItem("user_session");
          setLoading(false);
          return;
        }
        
        // Check if user is suspended or pending
        if (currentUserData.status === "suspended" || currentUserData.status === "pending") {
          localStorage.removeItem("user_session");
          setLoading(false);
          return;
        }
        
        // If user is a secretary, check if their doctor is suspended/pending
        if (currentUserData.role === "secretaire" && currentUserData.medecin_id) {
          const doctor = users.find((u: any) => u.id === currentUserData.medecin_id);
          if (doctor && (doctor.status === "suspended" || doctor.status === "pending")) {
            localStorage.removeItem("user_session");
            setLoading(false);
            return;
          }
        }
        
        setCurrentUser(session.user);
        setProfile(session.profile);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      localStorage.removeItem("user_session");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem("demo_users");
      const users = usersData ? JSON.parse(usersData) : demoAccounts;

      // Find user
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Email ou mot de passe incorrect");
      }

      // Check if user is a secretary and their doctor is suspended
      if (user.role === "secretaire" && user.medecin_id) {
        const doctor = users.find((u: any) => u.id === user.medecin_id);
        if (doctor && doctor.status === "suspended") {
          throw new Error(
            "Votre médecin associé a été suspendu. Vous ne pouvez plus accéder à l'application. Veuillez contacter l'administrateur."
          );
        }
        if (doctor && doctor.status === "pending") {
          throw new Error(
            "Votre médecin associé est en attente de validation. Vous pourrez accéder à l'application une fois son compte approuvé."
          );
        }
      }

      // Check if user is active
      if (user.status === "suspended") {
        throw new Error(
          "Votre compte a été suspendu. Veuillez contacter l'administrateur."
        );
      }

      if (user.status === "pending") {
        throw new Error(
          "Votre compte est en attente de validation. L'administrateur doit approuver votre inscription avant que vous puissiez vous connecter."
        );
      }

      if (user.status !== "active") {
        throw new Error(
          "Votre compte n'est pas actif. Veuillez contacter l'administrateur."
        );
      }

      // Create session
      const session = {
        user: {
          id: user.id,
          email: user.email,
        },
        profile: user,
      };

      // Save session
      localStorage.setItem("user_session", JSON.stringify(session));

      setCurrentUser(session.user);
      setProfile(user);
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    localStorage.removeItem("user_session");
  };

  const handleRegister = async (userData: any) => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("demo_users");
      const users = usersData ? JSON.parse(usersData) : [...demoAccounts];

      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        nom: userData.nom,
        prenom: userData.prenom,
        name: `${userData.prenom} ${userData.nom}`,
        role: userData.role || "medecin",
        telephone: userData.telephone,
        phone: userData.telephone,
        specialite: userData.specialite,
        specialty: userData.specialite,
        medecin_id: userData.medecin_id,
        doctorCode:
          userData.role === "medecin"
            ? `DOC-${Date.now()}`
            : userData.medecin_id,
        // New doctors start with 'pending' status, waiting for admin approval
        // Secretaries and admins are active by default
        status: userData.role === "medecin" ? "pending" : "active",
        isActive: userData.role !== "medecin",
      };

      // Add to users array
      users.push(newUser);

      // Save to localStorage
      localStorage.setItem("demo_users", JSON.stringify(users));

      return {
        message: "Inscription réussie",
        user: newUser,
      };
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
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

  if (!currentUser) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatePresence mode="wait">
        {profile?.role === "admin" && (
          <AdminDashboard
            key="admin"
            user={currentUser}
            profile={profile}
            onLogout={handleLogout}
          />
        )}
        {profile?.role === "medecin" && (
          <MedecinDashboard
            key="doctor"
            user={currentUser}
            profile={profile}
            onLogout={handleLogout}
          />
        )}
        {profile?.role === "secretaire" && (
          <SecretaireDashboard
            key="secretary"
            user={currentUser}
            profile={profile}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}