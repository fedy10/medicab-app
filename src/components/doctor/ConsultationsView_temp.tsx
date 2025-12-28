import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Pill,
  Image as ImageIcon,
  FlaskConical,
  Send,
  Sparkles,
  Clock,
  Printer,
  Edit,
} from "lucide-react";
import { PrintableDocument } from "./PrintableDocument";
import { MedicalSpecialtiesSelector } from "./MedicalSpecialtiesSelector";
import { AIAssistant } from "./AIAssistant";
import {
  Glasses,
  Ear,
  Activity,
  Brain,
  Bone,
  Stethoscope,
} from "lucide-react";

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
  }>({
    p1: {
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
            "Metformine 500mg - 2x/jour\nRamipril 5mg - 1x/jour",
          analysis: "Glycémie à jeun\nHbA1c",
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
        changes: `Document ${printDocument.type === 'prescription' ? 'ordonnance' : printDocument.type === 'analysis' ? 'analyses' : printDocument.type === 'imaging' ? 'imagerie' : 'lettre d\'orientation'} modifié avant impression`,
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
      
      alert(`✅ Document modifié et historique enregistré !\n\n📝 Modification par: ${currentUser}\n📅 Date: ${currentDate}`);
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
          {/* Patient info, medical history, and consultation form similar to above... */}
          
          {/* AI Assistant panel - Now using the real component! */}
          <AnimatePresence>
            {showAIAssistant && selectedPatient && (
              <AIAssistant
                doctorId={doctorId}
                patientContext={{
                  name: selectedPatient.name,
                  age: selectedPatient.age,
                  diseases: selectedPatient.diseases,
                  lastConsultation: selectedPatient.consultations.length > 0 
                    ? selectedPatient.consultations[selectedPatient.consultations.length - 1].notes
                    : undefined
                }}
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
