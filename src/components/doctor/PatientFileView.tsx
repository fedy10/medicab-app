import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Upload, Eye, Download, Trash2, Clock, Printer, Pill, FlaskConical, Image as ImageIcon } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { PrintableDocument } from './PrintableDocument';

interface PatientFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
}

interface ConsultationHistory {
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
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  job: string;
  diseases: string[];
  consultations: ConsultationHistory[];
  files: PatientFile[];
}

interface PatientFileViewProps {
  patient: Patient;
  onClose: () => void;
  canUploadFiles?: boolean; // true pour secrétaire et médecin
}

const doctorInfo = {
  name: 'Dr. Ahmed Ben Ali',
  specialty: 'Cardiologue',
  address: 'Avenue Habib Bourguiba, Tunis',
  phone: '+216 98 123 456',
};

export function PatientFileView({ patient, onClose, canUploadFiles = true }: PatientFileViewProps) {
  const [files, setFiles] = useState<PatientFile[]>(patient.files || [
    {
      id: '1',
      name: 'Résultats_IRM_20241015.pdf',
      type: 'IRM',
      uploadDate: '2024-10-15',
      uploadedBy: 'Secrétaire',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Analyses_sang_20241110.pdf',
      type: 'Analyse',
      uploadDate: '2024-11-10',
      uploadedBy: 'Dr. Ben Ali',
      size: '1.1 MB',
    },
  ]);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationHistory[]>(patient.consultations);
  const [printDocument, setPrintDocument] = useState<{
    type: 'prescription' | 'analysis' | 'imaging';
    content: string;
    consultationIndex: number;
    originalContent: string;
  } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadFile = (file: File, type: string) => {
    const newFile: PatientFile = {
      id: Date.now().toString(),
      name: file.name,
      type: type,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Utilisateur actuel',
      size: formatFileSize(file.size),
    };
    setFiles([...files, newFile]);
    alert('Fichier ajouté avec succès !');
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      setFiles(files.filter((f) => f.id !== fileId));
      alert('Fichier supprimé avec succès !');
    }
  };

  const handlePrintDocument = (
    type: 'prescription' | 'analysis' | 'imaging',
    content: string,
    consultationIndex: number
  ) => {
    setPrintDocument({
      type,
      content,
      consultationIndex,
      originalContent: content,
    });
  };

  const handleDocumentPrinted = (modifiedContent: string) => {
    if (printDocument && modifiedContent !== printDocument.originalContent) {
      // Le document a été modifié, on ajoute un historique de modification
      const updatedConsultations = [...consultations];
      const consultation = updatedConsultations[printDocument.consultationIndex];
      
      const currentDate = new Date().toLocaleDateString('fr-FR');
      const currentUser = 'Dr. Ahmed Ben Ali'; // À remplacer par l'utilisateur connecté
      
      // Créer l'historique de modification s'il n'existe pas
      if (!consultation.modificationHistory) {
        consultation.modificationHistory = [];
      }
      
      // Ajouter la modification
      consultation.modificationHistory.push({
        date: currentDate,
        modifiedBy: currentUser,
        changes: `Document ${printDocument.type === 'prescription' ? 'ordonnance' : printDocument.type === 'analysis' ? 'analyses' : 'imagerie'} modifié avant impression`,
      });
      
      // Mettre à jour le contenu
      if (printDocument.type === 'prescription') {
        consultation.prescription = modifiedContent;
      } else if (printDocument.type === 'analysis') {
        consultation.analysis = modifiedContent;
      } else if (printDocument.type === 'imaging') {
        consultation.imaging = modifiedContent;
      }
      
      setConsultations(updatedConsultations);
      
      // Afficher une notification
      alert(`Document modifié et historique enregistré !\n\nModification par: ${currentUser}\nDate: ${currentDate}`);
    }
    
    setPrintDocument(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Dossier médical complet</h2>
            <p className="text-gray-600">{patient.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Âge</p>
              <p className="text-gray-900">{patient.age} ans</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sexe</p>
              <p className="text-gray-900">{patient.gender === 'male' ? 'Homme' : 'Femme'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Profession</p>
              <p className="text-gray-900">{patient.job}</p>
            </div>
          </div>
        </div>

        {/* Diseases */}
        {patient.diseases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-900 mb-3">Maladies chroniques</h3>
            <div className="flex flex-wrap gap-2">
              {patient.diseases.map((disease, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {disease}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Consultation history */}
        <div className="mb-6">
          <h3 className="text-gray-900 mb-4">Historique des consultations</h3>
          <div className="space-y-4">
            {patient.consultations.length > 0 ? (
              patient.consultations.map((consult, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{consult.date}</p>
                    </div>
                    <div className="flex gap-2">
                      {consult.prescription && (
                        <button
                          onClick={() => handlePrintDocument('prescription', consult.prescription, i)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-sm"
                          title="Imprimer ordonnance"
                        >
                          <Pill className="w-4 h-4" />
                          <Printer className="w-3 h-3" />
                        </button>
                      )}
                      {consult.analysis && (
                        <button
                          onClick={() => handlePrintDocument('analysis', consult.analysis, i)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded flex items-center gap-1 text-sm"
                          title="Imprimer analyses"
                        >
                          <FlaskConical className="w-4 h-4" />
                          <Printer className="w-3 h-3" />
                        </button>
                      )}
                      {consult.imaging && (
                        <button
                          onClick={() => handlePrintDocument('imaging', consult.imaging, i)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded flex items-center gap-1 text-sm"
                          title="Imprimer imagerie"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Printer className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {consult.prescription && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Ordonnance:</strong>
                      </p>
                      <p className="text-gray-900 whitespace-pre-line text-sm">
                        {consult.prescription}
                      </p>
                    </div>
                  )}
                  
                  {consult.analysis && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Analyses:</strong>
                      </p>
                      <p className="text-gray-900 whitespace-pre-line text-sm">
                        {consult.analysis}
                      </p>
                    </div>
                  )}
                  
                  {consult.imaging && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Imagerie:</strong>
                      </p>
                      <p className="text-gray-900 whitespace-pre-line text-sm">
                        {consult.imaging}
                      </p>
                    </div>
                  )}
                  
                  {consult.notes && (
                    <p className="text-sm text-gray-600 italic mt-2">{consult.notes}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune consultation enregistrée</p>
            )}
          </div>
        </div>

        {/* Files section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Documents et fichiers</h3>
            {canUploadFiles && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                <Upload className="w-4 h-4" />
                Ajouter un fichier
              </motion.button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.length > 0 ? (
              files.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-600">Type: {file.type}</p>
                        <p className="text-xs text-gray-500">
                          Ajouté le {file.uploadDate} par {file.uploadedBy}
                        </p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canUploadFiles && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 col-span-2">
                Aucun fichier ajouté
              </p>
            )}
          </div>
        </div>

        {/* Upload file dialog */}
        <AnimatePresence>
          {showUploadDialog && (
            <FileUploader
              onUpload={handleUploadFile}
              onClose={() => setShowUploadDialog(false)}
            />
          )}
        </AnimatePresence>

        {/* Print document dialog */}
        <AnimatePresence>
          {printDocument && (
            <PrintableDocument
              type={printDocument.type}
              patientName={patient.name}
              doctorInfo={doctorInfo}
              initialContent={printDocument.content}
              onClose={() => setPrintDocument(null)}
              onContentChanged={(modifiedContent, wasModified) => {
                if (wasModified) {
                  // Le document a été modifié, on ajoute un historique de modification
                  const updatedConsultations = [...consultations];
                  const consultation = updatedConsultations[printDocument.consultationIndex];
                  
                  const currentDate = new Date().toLocaleDateString('fr-FR');
                  const currentUser = 'Dr. Ahmed Ben Ali'; // À remplacer par l'utilisateur connecté
                  
                  // Créer l'historique de modification s'il n'existe pas
                  if (!consultation.modificationHistory) {
                    consultation.modificationHistory = [];
                  }
                  
                  // Ajouter la modification
                  consultation.modificationHistory.push({
                    date: currentDate,
                    modifiedBy: currentUser,
                    changes: `Document ${printDocument.type === 'prescription' ? 'ordonnance' : printDocument.type === 'analysis' ? 'analyses' : 'imagerie'} modifié avant impression`,
                  });
                  
                  // Mettre à jour le contenu
                  if (printDocument.type === 'prescription') {
                    consultation.prescription = modifiedContent;
                  } else if (printDocument.type === 'analysis') {
                    consultation.analysis = modifiedContent;
                  } else if (printDocument.type === 'imaging') {
                    consultation.imaging = modifiedContent;
                  }
                  
                  setConsultations(updatedConsultations);
                  
                  // Afficher une notification
                  alert(`✅ Document modifié et historique enregistré !\n\n📝 Modification par: ${currentUser}\n📅 Date: ${currentDate}`);
                }
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}