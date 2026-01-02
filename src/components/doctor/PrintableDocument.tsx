import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Edit2, Save } from 'lucide-react';
import { getSpecialtyIcon, getSpecialtyColor } from './MedicalSpecialtiesSelector';
import { ChronicDiseasesSelector } from '../ui/ChronicDiseasesSelector';

interface Disease {
  name: string;
  isChronic: boolean;
  category?: string;
}

interface PrintableDocumentProps {
  type: 'prescription' | 'analysis' | 'imaging' | 'referral';
  patientName: string;
  patientAge?: number;
  patientDiseases?: Disease[];
  doctorInfo: {
    name: string;
    specialty: string;
    address: string;
    phone: string;
  };
  initialContent: string;
  specialty?: string;
  onClose: () => void;
  onContentChanged?: (newContent: string, wasModified: boolean) => void;
  onDiseasesChanged?: (diseases: Disease[]) => void;
}

const getTitleByType = (type: string) => {
  switch (type) {
    case 'prescription':
      return 'ORDONNANCE MÉDICALE';
    case 'analysis':
      return 'DEMANDE D\'ANALYSES';
    case 'imaging':
      return 'DEMANDE D\'IMAGERIE';
    case 'referral':
      return 'LETTRE D\'ORIENTATION';
    default:
      return 'DOCUMENT MÉDICAL';
  }
};

