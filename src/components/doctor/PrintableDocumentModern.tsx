import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Edit2, Save } from 'lucide-react';
import { getSpecialtyIcon, getSpecialtyColor } from './MedicalSpecialtiesSelector';

interface PrintableDocumentProps {
  type: 'prescription' | 'analysis' | 'imaging' | 'referral';
  patientName: string;
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
  doctorInfo,
  initialContent,
  specialty,
  onClose,
  onContentChanged,
}: PrintableDocumentProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleClose = () => {
    const wasModified = content !== initialContent;
    
    if (wasModified && onContentChanged) {
      onContentChanged(content, true);
    }
    
    onClose();
  };

  const handlePrint = () => {
    const wasModified = content !== initialContent;
    
    if (wasModified && onContentChanged) {
      onContentChanged(content, true);
    }
    
    window.print();
  };

  const specialtyEmoji = getSpecialtyIcon(specialty || doctorInfo.specialty);
  const specialtyColor = getSpecialtyColor(specialty || doctorInfo.specialty);

  return (
    <>
      {/* Styles d'impression */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          #printable-document,
          #printable-document * {
            visibility: visible;
          }
          
          #printable-document {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 40px !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-header {
            border-bottom: 3px solid ${specialtyColor} !important;
            padding-bottom: 20px !important;
            margin-bottom: 30px !important;
          }

          .specialty-logo {
            width: 80px !important;
            height: 80px !important;
            font-size: 48px !important;
          }

          .document-title {
            font-size: 28px !important;
            color: ${specialtyColor} !important;
            font-weight: 700 !important;
            letter-spacing: 1px !important;
          }

          .doctor-info {
            font-size: 14px !important;
            line-height: 1.8 !important;
          }

          .patient-section {
            background: #f9fafb !important;
            border-left: 4px solid ${specialtyColor} !important;
            padding: 15px 20px !important;
            margin: 20px 0 !important;
          }

          .document-content {
            font-size: 16px !important;
            line-height: 2 !important;
            color: #1f2937 !important;
            white-space: pre-line !important;
            padding: 20px 0 !important;
          }

          .signature-section {
            margin-top: 60px !important;
            text-align: right !important;
          }

          .watermark {
            display: none !important;
          }

          textarea {
            border: none !important;
            background: transparent !important;
            resize: none !important;
            outline: none !important;
          }
        }

        @page {
          size: A4;
          margin: 0;
        }
      `}</style>

      {/* Modal overlay - non-imprimable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="print-hide fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
        >
          {/* Toolbar - non-imprimable */}
          <div className="print-hide bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
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

          {/* Document content - IMPRIMABLE */}
          <div
            id="printable-document"
            className="p-8 md:p-12 overflow-y-auto max-h-[calc(95vh-120px)] bg-white relative"
          >
            {/* Watermark - non-imprimable */}
            <div className="watermark absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="text-9xl transform -rotate-45">
                {specialtyEmoji}
              </div>
            </div>

            {/* Header */}
            <div className="print-header relative">
              <div className="flex items-start justify-between mb-6">
                {/* Logo spécialité */}
                <div
                  className="specialty-logo w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${specialtyColor}, ${specialtyColor}dd)`,
                  }}
                >
                  {specialtyEmoji}
                </div>

                {/* Doctor info */}
                <div className="doctor-info text-right">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {doctorInfo.name}
                  </h1>
                  <p className="text-lg font-medium" style={{ color: specialtyColor }}>
                    {specialty || doctorInfo.specialty}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    {doctorInfo.address}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Tél: {doctorInfo.phone}
                  </p>
                </div>
              </div>

              {/* Document title */}
              <div className="text-center py-4">
                <h2
                  className="document-title text-3xl font-bold tracking-wide"
                  style={{ color: specialtyColor }}
                >
                  {getTitleByType(type)}
                </h2>
              </div>
            </div>

            {/* Patient & Date section */}
            <div className="patient-section rounded-xl" style={{ borderLeftColor: specialtyColor }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">PATIENT</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">DATE</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="document-content my-8">
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
                <div
                  className="whitespace-pre-line p-4"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '16px',
                    lineHeight: '2',
                  }}
                >
                  {content}
                </div>
              )}
            </div>

            {/* Signature section */}
            <div className="signature-section mt-16 pt-8 border-t-2 border-gray-200">
              <div className="inline-block text-left">
                <p className="text-gray-600 mb-8">Signature et cachet</p>
                <div className="w-48 h-24 border-b-2 border-gray-300"></div>
                <p className="text-sm text-gray-500 mt-2">{doctorInfo.name}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>Document médical confidentiel - {currentDate}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
