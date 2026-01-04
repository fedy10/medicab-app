import { ModernFileUploader } from "./ModernFileUploader";
import { ReferralTypeSelector } from "./ReferralTypeSelector";
import { DoctorsList } from "./DoctorsList";
import { PatientReferralChat } from "./PatientReferralChat";
import { ReferralsHistory } from "./ReferralsHistory";
import { PaginationComponent } from "../ui/PaginationComponent";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAppointments, useConsultations, usePatients } from "../../hooks/useSupabase";
import { consultationService, patientService, referralService, profileService } from "../../lib/services";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Printer,
  Clock,
  Pill,
  FlaskConical,
  Image as ImageIcon,
  Edit,
  Sparkles,
  Send,
  Upload,
  Eye,
  Download,
  Edit2,
  Trash2,
  MessageSquare,
  ArrowRight,
  Glasses,
  Ear,
  Activity,
  Brain,
  Bone,
  Stethoscope,
  Loader,
} from "lucide-react";
import { PrintableDocument } from "./PrintableDocument";
import { MedicalSpecialtiesSelector } from "./MedicalSpecialtiesSelector";
import { AIAssistant } from "./AIAssistant";
import { ChronicDiseasesSelector } from "../ui/ChronicDiseasesSelector";

interface ConsultationsViewProps {
  doctorId: string;
  doctorProfile: any; // Profil complet du médecin
}

