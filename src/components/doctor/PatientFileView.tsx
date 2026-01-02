import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Upload, Eye, Download, Trash2, Clock, Printer, Pill, FlaskConical, Image as ImageIcon, Edit2 } from 'lucide-react';
import { ModernFileUploader } from './ModernFileUploader';
import { PrintableDocument } from './PrintableDocument';
import { ChronicDiseasesSelector } from '../ui/ChronicDiseasesSelector';
import { useLanguage } from '../../contexts/LanguageContext';

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

interface Disease {
  name: string;
  isChronic: boolean;
  category?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  job: string;
  diseases: Disease[];
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
  const { t } = useLanguage();
  const [files, setFiles] = useState<PatientFile[]>(patient.files || [
    {
      id: '1',
      name: 'Résultats_IRM_20241015.pdf',
      type: 'IRM',
      uploadDate: '15/10/2024',
      uploadedBy: 'Secrétaire',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Analyses_sang_20241110.pdf',
      type: 'Analyse',
      uploadDate: '10/11/2024',
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
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadFile = (fileName: string, fileType: string, file: File) => {
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
    setFiles([...files, newFile]);
    alert('✅ Fichier ajouté avec succès !');
  };

  const handleRenameFile = (fileId: string) => {
    if (newFileName.trim()) {
      setFiles(files.map(f => 
        f.id === fileId ? { ...f, name: newFileName.trim() } : f
      ));
      setEditingFileName(null);
      setNewFileName('');
      alert('✅ Fichier renommé avec succès !');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      setFiles(files.filter((f) => f.id !== fileId));
      alert('✅ Fichier supprimé avec succès !');
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
      alert(`✅ Document modifié et historique enregistré !\n\n📝 Modification par: ${currentUser}\n📅 Date: ${currentDate}`);
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
            <ChronicDiseasesSelector
              selectedDiseases={patient.diseases}
              onChange={() => {}} // Mode lecture seul
              label="Maladies"
              isEditing={false}
            />
          </div>
        )}

        {/* Consultation history */}
        <div className="mb-6">
          <h3 className="text-gray-900 mb-4">Historique des consultations</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Ajouter un fichier
              </motion.button>
            )}
          </div>
          
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Aucun fichier attaché</p>
              <p className="text-sm mt-1">Cliquez sur "Ajouter un fichier" pour commencer</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, i) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
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
                        onClick={() => alert(`👁️ Affichage de ${file.name}\n\nType: ${file.type}\nTaille: ${file.size}\nDate: ${file.uploadDate}\n\n(Fonctionnalité de prévisualisation)`)}
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
                      {canUploadFiles && (
                        <>
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
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload file dialog */}
        <AnimatePresence>
          {showUploadDialog && (
            <ModernFileUploader
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