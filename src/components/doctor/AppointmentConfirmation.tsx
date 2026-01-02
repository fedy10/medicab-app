import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Check, DollarSign, CreditCard, Building, Gift } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  time: string;
  type: 'consultation' | 'control';
  pays?: string;
}

interface AppointmentConfirmationProps {
  appointment: Appointment;
  doctorTariff: number;
  onConfirm: (paymentInfo: {
    paymentType: 'normal' | 'cnam' | 'insurance' | 'free';
    amountPaid?: number;
  }) => void;
  onCancel: () => void;
}

// Conventions par pays (les mêmes que dans RegisterPage)
const conventionsByCountry: { [key: string]: string[] } = {
  'Tunisie': [
    'CNAM',
    'STAR Assurances',
    'COMAR Assurances',
    'GAT Assurances',
    'MAGHREBIA Assurances',
    'AMI Assurances',
    'CARTE Assurances',
    'MAE',
    'ASTREE Assurances',
    'BIAT Assurances',
    'Zitouna Takaful',
    'Globemed Tunisia',
    'NextCare',
    'Help Group',
  ],
  'Libye': [
    'Libya Insurance Company (LIC)',
    'Sahara Insurance',
    'United Insurance Company (UIC)',
    'Libyana Insurance',
    'Trust Insurance Libya',
    'Al-Afriqiyah Insurance',
  ],
  'Algérie': [
    'SAA',
    'CAAR',
    'CAAT',
    'CNMA',
    'Alliance Assurances',
    'CIAR',
    'Trust Algérie',
    'Salama Assurances',
    'AXA Algérie',
    'Macir Vie',
    'Le Mutualiste',
    'CHIFA (CNAS)',
  ],
};

export function AppointmentConfirmation({
  appointment,
  doctorTariff,
  onConfirm,
  onCancel,
}: AppointmentConfirmationProps) {
  const [paymentType, setPaymentType] = useState<'normal' | 'cnam' | 'insurance' | 'free'>('normal');
  const [amountPaid, setAmountPaid] = useState(doctorTariff.toString());
  const [showAmountField, setShowAmountField] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');

  // Récupérer les conventions disponibles selon le pays du patient
  const availableInsurances = useMemo(() => {
    if (!appointment.pays) return [];
    return conventionsByCountry[appointment.pays] || [];
  }, [appointment.pays]);

  const handlePaymentTypeChange = (type: 'normal' | 'cnam' | 'insurance' | 'free') => {
    setPaymentType(type);
    
    if (type === 'cnam' || type === 'insurance') {
      setShowAmountField(true);
      // Pré-remplir avec le tarif du médecin
      setAmountPaid(doctorTariff.toString());
    } else {
      setShowAmountField(false);
      if (type === 'free') {
        setAmountPaid('0');
      } else {
        setAmountPaid(doctorTariff.toString());
      }
    }
  };

  const handleConfirm = () => {
    const paymentInfo = {
      paymentType,
      ...(showAmountField && { amountPaid: parseFloat(amountPaid) }),
    };
    onConfirm(paymentInfo);
  };

  const calculateReimbursement = () => {
    if ((paymentType === 'cnam' || paymentType === 'insurance') && amountPaid) {
      const paid = parseFloat(amountPaid);
      const reimbursement = doctorTariff - paid;
      return reimbursement > 0 ? reimbursement : 0;
    }
    return 0;
  };

  // Options de paiement de base (toujours disponibles)
  const basePaymentOptions = [
    {
      type: 'normal' as const,
      label: 'Paiement normal',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      description: 'Paiement intégral par le patient',
    },
    {
      type: 'free' as const,
      label: 'Gratuit',
      icon: Gift,
      color: 'from-orange-500 to-amber-500',
      description: 'Consultation gratuite',
    },
  ];

  // Options de paiement avec assurance (selon le pays du patient)
  const insurancePaymentOptions = appointment.pays && availableInsurances.length > 0 ? [
    {
      type: 'insurance' as const,
      label: 'Assurance',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      description: `Assurances ${appointment.pays}`,
    },
  ] : [];

  // Combiner toutes les options
  const paymentOptions = [...basePaymentOptions, ...insurancePaymentOptions];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <h3 className="text-gray-900 mb-4">Confirmer le rendez-vous</h3>

        {/* Patient info */}
        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-gray-900">
            <strong>{appointment.patientName}</strong>
          </p>
          <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
          <p className="text-sm text-gray-600 mt-1">
            {appointment.time} • {appointment.type === 'consultation' ? 'Consultation' : 'Contrôle'}
          </p>
          {appointment.pays && (
            <p className="text-sm text-blue-600 mt-1">
              📍 Pays : {appointment.pays}
            </p>
          )}
        </div>

        {/* Payment type selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Type de paiement</label>
          <div className="grid grid-cols-2 gap-2">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePaymentTypeChange(option.type)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    paymentType === option.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-0.5">{option.label}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{option.description}</p>
                    </div>
                    {paymentType === option.type && (
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sélection de l'assurance si type = insurance */}
        {paymentType === 'insurance' && availableInsurances.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <label className="block text-sm text-gray-700 mb-2">Sélectionner l'assurance</label>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-3">
              <div 
                className="max-h-[150px] overflow-y-auto space-y-2 custom-scrollbar pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#3b82f6 #e5e7eb',
                }}
              >
                {availableInsurances.map((insurance) => (
                  <motion.button
                    key={insurance}
                    type="button"
                    onClick={() => setSelectedInsurance(insurance)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-2.5 rounded-xl border-2 transition-all text-left text-sm ${
                      selectedInsurance === insurance
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedInsurance === insurance
                            ? 'bg-white border-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedInsurance === insurance && (
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{insurance}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Amount paid field for Insurance */}
        {showAmountField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <label className="block text-sm text-gray-700 mb-1.5">Montant payé par le patient</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">TND</span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Tarif de consultation : <strong>{doctorTariff} TND</strong>
            </p>
          </motion.div>
        )}

        {/* Reimbursement calculation */}
        {paymentType === 'insurance' && amountPaid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 mb-4"
          >
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-gray-700">Montant payé par le patient :</span>
              <span className="text-gray-900">{parseFloat(amountPaid).toFixed(2)} TND</span>
            </div>
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-gray-700">Montant à rembourser :</span>
              <span className="text-green-700">
                <strong>{calculateReimbursement().toFixed(2)} TND</strong>
              </span>
            </div>
            <div className="pt-1.5 border-t border-green-200 mt-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Organisme payeur :</span>
                <span className="text-gray-900">
                  <strong>{selectedInsurance || 'Assurance'}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary for normal payment */}
        {paymentType === 'normal' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Montant total :</span>
              <span className="text-blue-700">
                <strong>{doctorTariff} TND</strong>
              </span>
            </div>
          </div>
        )}

        {/* Free consultation notice */}
        {paymentType === 'free' && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-orange-700">
              ⚠️ Cette consultation sera enregistrée comme gratuite (0 TND)
            </p>
          </div>
        )}

        {/* Message si pas de pays sélectionné */}
        {!appointment.pays && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-yellow-700">
              ℹ️ Aucun pays renseigné pour ce patient. Seuls les paiements normaux et gratuits sont disponibles.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirmer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
