import { ModernFileUploader } from "./ModernFileUploader";
import { ReferralTypeSelector } from "./ReferralTypeSelector";
import { DoctorsList } from "./DoctorsList";
import { PatientReferralChat } from "./PatientReferralChat";
import { ReferralsHistory } from "./ReferralsHistory";
import { PaginationComponent } from "../ui/PaginationComponent";
import { useLanguage } from "../../contexts/LanguageContext";

import { useState } from "react";
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
} from "lucide-react";
import { PrintableDocument } from "./PrintableDocument";
import { MedicalSpecialtiesSelector } from "./MedicalSpecialtiesSelector";
import { AIAssistant } from "./AIAssistant";
import { ChronicDiseasesSelector } from "../ui/ChronicDiseasesSelector";

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

interface Disease {
  name: string;
  isChronic: boolean;
  category?: string;
}

interface PatientFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  phone: string;
  address: string;
  job: string;
  diseases: Disease[];
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
  files: PatientFile[];
  referrals?: Referral[];
}

interface Referral {
  id: string;
  specialty: string;
  type: 'printable' | 'digital';
  referringDoctorName?: string;
  receivingDoctorId?: string;
  receivingDoctorName?: string;
  date: string;
  status?: 'pending' | 'viewed' | 'responded';
  unreadMessages?: number;
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

// Spécialités médicales avec icônes
const medicalSpecialties = [
  {
    name: "Ophtalmologue",
    icon: Glasses,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "ORL",
    icon: Ear,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Orthophoniste",
    icon: Activity,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Neurologue",
    icon: Brain,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Cardiologue",
    icon: Activity,
    color: "from-red-500 to-pink-500",
  },
  {
    name: "Orthopédiste",
    icon: Bone,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Pédiatre",
    icon: Stethoscope,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Généraliste",
    icon: Stethoscope,
    color: "from-gray-500 to-slate-500",
  },
];

export function ConsultationsView({
  doctorId,
}: ConsultationsViewProps) {
  const { t } = useLanguage();
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
  const [aiQuery, setAiQuery] = useState("");
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showFileUploader, setShowFileUploader] = useState(false);
  
