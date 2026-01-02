import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Nettoyer l'ancien localStorage au démarrage (migration vers Supabase)
  const cleanOldLocalStorage = () => {
    try {
      // Supprimer les anciennes données localStorage
      const keysToRemove = [
        'demo_users',
        'user_session', // Ancien système de session
        'medicab_users',
        'medicab_patients',
        'medicab_appointments',
        'medicab_consultations',
        'medicab_chatMessages',
        'medicab_referralLetters',
        'medicab_notifications',
        'medicab_revenues',
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 Nettoyé: ${key}`);
        }
      });
      
      console.log('✅ Migration vers Supabase - localStorage nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du localStorage:', error);
    }
  };

  // Nettoyer au démarrage
  cleanOldLocalStorage();

  createRoot(document.getElementById("root")!).render(<App />);