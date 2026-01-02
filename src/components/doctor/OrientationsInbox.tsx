import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  User, 
  Calendar,
  ChevronRight,
  Printer,
  Search,
  FileText
} from 'lucide-react';
import { PatientReferralChat } from './PatientReferralChat';

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  specialty: string;
  type: 'printable' | 'digital';
  referringDoctorId: string;
  referringDoctorName: string;
  receivingDoctorId?: string;
  receivingDoctorName?: string;
  date: string;
  status: 'pending' | 'viewed' | 'responded';
  unreadMessages?: number;
}

interface OrientationsInboxProps {
  onClose: () => void;
}

// Mock data - En production, cela viendrait de localStorage/backend
const mockReferrals: Referral[] = [
  {
    id: 'ref1',
    patientId: 'p1',
    patientName: 'Ahmed Mansour',
    patientAge: 45,
    specialty: 'Cardiologie',
    type: 'digital',
    referringDoctorId: 'dr1',
    referringDoctorName: 'Dr. Mohamed Ben Ali',
    receivingDoctorId: 'd1',
    receivingDoctorName: 'Dr. Ahmed Benali',
    date: '2024-12-28T10:30:00',
    status: 'pending',
    unreadMessages: 1,
  },
  {
    id: 'ref2',
    patientId: 'p2',
    patientName: 'Fatma Trabelsi',
    patientAge: 32,
    specialty: 'Cardiologie',
    type: 'digital',
    referringDoctorId: 'dr1',
    referringDoctorName: 'Dr. Mohamed Ben Ali',
    receivingDoctorId: 'd2',
    receivingDoctorName: 'Dr. Leila Trabelsi',
    date: '2024-12-27T14:20:00',
    status: 'viewed',
    unreadMessages: 0,
  },
  {
    id: 'ref3',
    patientId: 'p3',
    patientName: 'Karim Hadj',
    patientAge: 58,
    specialty: 'Dermatologie',
    type: 'digital',
    referringDoctorId: 'dr1',
    referringDoctorName: 'Dr. Mohamed Ben Ali',
    receivingDoctorId: 'd4',
    receivingDoctorName: 'Dr. Sonia Mansour',
    date: '2024-12-26T09:15:00',
    status: 'responded',
    unreadMessages: 2,
  },
];

export function OrientationsInbox({ onClose }: OrientationsInboxProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Grouper les orientations par spécialité et médecin
  const groupedReferrals = useMemo(() => {
    const filtered = mockReferrals.filter(ref => {
      if (ref.type !== 'digital') return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return ref.patientName.toLowerCase().includes(query) ||
               ref.receivingDoctorName?.toLowerCase().includes(query);
      }
      return true;
    });

    const grouped: { [specialty: string]: { [doctorId: string]: { doctor: string; referrals: Referral[] } } } = {};

    filtered.forEach(ref => {
      if (!grouped[ref.specialty]) {
        grouped[ref.specialty] = {};
      }
      if (!grouped[ref.specialty][ref.receivingDoctorId!]) {
        grouped[ref.specialty][ref.receivingDoctorId!] = {
          doctor: ref.receivingDoctorName!,
          referrals: []
        };
      }
      grouped[ref.specialty][ref.receivingDoctorId!].referrals.push(ref);
    });

    return grouped;
  }, [searchQuery]);

  const specialties = Object.keys(groupedReferrals);
  const doctors = selectedSpecialty ? Object.entries(groupedReferrals[selectedSpecialty]) : [];
  const patients = selectedDoctor && selectedSpecialty 
    ? groupedReferrals[selectedSpecialty][selectedDoctor].referrals 
    : [];

  const handleOpenChat = (referral: Referral) => {
    setSelectedReferral(referral);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (selectedReferral) {
    return (
      <PatientReferralChat
        patient={{
          id: selectedReferral.patientId,
          name: selectedReferral.patientName,
          age: selectedReferral.patientAge,
        }}
        referringDoctor={{
          id: selectedReferral.referringDoctorId,
          name: selectedReferral.referringDoctorName,
        }}
        receivingDoctor={{
          id: selectedReferral.receivingDoctorId!,
          name: selectedReferral.receivingDoctorName!,
        }}
        specialty={selectedReferral.specialty}
        referralLetterContent="Contenu de la lettre d'orientation..."
        onClose={() => setSelectedReferral(null)}
        onBack={() => setSelectedReferral(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Orientations Digitales</h2>
              <p className="text-sm opacity-90">Gérez vos lettres d'orientation par spécialité</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un patient ou médecin..."
              className="w-full pl-10 pr-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Specialties Sidebar */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Spécialités</h3>
              <div className="space-y-2">
                {specialties.map((specialty) => {
                  const doctorCount = Object.keys(groupedReferrals[specialty]).length;
                  const totalReferrals = Object.values(groupedReferrals[specialty])
                    .reduce((sum, d) => sum + d.referrals.length, 0);
                  const unreadCount = Object.values(groupedReferrals[specialty])
                    .reduce((sum, d) => sum + d.referrals.reduce((s, r) => s + (r.unreadMessages || 0), 0), 0);

                  return (
                    <button
                      key={specialty}
                      onClick={() => {
                        setSelectedSpecialty(specialty);
                        setSelectedDoctor(null);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedSpecialty === specialty
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{specialty}</span>
                        {unreadCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            selectedSpecialty === specialty
                              ? 'bg-white text-purple-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <span>{doctorCount} médecin{doctorCount > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{totalReferrals} patient{totalReferrals > 1 ? 's' : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Doctors List */}
          {selectedSpecialty && (
            <div className="w-80 border-r border-gray-200 overflow-y-auto bg-white">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Médecins - {selectedSpecialty}
                </h3>
                <div className="space-y-2">
                  {doctors.map(([doctorId, data]) => {
                    const unreadCount = data.referrals.reduce((sum, r) => sum + (r.unreadMessages || 0), 0);
                    
                    return (
                      <button
                        key={doctorId}
                        onClick={() => setSelectedDoctor(doctorId)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          selectedDoctor === doctorId
                            ? 'bg-purple-50 border-2 border-purple-300'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {data.doctor.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-gray-900 truncate">
                                {data.doctor}
                              </span>
                              {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-600 flex-shrink-0 ml-2">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              {data.referrals.length} patient{data.referrals.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Patients/Referrals List */}
          {selectedDoctor && selectedSpecialty ? (
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Patients orientés
                </h3>
                <div className="space-y-3">
                  {patients.map((referral) => (
                    <motion.button
                      key={referral.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => handleOpenChat(referral)}
                      className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                          {referral.patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {referral.patientName}
                              </h4>
                              <p className="text-xs text-gray-600">{referral.patientAge} ans</p>
                            </div>
                            {referral.unreadMessages! > 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500 text-white flex-shrink-0">
                                {referral.unreadMessages}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(referral.date)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              referral.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              referral.status === 'viewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {referral.status === 'pending' ? 'En attente' :
                               referral.status === 'viewed' ? 'Vu' :
                               'Répondu'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-600">
                  {!selectedSpecialty 
                    ? 'Sélectionnez une spécialité'
                    : 'Sélectionnez un médecin'}
                </p>
                <p className="text-sm mt-2">
                  Pour voir les patients orientés
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
