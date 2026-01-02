/**
 * EXEMPLE DE MIGRATION : PatientsView avec Supabase
 * 
 * Ce fichier montre comment migrer la vue Patients de localStorage vers Supabase
 * Focus sur les opérations CRUD : Create, Read, Update, Delete
 */

import { useState, useEffect } from "react";
import { patientService } from "../lib/services/supabaseService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { Plus, Search, Loader2 } from "lucide-react";

export function PatientsViewSupabase() {
  // ✨ CHANGEMENT 1 : Récupérer l'utilisateur authentifié
  const { profile } = useAuth();
  
  // ✨ CHANGEMENT 2 : State pour les données async
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // ✨ CHANGEMENT 3 : Charger les patients depuis Supabase
  useEffect(() => {
    loadPatients();
  }, [profile?.id]);

  async function loadPatients() {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // AVANT : const data = dataStore.getPatients(doctorId);
      // APRÈS :
      const data = await patientService.getAll(profile.id);
      
      setPatients(data);
    } catch (err: any) {
      console.error("Erreur chargement patients:", err);
      setError(err.message);
      toast.error("Erreur", {
        description: "Impossible de charger les patients",
      });
    } finally {
      setLoading(false);
    }
  }

  // ✨ CHANGEMENT 4 : Créer un patient (async)
  const handleAddPatient = async (patientData: any) => {
    if (!profile?.id) return;

    try {
      // AVANT : dataStore.addPatient(newPatient);
      // APRÈS :
      await patientService.create({
        name: patientData.name,
        age: patientData.age,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        diseases: patientData.diseases || [],
        doctor_id: profile.id,
      });

      // Recharger la liste
      await loadPatients();
      
      toast.success("Patient ajouté", {
        description: `${patientData.name} a été ajouté avec succès`,
      });
      
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Erreur ajout patient:", err);
      toast.error("Erreur", {
        description: err.message || "Impossible d'ajouter le patient",
      });
    }
  };

  // ✨ CHANGEMENT 5 : Modifier un patient (async)
  const handleUpdatePatient = async (patientId: string, updates: any) => {
    try {
      // AVANT : dataStore.updatePatient(patientId, updates);
      // APRÈS :
      await patientService.update(patientId, updates);

      // Recharger la liste
      await loadPatients();
      
      toast.success("Patient modifié", {
        description: "Les modifications ont été enregistrées",
      });
    } catch (err: any) {
      console.error("Erreur modification patient:", err);
      toast.error("Erreur", {
        description: err.message || "Impossible de modifier le patient",
      });
    }
  };

  // ✨ CHANGEMENT 6 : Supprimer un patient (async)
  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${patientName} ?`)) {
      return;
    }

    try {
      // AVANT : dataStore.deletePatient(patientId);
      // APRÈS :
      await patientService.delete(patientId);

      // Recharger la liste
      await loadPatients();
      
      toast.success("Patient supprimé", {
        description: `${patientName} a été supprimé`,
      });
    } catch (err: any) {
      console.error("Erreur suppression patient:", err);
      toast.error("Erreur", {
        description: err.message || "Impossible de supprimer le patient",
      });
    }
  };

  // Filtrer les patients (logique inchangée)
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✨ CHANGEMENT 7 : Afficher l'état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  // ✨ CHANGEMENT 8 : Afficher les erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPatients}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl text-gray-800">Patients</h2>
          <p className="text-gray-600 mt-1">
            {patients.length} patient{patients.length > 1 ? "s" : ""}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Nouveau patient
        </motion.button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un patient..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Liste des patients */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? "Aucun patient trouvé" : "Aucun patient pour le moment"}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl text-gray-800">{patient.name}</h3>
                  <p className="text-gray-600">{patient.age} ans</p>
                  <p className="text-gray-500 text-sm">{patient.phone}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Ouvrir modal d'édition
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id, patient.name)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal d'ajout (exemple simplifié) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl mb-6">Ajouter un patient</h3>
            {/* Formulaire ici */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Appeler handleAddPatient avec les données du formulaire
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 📝 RÉSUMÉ DES CHANGEMENTS PRINCIPAUX :
 * 
 * 1. Ajout de useState pour loading et error
 * 2. useEffect pour charger les données au montage
 * 3. Toutes les opérations sont async/await
 * 4. Recharger la liste après chaque mutation
 * 5. Afficher les états de chargement et d'erreur
 * 6. Gestion des erreurs avec try/catch
 * 7. Toast notifications pour le feedback utilisateur
 * 
 * ✅ PATTERN À RETENIR :
 * 
 * LECTURE (GET) :
 * - useEffect + async function
 * - État loading/error
 * - Afficher les états intermédiaires
 * 
 * CRÉATION/MODIFICATION/SUPPRESSION :
 * - async function
 * - try/catch pour les erreurs
 * - Recharger les données après succès
 * - Toast pour feedback
 * 
 * 🔄 WORKFLOW TYPE :
 * 1. Charger les données (useEffect)
 * 2. Afficher loading state
 * 3. Afficher les données ou l'erreur
 * 4. Mutation → Toast → Reload
 */