export function ConsultationsViewSupabase({
  doctorId,
  doctorProfile,
}: ConsultationsViewProps) {
  const { t } = useLanguage();
  
  // ============================================
  // HOOKS SUPABASE
  // ============================================
  const { 
    appointments: supabaseAppointments, 
    loading: appointmentsLoading,
  } = useAppointments(doctorId);
  
  const { 
    consultations: supabaseConsultations, 
    loading: consultationsLoading,
    createConsultation,
    updateConsultation 
  } = useConsultations(doctorId);
  
  const { 
    patients: supabasePatients, 
    loading: patientsLoading,
    updatePatient 
  } = usePatients(doctorId);

  // ============================================
  // STATES
  // ============================================
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  
  const [newConsultation, setNewConsultation] = useState({
    prescription: "",
    analysis: "",
    imaging: "",
    notes: "",
  });
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [printDocument, setPrintDocument] = useState<{
    type: "prescription" | "analysis" | "imaging" | "referral";
    content: string;
    specialty?: string;
    consultationIndex?: number;
    isHistorical?: boolean;
  } | null>(null);
  
  const [aiQuery, setAiQuery] = useState("");
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showFileUploader, setShowFileUploader] = useState(false);
  
  // States pour lettres d'orientation
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showReferralTypeSelector, setShowReferralTypeSelector] = useState(false);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [showPatientReferralChat, setShowPatientReferralChat] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [referralLetterContent, setReferralLetterContent] = useState("");
  const [patientReferrals, setPatientReferrals] = useState<any[]>([]);

  // ============================================
  // RÉCUPÉRER LES RENDEZ-VOUS CONFIRMÉS DU JOUR
  // ============================================
  // FIX: Utiliser la date locale au lieu de UTC pour éviter le décalage
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  // FIX: Afficher les rendez-vous confirmés (status = 'completed')
  // Car quand on "confirme" un rendez-vous dans le calendrier, son statut devient 'completed'
  const todayAppointments = supabaseAppointments.filter(apt => 
    apt.date === today && apt.status === 'completed'
  );

  // ============================================
  // CHARGER LES DONNÉES D'UN PATIENT
  // ============================================
  const loadPatientData = async (patientId: string) => {
    try {
      // Charger le patient
      const patient = supabasePatients.find(p => p.id === patientId);
      if (!patient) return;
      
      setSelectedPatient(patient);
      
      // Charger les consultations du patient
      const patientConsultations = await consultationService.getByPatient(patientId);
      
      // Charger les lettres d'orientation
      const referrals = await referralService.getByPatient(patientId);
      setPatientReferrals(referrals);
      
      // Ajouter l'historique au patient
      const patientWithHistory = {
        ...patient,
        consultations: patientConsultations,
        referrals: referrals,
      };
      
      setSelectedPatient(patientWithHistory);
    } catch (error) {
      console.error("❌ Erreur chargement patient:", error);
      alert("Erreur lors du chargement des données du patient");
    }
  };

  // ============================================
  // GÉRER LA SÉLECTION D'UN RENDEZ-VOUS
  // ============================================
  const handleAppointmentClick = async (appointment: any) => {
    setSelectedAppointmentId(appointment.id);
    setSelectedConsultation(appointment);
    await loadPatientData(appointment.patient_id);
  };

  // ============================================
  // METTRE À JOUR LE PATIENT
  // ============================================
  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await updatePatient(selectedPatient.id, {
        name: selectedPatient.name,
        age: selectedPatient.age,
        phone: selectedPatient.phone,
        address: selectedPatient.address,
        profession: selectedPatient.profession || selectedPatient.job,
        diseases: selectedPatient.diseases,
      });
      
      setIsEditingPatient(false);
      alert("✅ Informations patient mises à jour avec succès !");
    } catch (error) {
      console.error("❌ Erreur mise à jour patient:", error);
      alert("❌ Erreur lors de la mise à jour du patient");
    }
  };

  // ============================================
  // ENREGISTRER UNE NOUVELLE CONSULTATION
  // ============================================
  const handleSaveConsultation = async () => {
    if (!selectedPatient || !selectedAppointmentId) return;
    
    try {
      // Vérifier si une consultation existe déjà pour ce rendez-vous
      const existingConsult = supabaseConsultations.find(
        c => c.appointment_id === selectedAppointmentId
      );
      
      if (existingConsult) {
        // Mettre à jour la consultation existante
        await updateConsultation(existingConsult.id, {
          prescription: newConsultation.prescription,
          analysis: newConsultation.analysis,
          imaging: newConsultation.imaging,
          notes: newConsultation.notes,
        });
      } else {
        // Créer une nouvelle consultation
        const consultationData = {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name,
          doctor_id: doctorId,
          appointment_id: selectedAppointmentId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].slice(0, 5),
          prescription: newConsultation.prescription,
          analysis: newConsultation.analysis,
          imaging: newConsultation.imaging,
          notes: newConsultation.notes,
          modification_history: [],
        };
        
        await createConsultation(consultationData);
      }
      
      alert("✅ Consultation enregistrée avec succès !");
      
      // Réinitialiser
      setNewConsultation({
        prescription: "",
        analysis: "",
        imaging: "",
        notes: "",
      });
      setSelectedAppointmentId(null);
      setSelectedPatient(null);
      setSelectedConsultation(null);
    } catch (error) {
      console.error("❌ Erreur enregistrement consultation:", error);
      alert("❌ Erreur lors de l'enregistrement de la consultation");
    }
  };

  // ============================================
  // IMPRESSION DE DOCUMENTS
  // ============================================
  const handleOpenPrintDocument = (
    type: "prescription" | "analysis" | "imaging" | "referral",
    content: string,
    consultationIndex?: number,
    specialty?: string
  ) => {
    setPrintDocument({
      type,
      content,
      consultationIndex,
      isHistorical: consultationIndex !== undefined,
      specialty,
    });
  };

  // ============================================
  // MODIFICATION D'UN DOCUMENT HISTORIQUE
  // ============================================
  const handleDocumentModified = async (
    modifiedContent: string,
    consultationId?: string,
  ) => {
    if (!consultationId) return;
    
    try {
      const updates: any = {};
      
      if (printDocument?.type === "prescription") {
        updates.prescription = modifiedContent;
      } else if (printDocument?.type === "analysis") {
        updates.analysis = modifiedContent;
      } else if (printDocument?.type === "imaging") {
        updates.imaging = modifiedContent;
      }
      
      // Ajouter à l'historique de modifications
      const modificationEntry = {
        date: new Date().toISOString(),
        modifiedBy: doctorProfile.name,
        changes: `Modification de ${printDocument?.type}`,
      };
      
      // Récupérer la consultation actuelle
      const currentConsult = await consultationService.getById(consultationId);
      const currentHistory = currentConsult.modification_history || [];
      
      updates.modification_history = [...currentHistory, modificationEntry];
      
      await updateConsultation(consultationId, updates);
      
      // Recharger les données du patient
      if (selectedPatient) {
        await loadPatientData(selectedPatient.id);
      }
      
      alert("✅ Document modifié et enregistré dans l'historique !");
    } catch (error) {
      console.error("❌ Erreur modification document:", error);
      alert("❌ Erreur lors de la modification du document");
    }
  };

  // ============================================
  // GÉRER LES MALADIES
  // ============================================
  const handleDiseasesChanged = (diseases: any[]) => {
    if (!selectedPatient) return;
    
    setSelectedPatient({
      ...selectedPatient,
      diseases: diseases,
    });
  };

  // ============================================
  // ASSISTANT IA (SIMPLIFIÉ)
  // ============================================
  const handleAIAssistant = (query: string) => {
    const responses: { [key: string]: string } = {
      "examens nouveau patient":
        "Pour un nouveau patient, je recommande :\\n- Bilan sanguin complet\\n- ECG si >40 ans\\n- Tension artérielle\\n- Glycémie à jeun",
      hypertension:
        "L'hypertension peut être traitée par :\\n- Modification du mode de vie\\n- IEC ou ARA2 en première intention\\n- Surveillance régulière",
      ordonnance:
        "Ordonnance type générée :\\n\\nParacétamol 1g - 3x/jour pendant 5 jours\\nIbuprofène 400mg - si douleurs intenses\\n\\nÀ adapter selon le cas clinique.",
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }
    return "Je peux vous aider avec :\\n- Propositions d'examens\\n- Informations sur les maladies\\n- Génération d'ordonnances\\n- Résumé du dossier patient";
  };

  // ============================================
  // GESTION DES FICHIERS (À IMPLÉMENTER AVEC SUPABASE STORAGE)
  // ============================================
  const handleUploadFile = async (fileName: string, fileType: string, file: File) => {
    // TODO: Implémenter l'upload vers Supabase Storage
    console.log("Upload fichier:", fileName, fileType, file);
    alert("⚠️ Upload de fichiers - À implémenter avec Supabase Storage");
  };

  const handleRenameFile = async (fileId: string) => {
    // TODO: Implémenter
    alert("⚠️ Renommer fichier - À implémenter");
  };

  const handleDeleteFile = async (fileId: string) => {
    // TODO: Implémenter
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      alert("⚠️ Suppression fichier - À implémenter");
    }
  };

  // ============================================
  // CRÉER UNE LETTRE D'ORIENTATION
  // ============================================
  const handleCreateReferral = async (type: 'print' | 'digital') => {
    if (!selectedPatient) return;
    
    try {
      const referralData: any = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.name,
        patient_phone: selectedPatient.phone,
        patient_age: selectedPatient.age,
        patient_gender: selectedPatient.gender,
        patient_address: selectedPatient.address,
        from_doctor_id: doctorId,
        from_doctor_name: doctorProfile.name,
        specialty: selectedSpecialty || "Généraliste",
        type: type,
        content: referralLetterContent,
        reason: newConsultation.notes || "Consultation spécialisée requise",
        consultation_id: selectedAppointmentId,
        status: type === 'print' ? 'pending' : 'sent',
      };
      
      if (type === 'digital' && selectedDoctor) {
        referralData.to_doctor_id = selectedDoctor.id;
        referralData.to_doctor_name = selectedDoctor.name;
      } else {
        // Pour les lettres imprimables, le nom est saisi manuellement
        referralData.to_doctor_name = "Dr. [Nom à compléter]";
      }
      
      const newReferral = await referralService.create(referralData);
      
      alert(`✅ Lettre d'orientation ${type === 'print' ? 'créée' : 'envoyée'} avec succès !`);
      
      // Réinitialiser
      setShowReferralTypeSelector(false);
      setShowDoctorsList(false);
      setSelectedSpecialty(null);
      setSelectedDoctor(null);
      setReferralLetterContent("");
      
      // Recharger les orientations du patient
      if (selectedPatient) {
        await loadPatientData(selectedPatient.id);
      }
    } catch (error) {
      console.error("❌ Erreur création lettre:", error);
      alert("❌ Erreur lors de la création de la lettre d'orientation");
    }
  };

  // ============================================
  // CHARGEMENT
  // ============================================
  if (appointmentsLoading || consultationsLoading || patientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-6">
      {!selectedAppointmentId ? (
        <>
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-gray-900 mb-4">
              {t('consultations_confirmed')}
            </h3>
            <p className="text-gray-600">
              {todayAppointments.length} consultation(s) confirmée(s) aujourd'hui
            </p>
          </div>

          {/* Liste des consultations */}
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-gray-900 mb-2">Aucune consultation aujourd'hui</h4>
                <p className="text-gray-600">Les rendez-vous confirmés apparaîtront ici</p>
              </div>
            ) : (
              todayAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAppointmentClick(appointment)}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        {appointment.patient_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900">
                            {appointment.patient_name}
                          </h4>
                          {appointment.type === 'consultation' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Consultation
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.date} à {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Informations patient */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Dossier patient</h3>
              <div className="flex gap-2">
                {!isEditingPatient ? (
                  <button
                    onClick={() => setIsEditingPatient(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <button
                    onClick={handleUpdatePatient}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    Enregistrer
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAppointmentId(null);
                    setSelectedPatient(null);
                    setSelectedConsultation(null);
                    setIsEditingPatient(false);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Retour
                </button>
              </div>
            </div>

            {selectedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  {isEditingPatient ? (
                    <input
                      type="text"
                      value={selectedPatient.name}
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedPatient.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Âge</p>
                  {isEditingPatient ? (
                    <input
                      type="number"
                      value={selectedPatient.age}
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          age: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedPatient.age} ans</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                  {isEditingPatient ? (
                    <input
                      type="tel"
                      value={selectedPatient.phone}
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedPatient.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profession</p>
                  {isEditingPatient ? (
                    <input
                      type="text"
                      value={selectedPatient.profession || selectedPatient.job || ""}
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          profession: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedPatient.profession || selectedPatient.job || "N/A"}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Maladies chroniques */}
          {selectedPatient && (
            <ChronicDiseasesSelector
              selectedDiseases={selectedPatient.diseases || []}
              onChange={handleDiseasesChanged}
              label="Maladies chroniques"
              isEditing={isEditingPatient}
            />
          )}

          {/* Historique des consultations */}
          {selectedPatient && selectedPatient.consultations && selectedPatient.consultations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="text-gray-900 mb-4">Historique médical</h4>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {selectedPatient.consultations.map((consult: any, i: number) => (
                  <motion.div
                    key={consult.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">{consult.date}</p>
                      <div className="flex gap-2">
                        {consult.prescription && (
                          <button
                            onClick={() =>
                              handleOpenPrintDocument(
                                "prescription",
                                consult.prescription,
                                i
                              )
                            }
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Imprimer ordonnance"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {consult.analysis && (
                          <button
                            onClick={() =>
                              handleOpenPrintDocument(
                                "analysis",
                                consult.analysis,
                                i
                              )
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Imprimer analyses"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {consult.imaging && (
                          <button
                            onClick={() =>
                              handleOpenPrintDocument(
                                "imaging",
                                consult.imaging,
                                i
                              )
                            }
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Imprimer imagerie"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {consult.prescription && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Ordonnance:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {consult.prescription}
                        </p>
                      </div>
                    )}
                    {consult.analysis && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Analyses:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {consult.analysis}
                        </p>
                      </div>
                    )}
                    {consult.imaging && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Imagerie:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {consult.imaging}
                        </p>
                      </div>
                    )}
                    {consult.notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{consult.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Historique des orientations */}
          {selectedPatient && (
            <ReferralsHistory
              referrals={patientReferrals}
              onViewReferral={(referral) => {
                console.log("Voir orientation:", referral);
                // TODO: Ouvrir le modal de détails
              }}
            />
          )}

          {/* Nouvelle consultation */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h4 className="text-gray-900 mb-4">Nouvelle consultation</h4>
            
            <div className="space-y-4">
              {/* Ordonnance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-500" />
                    Ordonnance
                  </label>
                  <button
                    onClick={() =>
                      handleOpenPrintDocument(
                        "prescription",
                        newConsultation.prescription
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    disabled={!newConsultation.prescription}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
                <textarea
                  value={newConsultation.prescription}
                  onChange={(e) =>
                    setNewConsultation({
                      ...newConsultation,
                      prescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none min-h-[120px]"
                  placeholder="Médicaments prescrits..."
                />
              </div>

              {/* Analyses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-green-500" />
                    Analyses médicales
                  </label>
                  <button
                    onClick={() =>
                      handleOpenPrintDocument(
                        "analysis",
                        newConsultation.analysis
                      )
                    }
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                    disabled={!newConsultation.analysis}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
                <textarea
                  value={newConsultation.analysis}
                  onChange={(e) =>
                    setNewConsultation({
                      ...newConsultation,
                      analysis: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none min-h-[120px]"
                  placeholder="Analyses à effectuer..."
                />
              </div>

              {/* Imagerie */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    Imagerie médicale
                  </label>
                  <button
                    onClick={() =>
                      handleOpenPrintDocument(
                        "imaging",
                        newConsultation.imaging
                      )
                    }
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    disabled={!newConsultation.imaging}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
                <textarea
                  value={newConsultation.imaging}
                  onChange={(e) =>
                    setNewConsultation({
                      ...newConsultation,
                      imaging: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none min-h-[120px]"
                  placeholder="Examens d'imagerie..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Notes complémentaires
                </label>
                <textarea
                  value={newConsultation.notes}
                  onChange={(e) =>
                    setNewConsultation({
                      ...newConsultation,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none min-h-[100px]"
                  placeholder="Notes additionnelles..."
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveConsultation}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                  Enregistrer la consultation
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReferralDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl"
                >
                  <Send className="w-4 h-4" />
                  Lettre d'orientation
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  Assistant IA
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Referral letter dialog - FLUX CORRECT: Spécialité PUIS Type */}
      <AnimatePresence>
        {showReferralDialog && selectedPatient && (
          <MedicalSpecialtiesSelector
            onSelect={(specialty) => {
              setSelectedSpecialty(specialty);
              setShowReferralDialog(false);
              setShowReferralTypeSelector(true);
              
              // Préparer le contenu de la lettre
              const content = `Cher confrère ${specialty},\n\nJe vous adresse mon patient ${selectedPatient.name}, âgé de ${selectedPatient.age} ans, pour un examen spécialisé et un avis médical.\n\nAntécédents médicaux :\n${selectedPatient.diseases?.map((d: any) => `- ${d.name}${d.isChronic ? ' (chronique)' : ''}`).join('\n') || '- Aucun'}\n\nMotif de l'orientation :\n${newConsultation.notes || '[À compléter]'}\n\nJe vous remercie de bien vouloir examiner ce patient et me tenir informé de vos conclusions.\n\nAvec mes sentiments confraternels les meilleurs.`;
              setReferralLetterContent(content);
            }}
            onCancel={() => setShowReferralDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal: Sélecteur de type de lettre d'orientation */}
      {showReferralTypeSelector && (
        <ReferralTypeSelector
          onSelectType={(type) => {
            if (type === 'digital') {
              setShowDoctorsList(true);
            } else {
              handleCreateReferral('print');
            }
            setShowReferralTypeSelector(false);
          }}
          onClose={() => setShowReferralTypeSelector(false)}
        />
      )}

      {/* Modal: Liste des médecins */}
      {showDoctorsList && (
        <DoctorsList
          specialty={selectedSpecialty || ""}
          onSelectDoctor={(doctor) => {
            setSelectedDoctor(doctor);
            setShowDoctorsList(false);
            handleCreateReferral('digital');
          }}
          onClose={() => setShowDoctorsList(false)}
        />
      )}

      {/* Modal: Assistant IA */}
      {showAIAssistant && (
        <AIAssistant
          onClose={() => setShowAIAssistant(false)}
          onGenerate={handleAIAssistant}
        />
      )}

      {/* Modal: Document imprimable */}
      {printDocument && (
        <PrintableDocument
          type={printDocument.type}
          content={printDocument.content}
          patientName={selectedPatient?.name || ""}
          doctorName={doctorProfile.name}
          doctorInfo={{
            name: doctorProfile.name,
            specialty: doctorProfile.specialty || "Médecin généraliste",
            address: doctorProfile.address || "",
            phone: doctorProfile.phone || "",
          }}
          specialty={printDocument.specialty}
          onClose={() => setPrintDocument(null)}
          onModify={(modifiedContent, consultationId) =>
            handleDocumentModified(modifiedContent, consultationId)
          }
          isHistorical={printDocument.isHistorical}
          consultationIndex={printDocument.consultationIndex}
        />
      )}
    </div>
  );
}