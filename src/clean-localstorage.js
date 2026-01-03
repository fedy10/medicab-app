/**
 * Script de nettoyage du localStorage
 * 
 * Ce script supprime toutes les anciennes données localStorage
 * utilisées par l'ancienne version de l'application.
 * 
 * Usage:
 * 1. Ouvrez la console du navigateur (F12)
 * 2. Copiez-collez ce script
 * 3. Appuyez sur Entrée
 */

(function cleanLocalStorage() {
  console.log('🧹 Nettoyage du localStorage...\n');
  
  // Liste des clés à supprimer
  const keysToRemove = [
    'demo_users',
    'user_session',
    'medicab_users',
    'medicab_patients',
    'medicab_appointments',
    'medicab_consultations',
    'medicab_chatMessages',
    'medicab_referralLetters',
    'medicab_notifications',
    'medicab_revenues',
  ];
  
  let removedCount = 0;
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      const dataSize = localStorage.getItem(key).length;
      localStorage.removeItem(key);
      console.log(`✅ Supprimé: ${key} (${dataSize} caractères)`);
      removedCount++;
    } else {
      console.log(`⏭️  Ignoré: ${key} (n'existe pas)`);
    }
  });
  
  console.log(`\n📊 Résumé:`);
  console.log(`   - Clés supprimées: ${removedCount}`);
  console.log(`   - Clés restantes: ${Object.keys(localStorage).length}`);
  
  if (removedCount > 0) {
    console.log(`\n✅ Nettoyage terminé avec succès !`);
    console.log(`   L'application utilisera maintenant uniquement Supabase.`);
  } else {
    console.log(`\n✨ Rien à nettoyer, localStorage déjà propre !`);
  }
  
  // Afficher les clés restantes (pour info)
  if (Object.keys(localStorage).length > 0) {
    console.log(`\n🔍 Clés restantes dans localStorage:`);
    Object.keys(localStorage).forEach(key => {
      console.log(`   - ${key}`);
    });
  }
})();