  // New states for digital referral
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showReferralTypeSelector, setShowReferralTypeSelector] = useState(false);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [showPatientReferralChat, setShowPatientReferralChat] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [referralLetterContent, setReferralLetterContent] = useState("");

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
      diseases: [
        { name: "Hypertension artérielle", isChronic: true, category: "cardiovascular" },
        { name: "Diabète de type 2", isChronic: true, category: "metabolic" },
      ],
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
      files: [
        {
          id: 'file-1',
          name: 'Résultats_IRM_20241015.pdf',
          type: 'IRM',
          uploadDate: '15/10/2024',
          uploadedBy: 'Secrétaire',
          size: '2.4 MB',
        },
        {
          id: 'file-2',
          name: 'Analyses_sang_20241110.pdf',
          type: 'Analyse',
          uploadDate: '10/11/2024',
          uploadedBy: 'Dr. Ben Ali',
          size: '1.1 MB',
        },
      ],
      referrals: [
        {
          id: 'ref1',
          specialty: 'Cardiologie',
          type: 'digital',
          receivingDoctorId: 'dr-cardio-1',
          receivingDoctorName: 'Dr. Ahmed Benali',
          date: '2024-12-15',
          status: 'responded',
          unreadMessages: 2,
        },
        {
          id: 'ref2',
          specialty: 'Neurologie',
          type: 'printable',
          receivingDoctorName: 'Dr. Leila Mansouri',
          date: '2024-11-28',
        },
        {
          id: 'ref3',
          specialty: 'Ophtalmologie',
          type: 'digital',
          receivingDoctorId: 'dr-ophtalmo-1',
          receivingDoctorName: 'Dr. Sami Trabelsi',
          date: '2024-12-20',
          status: 'pending',
          unreadMessages: 1,
        },
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
      files: [],
    },
    p3: {
      id: "p3",
      name: "Amira Ben Said",
      age: 35,
      gender: "female",
      phone: "+216 22 987 654",
      address: "Boulevard 7 Novembre, Sousse",
      job: "Pharmacienne",
      diseases: [
        { name: "Migraine chronique", isChronic: true, category: "neurological" },
      ],
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
      files: [],
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

  const handleDocumentModified = (
    modifiedContent: string,
    consultationIndex?: number,
    isHistorical?: boolean,
  ) => {
    if (!selectedPatient) return;

    if (consultationIndex !== undefined) {
      const updatedPatient = { ...selectedPatient };
      const consultation =
        updatedPatient.consultations[consultationIndex];

      if (printDocument?.type === "prescription") {
        consultation.prescription = modifiedContent;
      } else if (printDocument?.type === "analysis") {
        consultation.analysis = modifiedContent;
      } else if (printDocument?.type === "imaging") {
        consultation.imaging = modifiedContent;
      }

      setSelectedPatient(updatedPatient);
      alert(
        "✅ Document modifié et enregistré dans l'historique !",
      );
    }
  };

  const handleDiseasesChanged = (diseases: Disease[]) => {
    if (!selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      diseases: diseases,
    };
    
    setSelectedPatient(updatedPatient);
    alert("✅ Maladies mises à jour avec succès !");
  };

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

  const handleUploadFile = (fileName: string, fileType: string, file: File) => {
    if (selectedPatient) {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
      };

      const fileExtension = file.name.split('.').pop() || 'pdf';
      const fullFileName = `${fileName}.${fileExtension}`;

      const newFile: PatientFile = {
        id: `file-${Date.now()}`,
        name: fullFileName,
        type: fileType,
        uploadDate: new Date().toLocaleDateString('fr-FR'),
        uploadedBy: doctorInfo.name,
        size: formatFileSize(file.size),
      };

      const updatedPatient = {
        ...selectedPatient,
        files: [...selectedPatient.files, newFile],
      };

      setPatients({
        ...patients,
        [selectedPatient.id]: updatedPatient,
      });
      setSelectedPatient(updatedPatient);
    }
  };

  const handleRenameFile = (fileId: string) => {
    if (selectedPatient && newFileName.trim()) {
      const updatedFiles = selectedPatient.files.map(file =>
        file.id === fileId ? { ...file, name: newFileName.trim() } : file
      );

      const updatedPatient = {
        ...selectedPatient,
        files: updatedFiles,
      };

      setPatients({
        ...patients,
        [selectedPatient.id]: updatedPatient,
      });
      setSelectedPatient(updatedPatient);
      setEditingFileName(null);
      setNewFileName('');
      alert('✅ Fichier renommé avec succès !');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (selectedPatient && confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const updatedFiles = selectedPatient.files.filter(file => file.id !== fileId);

      const updatedPatient = {
        ...selectedPatient,
        files: updatedFiles,
      };

      setPatients({
        ...patients,
        [selectedPatient.id]: updatedPatient,
      });
      setSelectedPatient(updatedPatient);
      alert('✅ Fichier supprimé avec succès !');
    }
  };

  return (
    <div className="space-y-6">
      {!selectedConsultation ? (
        <>
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-gray-900 mb-4">
              {t('consultations_confirmed')}
            </h3>
            <p className="text-gray-600">
              {t('confirmed_appointments_list')}
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
          {/* Patient info */}
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

          {/* Medical history */}
          {selectedPatient && (
            <ChronicDiseasesSelector
              selectedDiseases={selectedPatient.diseases}
              onChange={handleDiseasesChanged}
              label="Maladies chroniques"
              isEditing={isEditingPatient}
            />
          )}

          {/* Previous consultations timeline */}
          {selectedPatient &&
            selectedPatient.consultations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-gray-900 mb-4">
                  Historique médical
                </h4>
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
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
                                    "prescription",
                                    consult.prescription,
                                    i,
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
                                    i,
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
                                    i,
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
                              <strong>{t('prescription_label')}:</strong>
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

          {/* Referrals History */}
          {selectedPatient && selectedPatient.referrals && selectedPatient.referrals.length > 0 && (
            <ReferralsHistory
              referrals={selectedPatient.referrals}
              onOpenPrintable={(referral) => {
                const content = `Cher confrère ${referral.specialty},\n\nJe vous adresse mon patient ${selectedPatient.name}, âgé de ${selectedPatient.age} ans.\n\nCordiales salutations.`;
                handleOpenPrintDocument('referral', content, undefined, referral.specialty);
              }}
              onOpenDigitalChat={(referral) => {
                // Ouvrir le chat avec le médecin
                setSelectedSpecialty(referral.specialty);
                setSelectedDoctor({
                  id: referral.receivingDoctorId,
                  name: referral.receivingDoctorName,
                  specialty: referral.specialty,
                });
                setReferralLetterContent(`Cher confrère ${referral.specialty},\n\nJe vous adresse mon patient ${selectedPatient.name}, âgé de ${selectedPatient.age} ans.\n\nCordiales salutations.`);
                setShowPatientReferralChat(true);
              }}
            />
          )}

          {/* Patient Files Section */}
          {selectedPatient && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-900">Fichiers attachés</h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFileUploader(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  Ajouter un fichier
                </motion.button>
              </div>

              {selectedPatient.files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Aucun fichier attaché</p>
                  <p className="text-sm mt-1">Cliquez sur "Ajouter un fichier" pour commencer</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPatient.files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-all hover:shadow-md group relative"
                      >
                        {/* Tooltip au survol */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 whitespace-nowrap max-w-xs truncate">
                          {file.name}
                        </div>

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingFileName === file.id ? (
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  onBlur={() => handleRenameFile(file.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameFile(file.id);
                                    if (e.key === 'Escape') {
                                      setEditingFileName(null);
                                      setNewFileName('');
                                    }
                                  }}
                                  autoFocus
                                  className="w-full px-2 py-1 border-2 border-blue-400 rounded text-sm focus:outline-none"
                                />
                              ) : (
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-0.5">{file.size}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="truncate">{file.uploadDate}</span>
                          <span className="text-blue-600 truncate ml-2">{file.uploadedBy}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => alert(`👁️ Affichage de ${file.name}\\n\\nType: ${file.type}\\nTaille: ${file.size}\\nDate: ${file.uploadDate}\\n\\n(Fonctionnalité de prévisualisation)`)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Afficher"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs">Afficher</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => alert(`📥 Téléchargement de ${file.name}`)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-xs">Télécharger</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingFileName(file.id);
                              setNewFileName(file.name);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Renommer"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-xs">Renommer</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteFile(file.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">Supprimer</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Ordonnance
                  </label>
                  {newConsultation.prescription && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          "prescription",
                          newConsultation.prescription,
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Analyses demandées
                  </label>
                  {newConsultation.analysis && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          "analysis",
                          newConsultation.analysis,
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    Imagerie demandée
                  </label>
                  {newConsultation.imaging && (
                    <button
                      onClick={() =>
                        handleOpenPrintDocument(
                          "imaging",
                          newConsultation.imaging,
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

          {/* AI Assistant panel */}
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
                  setSelectedSpecialty(specialty);
                  setShowReferralDialog(false);
                  setShowReferralTypeSelector(true);
                  
                  // Prepare referral content
                  const content = `Cher confrère ${specialty},\n\nJe vous adresse mon patient ${selectedPatient.name}, âgé de ${selectedPatient.age} ans, pour un examen spécialisé et un avis médical.\n\nAntécédents médicaux :\n${selectedPatient.diseases.map(d => `- ${d.name}${d.isChronic ? ' (chronique)' : ''}`).join('\n')}\n\nMotif de l'orientation :\n[À compléter]\n\nJe vous remercie de bien vouloir examiner ce patient et me tenir informé de vos conclusions.\n\nAvec mes sentiments confraternels les meilleurs.`;
                  setReferralLetterContent(content);
                }}
                onCancel={() => setShowReferralDialog(false)}
              />
            )}
          </AnimatePresence>

          {/* Referral Type Selector */}
          <AnimatePresence>
            {showReferralTypeSelector && selectedSpecialty && (
              <ReferralTypeSelector
                specialty={selectedSpecialty}
                onSelectPrintable={() => {
                  setShowReferralTypeSelector(false);
                  handleOpenPrintDocument('referral', referralLetterContent, undefined, selectedSpecialty);
                }}
                onSelectDigital={() => {
                  setShowReferralTypeSelector(false);
                  setShowDoctorsList(true);
                }}
                onCancel={() => {
                  setShowReferralTypeSelector(false);
                  setSelectedSpecialty(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Doctors List */}
          <AnimatePresence>
            {showDoctorsList && selectedSpecialty && (
              <DoctorsList
                specialty={selectedSpecialty}
                onSelectDoctor={(doctor) => {
                  setSelectedDoctor(doctor);
                  setShowDoctorsList(false);
                  setShowPatientReferralChat(true);
                }}
                onCancel={() => {
                  setShowDoctorsList(false);
                  setShowReferralTypeSelector(true);
                }}
              />
            )}
          </AnimatePresence>

          {/* Patient Referral Chat */}
          <AnimatePresence>
            {showPatientReferralChat && selectedDoctor && selectedPatient && selectedSpecialty && (
              <PatientReferralChat
                patient={{
                  id: selectedPatient.id,
                  name: selectedPatient.name,
                  age: selectedPatient.age,
                }}
                referringDoctor={{
                  id: doctorId,
                  name: doctorInfo.name,
                }}
                receivingDoctor={selectedDoctor}
                specialty={selectedSpecialty}
                referralLetterContent={referralLetterContent}
                patientFiles={selectedPatient.files}
                onClose={() => {
                  setShowPatientReferralChat(false);
                  setSelectedDoctor(null);
                  setSelectedSpecialty(null);
                }}
                onBack={() => {
                  setShowPatientReferralChat(false);
                  setShowDoctorsList(true);
                }}
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
            patientAge={selectedPatient.age}
            patientDiseases={selectedPatient.diseases}
            doctorInfo={doctorInfo}
            initialContent={printDocument.content}
            specialty={printDocument.specialty || doctorInfo.specialty}
            onClose={() => setPrintDocument(null)}
            onContentChanged={handleDocumentModified}
            onDiseasesChanged={handleDiseasesChanged}
          />
        )}
      </AnimatePresence>

      {/* File Uploader Modal */}
      <AnimatePresence>
        {showFileUploader && selectedPatient && (
          <ModernFileUploader
            onUpload={handleUploadFile}
            onClose={() => setShowFileUploader(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}