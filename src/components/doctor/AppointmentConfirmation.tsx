import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, DollarSign, CreditCard, Building, Gift } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  time: string;
  type: 'consultation' | 'control';
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

export function AppointmentConfirmation({
  appointment,
  doctorTariff,
  onConfirm,
  onCancel,
}: AppointmentConfirmationProps) {
  const [paymentType, setPaymentType] = useState<'normal' | 'cnam' | 'insurance' | 'free'>('normal');
  const [amountPaid, setAmountPaid] = useState(doctorTariff.toString());
  const [showAmountField, setShowAmountField] = useState(false);

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

  const paymentOptions = [
    {
      type: 'normal' as const,
      label: 'Paiement normal',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      description: 'Paiement intégral par le patient',
    },
    {
      type: 'cnam' as const,
      label: 'CNAM',
      icon: Building,
      color: 'from-green-500 to-emerald-500',
      description: 'Caisse nationale d\'assurance maladie',
    },
    {
      type: 'insurance' as const,
      label: 'Assurance',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      description: 'Assurance privée',
    },
    {
      type: 'free' as const,
      label: 'Gratuit',
      icon: Gift,
      color: 'from-orange-500 to-amber-500',
      description: 'Consultation gratuite',
    },
  ];

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
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
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

        {/* Amount paid field for CNAM/Insurance */}
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
        {(paymentType === 'cnam' || paymentType === 'insurance') && amountPaid && (
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
                  <strong>{paymentType === 'cnam' ? 'CNAM' : 'Assurance'}</strong>
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