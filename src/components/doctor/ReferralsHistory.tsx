import { motion } from 'motion/react';
import { Printer, MessageSquare, Calendar, ArrowRight } from 'lucide-react';

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

interface ReferralsHistoryProps {
  referrals: Referral[];
  onOpenPrintable: (referral: Referral) => void;
  onOpenDigitalChat: (referral: Referral) => void;
}

export function ReferralsHistory({
  referrals,
  onOpenPrintable,
  onOpenDigitalChat,
}: ReferralsHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (referrals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h4 className="text-gray-900 mb-4">Historique des orientations</h4>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {referrals.map((referral, index) => (
          <motion.div
            key={referral.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border-2 rounded-xl p-4 transition-all ${
              referral.type === 'digital'
                ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50'
                : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  {referral.type === 'digital' ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Printer className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm">
                      {referral.specialty}
                    </h5>
                    <p className="text-xs text-gray-600">
                      {referral.type === 'digital' ? 'Orientation Digitale' : 'Lettre Imprimable'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="ml-10">
                  {referral.receivingDoctorName && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Médecin:</span> {referral.receivingDoctorName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(referral.date)}</span>
                    {referral.status && referral.type === 'digital' && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          referral.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          referral.status === 'viewed' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {referral.status === 'pending' ? 'En attente' :
                           referral.status === 'viewed' ? 'Vu' :
                           'Répondu'}
                        </span>
                        {referral.unreadMessages && referral.unreadMessages > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white">
                            {referral.unreadMessages}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (referral.type === 'digital') {
                    onOpenDigitalChat(referral);
                  } else {
                    onOpenPrintable(referral);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  referral.type === 'digital'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
                }`}
              >
                {referral.type === 'digital' ? (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Ouvrir le chat
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    Voir
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
