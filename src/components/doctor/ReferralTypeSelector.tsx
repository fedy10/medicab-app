import { motion } from 'motion/react';
import { Printer, MessageSquare, X, Check } from 'lucide-react';

interface ReferralTypeSelectorProps {
  specialty: string;
  onSelectPrintable: () => void;
  onSelectDigital: () => void;
  onCancel: () => void;
}

export function ReferralTypeSelector({
  specialty,
  onSelectPrintable,
  onSelectDigital,
  onCancel,
}: ReferralTypeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Type d'orientation
          </h3>
          <p className="text-sm text-gray-600">
            Spécialité : <span className="font-semibold text-purple-600">{specialty}</span>
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Printable Option */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectPrintable}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 group p-6"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Printer className="w-8 h-8 text-white" />
              </div>
              
              {/* Title */}
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Lettre Imprimable
              </h4>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                Format PDF traditionnel prêt à imprimer
              </p>
              
              {/* Features */}
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                  <span>Document PDF</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                  <span>Signature et cachet</span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Digital Option */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectDigital}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 group p-6"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              {/* Title */}
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Orientation Digitale
              </h4>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                Communication directe avec le médecin
              </p>
              
              {/* Features */}
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-purple-600" />
                  </div>
                  <span>Envoi instantané</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-purple-600" />
                  </div>
                  <span>Chat avec historique</span>
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Cancel Button */}
        <div className="text-center mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}