export function PrintableDocument({
  type,
  patientName,
  patientAge,
  patientDiseases,
  doctorInfo,
  initialContent,
  specialty,
  onClose,
  onContentChanged,
  onDiseasesChanged,
}: PrintableDocumentProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>(patientDiseases || []);
  const [isEditingDiseases, setIsEditingDiseases] = useState(false);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleClose = () => {
    const wasModified = content !== initialContent;
    const diseasesModified = JSON.stringify(diseases) !== JSON.stringify(patientDiseases || []);
    
    if (wasModified && onContentChanged) {
      onContentChanged(content, true);
    }
    
    if (diseasesModified && onDiseasesChanged) {
      onDiseasesChanged(diseases);
    }
    
    onClose();
  };

  const handlePrint = () => {
    const wasModified = content !== initialContent;
    const diseasesModified = JSON.stringify(diseases) !== JSON.stringify(patientDiseases || []);
    
    if (wasModified && onContentChanged) {
      onContentChanged(content, true);
    }
    
    if (diseasesModified && onDiseasesChanged) {
      onDiseasesChanged(diseases);
    }
    
    // Forcer le mode aperçu
    setIsEditing(false);
    setIsEditingDiseases(false);
    setIsPrinting(true);
    
    // Imprimer après rendu
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 50);
  };

  const specialtyEmoji = getSpecialtyIcon(specialty || doctorInfo.specialty);
  const specialtyColor = getSpecialtyColor(specialty || doctorInfo.specialty);

  return (
    <>
      {/* Styles d'impression - APPROCHE SIMPLE ET DIRECTE */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          /* Masquer TOUT sauf le contenu du document */
          body * {
            visibility: hidden;
          }

          /* Afficher UNIQUEMENT le document */
          #document-to-print,
          #document-to-print * {
            visibility: visible;
          }

          /* Repositionner le document */
          #document-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            background: white;
          }

          /* Masquer les éléments non-imprimables */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          /* Styles du document */
          .print-header {
            padding: 20px 40px;
            border-bottom: 3px solid ${specialtyColor};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-logo {
            width: 60px;
            height: 60px;
            font-size: 36px;
            border-radius: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-title {
            font-size: 24px;
            color: ${specialtyColor};
            font-weight: 700;
            text-align: center;
            margin: 15px 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-patient {
            background: #f9fafb;
            border-left: 4px solid ${specialtyColor};
            padding: 15px 40px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-content {
            padding: 30px 40px;
            font-size: 14px;
            line-height: 1.8;
            white-space: pre-line;
            min-height: 200px;
          }

          .print-signature {
            padding: 40px 40px 20px 40px;
            text-align: right;
          }

          .print-footer {
            padding: 10px 40px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            text-align: center;
          }
        }
      `}</style>

      {/* Modal avec overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={handleClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
        >
          {/* Toolbar - Ne pas imprimer */}
          <div className="no-print bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                  {specialtyEmoji}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{getTitleByType(type)}</h3>
                  <p className="text-sm opacity-90">Modifiable avant impression</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Aperçu</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Modifier</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all"
                >
                  <Printer className="w-5 h-5" />
                  <span className="font-medium">Imprimer</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Contenu imprimable */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] bg-white">
            {/* Watermark - Ne pas imprimer */}
            <div className="no-print absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="text-9xl transform -rotate-45">
                {specialtyEmoji}
              </div>
            </div>

            {/* Document à imprimer */}
            <div id="document-to-print" className="p-8 md:p-12 bg-white">
              {/* Header */}
              <div className="print-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div
                    className="print-logo"
                    style={{
                      background: `linear-gradient(135deg, ${specialtyColor}, ${specialtyColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {specialtyEmoji}
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.6' }}>
                    <h1 style={{ fontSize: '18px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
                      {doctorInfo.name}
                    </h1>
                    <p style={{ color: specialtyColor, fontWeight: 500, margin: '2px 0' }}>
                      {specialty || doctorInfo.specialty}
                    </p>
                    <p style={{ color: '#4B5563', marginTop: '8px', margin: '2px 0' }}>
                      {doctorInfo.address}
                    </p>
                    <p style={{ color: '#4B5563', margin: '2px 0' }}>
                      Tél: {doctorInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="print-title">
                  {getTitleByType(type)}
                </div>
              </div>

              {/* Patient & Date */}
              <div className="print-patient">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>PATIENT</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                      {patientName}
                    </p>
                    {patientAge && (
                      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                        <strong>Âge:</strong> {patientAge} ans
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>DATE</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                      {currentDate}
                    </p>
                  </div>
                </div>

                {/* Medical History Section - Full Width */}
                {diseases && diseases.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>ANTÉCÉDENTS MÉDICAUX</p>
                      {type === 'referral' && (
                        <button
                          onClick={() => setIsEditingDiseases(!isEditingDiseases)}
                          className="no-print px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                          type="button"
                        >
                          {isEditingDiseases ? (
                            <>
                              <span>✓</span>
                              <span>Valider</span>
                            </>
                          ) : (
                            <>
                              <span>✏️</span>
                              <span>Modifier</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {isEditingDiseases && type === 'referral' ? (
                      <div className="no-print mb-4">
                        <ChronicDiseasesSelector
                          selectedDiseases={diseases}
                          onChange={setDiseases}
                          label=""
                          isEditing={true}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px' }}>
                        {diseases.filter(d => d.isChronic).length > 0 && (
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#DC2626', marginBottom: '6px' }}>• Maladies chroniques:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {diseases.filter(d => d.isChronic).map((disease, index) => (
                                <span 
                                  key={index} 
                                  style={{ 
                                    fontSize: '12px', 
                                    color: '#991B1B', 
                                    backgroundColor: '#FEE2E2',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}
                                >
                                  {disease.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {diseases.filter(d => !d.isChronic).length > 0 && (
                          <div style={{ marginTop: diseases.filter(d => d.isChronic).length > 0 ? '8px' : '0' }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', marginBottom: '6px' }}>• Autres affections:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {diseases.filter(d => !d.isChronic).map((disease, index) => (
                                <span 
                                  key={index} 
                                  style={{ 
                                    fontSize: '12px', 
                                    color: '#1E40AF', 
                                    backgroundColor: '#DBEAFE',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}
                                >
                                  {disease.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="print-content">
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '16px',
                      lineHeight: '2',
                      whiteSpace: 'pre-line',
                    }}
                    placeholder="Contenu du document..."
                  />
                ) : (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {content}
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="print-signature">
                <div style={{ display: 'inline-block', textAlign: 'left' }}>
                  <p style={{ color: '#4B5563', marginBottom: '32px' }}>Signature et cachet</p>
                  <div style={{ width: '192px', height: '96px', borderBottom: '2px solid #D1D5DB' }}></div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>{doctorInfo.name}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="print-footer">
                <p>Document médical confidentiel - {currentDate}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}