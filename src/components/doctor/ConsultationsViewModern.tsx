import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  FileText,
  Pill,
  Image as ImageIcon,
  FlaskConical,
  Send,
  Sparkles,
  Clock,
  Printer,
  Edit,
  Eye,
} from "lucide-react";
import { PrintableDocument } from "./PrintableDocument";
import { MedicalSpecialtiesSelector } from "./MedicalSpecialtiesSelector";
import { AIAssistant } from "./AIAssistant";

interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: "consultation" | "control";
  isNew: boolean;
  status: "confirmed";
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  phone: string;
  address: string;
  job: string;
  diseases: string[];
  consultations: {
    date: string;
    prescription: string;
    analysis: string;
    imaging: string;
    notes: string;
    modificationHistory?: {
      date: string;
      modifiedBy: string;
      changes: string;
    }[];
  }[];
  imaging: string[];
  analyses: string[];
}

interface ConsultationsViewProps {
  doctorId: string;
}

// Informations du médecin (normalement viendraient de l'API)
const doctorInfo = {
  name: "Dr. Ahmed Ben Ali",
  specialty: "Cardiologue",
  address: "Avenue Habib Bourguiba, Tunis",
  phone: "+216 98 123 456",
};

export function ConsultationsView({
  doctorId,
}: ConsultationsViewProps) {
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);
  const [isEditingPatient, setIsEditingPatient] =
    useState(false);
  const [newConsultation, setNewConsultation] = useState({
    prescription: "",
    analysis: "",
    imaging: "",
    notes: "",
    referralLetter: "",
  });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showReferralDialog, setShowReferralDialog] =
    useState(false);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState("");
  const [printDocument, setPrintDocument] = useState<{
    type: "prescription" | "analysis" | "imaging" | "referral";
    content: string;
    specialty?: string;
    consultationIndex?: number;
    isHistorical?: boolean;
  } | null>(null);

  const consultations: Consultation[] = [
    {
      id: "1",
      patientId: "p1",
      patientName: "Mohamed Gharbi",
      date: "2024-12-11",
      time: "09:00",
      type: "consultation",
      isNew: false,
      status: "confirmed",
    },
    {
      id: "2",
      patientId: "p2",
      patientName: "Youssef Hamdi",
      date: "2024-12-11",
      time: "11:00",
      type: "consultation",
      isNew: true,
      status: "confirmed",
    },
    {
      id: "3",
      patientId: "p3",
      patientName: "Amira Ben Said",
      date: "2024-12-10",
      time: "14:00",
      type: "control",
      isNew: false,
      status: "confirmed",
    },
  ];

  const [patients, setPatients] = useState<{
    [key: string]: Patient;
  }>({\n    p1: {
      id: "p1",
      name: "Mohamed Gharbi",
      age: 45,
      gender: "male",
      phone: "+216 98 123 456",
      address: "Avenue Bourguiba, Tunis",
      job: "Enseignant",
      diseases: ["Hypertension", "Diabète type 2"],
      consultations: [
        {
          date: "2024-11-15",
          prescription:
            "Metformine 500mg - 2x/jour\\nRamipril 5mg - 1x/jour",
          analysis: "Glycémie à jeun\\nHbA1c",
          imaging: "",
          notes: "Patient stable, contrôle dans 3 mois",
        },
      ],
      imaging: ["IRM cérébrale (2024-10-20)"],
      analyses: [
        "Glycémie à jeun (2024-11-10)",
        "HbA1c (2024-11-10)",
      ],
    },
    p2: {
      id: "p2",
      name: "Youssef Hamdi",
      age: 28,
      gender: "male",
      phone: "+216 55 321 789",
      address: "Rue de la République, Sfax",
      job: "Ingénieur",
      diseases: [],
      consultations: [],
      imaging: [],
      analyses: [],
    },
    p3: {
      id: "p3",
      name: "Amira Ben Said",
      age: 35,
      gender: "female",
      phone: "+216 22 987 654",
      address: "Boulevard 7 Novembre, Sousse",
      job: "Pharmacienne",
      diseases: ["Migraine chronique"],
      consultations: [
        {
          date: "2024-10-05",
          prescription: "Sumatriptan 50mg - en cas de crise",
          analysis: "",
          imaging: "",
          notes: "Fréquence des crises en diminution",
        },
      ],
      imaging: [],
      analyses: [],
    },
  });

  const handleConsultationClick = (
    consultation: Consultation,
  ) => {
    setSelectedConsultation(consultation);
    setSelectedPatient(patients[consultation.patientId]);
  };

  const handleUpdatePatient = () => {
    if (selectedPatient) {
      setPatients({
        ...patients,
        [selectedPatient.id]: selectedPatient,
      });
      setIsEditingPatient(false);
      alert("Informations patient mises à jour avec succès !");
    }
  };

  const handleSaveConsultation = () => {
    if (selectedPatient && selectedConsultation) {
      const updatedPatient = {
        ...selectedPatient,
        consultations: [
          ...selectedPatient.consultations,
          {
            date: new Date().toISOString().split("T")[0],
            prescription: newConsultation.prescription,
            analysis: newConsultation.analysis,
            imaging: newConsultation.imaging,
            notes: newConsultation.notes,
          },
        ],
      };

      setPatients({
        ...patients,
        [selectedPatient.id]: updatedPatient,
      });

      alert("Consultation enregistrée avec succès !");
      setNewConsultation({
        prescription: "",
        analysis: "",
        imaging: "",
        notes: "",
        referralLetter: "",
      });
      setSelectedConsultation(null);
      setSelectedPatient(null);
    }
  };

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

  const handleDocumentModified = (modifiedContent: string, wasModified: boolean) => {
    if (wasModified && printDocument && printDocument.isHistorical && selectedPatient) {
      const updatedPatient = { ...selectedPatient };
      const consultation = updatedPatient.consultations[printDocument.consultationIndex!];
      
      const currentDate = new Date().toLocaleDateString('fr-FR');
      const currentUser = doctorInfo.name;
      
      if (!consultation.modificationHistory) {
        consultation.modificationHistory = [];
      }
      
      consultation.modificationHistory.push({
        date: currentDate,
        modifiedBy: currentUser,
        changes: `Document ${printDocument.type === 'prescription' ? 'ordonnance' : printDocument.type === 'analysis' ? 'analyses' : printDocument.type === 'imaging' ? 'imagerie' : 'lettre d\\'orientation'} modifié avant impression`,
      });
      
      if (printDocument.type === 'prescription') {
        consultation.prescription = modifiedContent;
      } else if (printDocument.type === 'analysis') {
        consultation.analysis = modifiedContent;
      } else if (printDocument.type === 'imaging') {
        consultation.imaging = modifiedContent;
      }
      
      setPatients({
        ...patients,
        [selectedPatient.id]: updatedPatient,
      });
      
      alert(`✅ Document modifié et historique enregistré !\\n\\n📝 Modification par: ${currentUser}\\n📅 Date: ${currentDate}`);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedConsultation ? (
        <>
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-gray-900 mb-4">
              Consultations confirmées
            </h3>
            <p className="text-gray-600">
              Liste des rendez-vous confirmés, classés du plus
              récent au plus ancien
            </p>
          </div>

          {/* Consultations list */}
          <div className="space-y-4">
            {consultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  handleConsultationClick(consultation)
                }
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                      {consultation.patientName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900">
                          {consultation.patientName}
                        </h4>
                        {consultation.isNew && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Nouveau patient
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {consultation.date} à{" "}
                          {consultation.time}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            consultation.type === "consultation"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {consultation.type === "consultation"
                            ? "Consultation"
                            : "Contrôle"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Patient info section */}
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
                    setSelectedConsultation(null);
                    setSelectedPatient(null);
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
                  <p className="text-sm text-gray-600 mb-1">
                    Nom
                  </p>
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
                    <p className="text-gray-900">
                      {selectedPatient.name}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Âge
                  </p>
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
                    <p className="text-gray-900">
                      {selectedPatient.age} ans
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Téléphone
                  </p>
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
                    <p className="text-gray-900">
                      {selectedPatient.phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Profession
                  </p>
                  {isEditingPatient ? (
                    <input
                      type="text"
                      value={selectedPatient.job}
                      onChange={(e) =>
                        setSelectedPatient({
                          ...selectedPatient,
                          job: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {selectedPatient.job}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Medical history - Diseases */}
          {selectedPatient &&
            selectedPatient.diseases.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-gray-900 mb-4">
                  Maladies chroniques
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.diseases.map(
                    (disease, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {disease}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Previous consultations timeline */}
          {selectedPatient &&
            selectedPatient.consultations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-gray-900 mb-4">
                  Historique médical
                </h4>
                <div className="space-y-4">
                  {selectedPatient.consultations.map(
                    (consult, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">
                            {consult.date}
                          </p>
                          <div className="flex gap-2">
                            {consult.prescription && (
                              <button
                                onClick={() =>
                                  handleOpenPrintDocument(
                                    'prescription',
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
                                    'analysis',
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
                                    'imaging',
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
                            <p className="text-sm text-gray-700">
                              <strong>Ordonnance:</strong>
                            </p>
                            <p className="text-gray-900 whitespace-pre-line">
                              {consult.prescription}
                            </p>
                          </div>
                        )}
                        {consult.analysis && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700">
                              <strong>Analyses:</strong>
                            </p>
                            <p className="text-gray-900 whitespace-pre-line">
                              {consult.analysis}
                            </p>
                          </div>
                        )}
                        {consult.imaging && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700">
                              <strong>Imagerie:</strong>
                            </p>
                            <p className="text-gray-900 whitespace-pre-line">
                              {consult.imaging}
                            </p>
                          </div>
                        )}
                        {consult.notes && (
                          <p className="text-sm text-gray-600 italic">
                            {consult.notes}
                          </p>
                        )}
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* New consultation form */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-gray-900">
                Nouvelle consultation
              </h4>
              <div className="flex gap-2">
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
                  onClick={() =>
                    setShowAIAssistant(!showAIAssistant)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  Assistant IA
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Prescription */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Ordonnance
                  </label>
                  {newConsultation.prescription && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          'prescription',
                          newConsultation.prescription
                        )
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimer
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={newConsultation.prescription}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        prescription: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Nom du médicament - Posologie&#10;..."
                  />
                </div>
              </div>

              {/* Analysis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Analyses demandées
                  </label>
                  {newConsultation.analysis && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          'analysis',
                          newConsultation.analysis
                        )
                      }
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimer
                    </button>
                  )}
                </div>
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={newConsultation.analysis}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        analysis: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Bilan sanguin complet&#10;Glycémie à jeun&#10;..."
                  />
                </div>
              </div>

              {/* Imaging */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Imagerie demandée
                  </label>
                  {newConsultation.imaging && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          'imaging',
                          newConsultation.imaging
                        )
                      }
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimer
                    </button>
                  )}
                </div>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={newConsultation.imaging}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        imaging: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="IRM, Scanner, Radio..."
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newConsultation.notes}
                  onChange={(e) =>
                    setNewConsultation({
                      ...newConsultation,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Notes cliniques..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveConsultation}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl"
              >
                Enregistrer la consultation
              </motion.button>
            </div>
          </div>

          {/* AI Assistant Component */}
          <AnimatePresence>
            {showAIAssistant && selectedPatient && (
              <AIAssistant
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
                patientHistory={selectedPatient.consultations.map(c => `${c.date}: ${c.notes}`).join('\n')}
                onClose={() => setShowAIAssistant(false)}
              />
            )}
          </AnimatePresence>

          {/* Referral letter dialog */}
          <AnimatePresence>
            {showReferralDialog && selectedPatient && (
              <MedicalSpecialtiesSelector
                onSelect={(specialty) => {
                  const referralContent = `Cher confrère ${specialty},\n\nJe vous adresse ce patient pour un examen spécialisé et un avis médical.\n\nJe vous remercie de bien vouloir examiner ce patient et me tenir informé de vos conclusions.\n\nAvec mes sentiments confraternels les meilleurs.`;
                  handleOpenPrintDocument('referral', referralContent, undefined, specialty);
                  setShowReferralDialog(false);
                }}
                onCancel={() => setShowReferralDialog(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Print Document Modal */}
      <AnimatePresence>
        {printDocument && selectedPatient && (
          <PrintableDocument
            type={printDocument.type}
            patientName={selectedPatient.name}
            doctorInfo={doctorInfo}
            initialContent={printDocument.content}
            specialty={printDocument.specialty || doctorInfo.specialty}
            onClose={() => setPrintDocument(null)}
            onContentChanged={handleDocumentModified}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
