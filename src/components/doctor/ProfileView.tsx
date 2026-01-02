import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, Briefcase, Hash, Edit, UserPlus, CheckCircle, XCircle, Key } from 'lucide-react';
import type { User as UserType } from '../../App';
import { useLanguage } from '../../contexts/LanguageContext';

interface Secretary {
  id: string;
  name: string;
  email: string;
  phone: string;
  cin: string;
  address: string;
  diploma: string;
  gender: 'male' | 'female';
  isActive: boolean;
  isPending: boolean;
}

interface ProfileViewProps {
  user?: UserType;
}

export function ProfileView({ user }: ProfileViewProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSecretary, setShowAddSecretary] = useState(false);

  const [secretaries, setSecretaries] = useState<Secretary[]>([
    {
      id: '1',
      name: 'Fatma Trabelsi',
      email: 'fatma.sec@medicab.tn',
      phone: '+216 22 987 654',
      cin: '12345678',
      address: 'Avenue Bourguiba, Tunis',
      diploma: 'Bac + Formation secrétariat médical',
      gender: 'female',
      isActive: true,
      isPending: true,
    },
    {
      id: '2',
      name: 'Nour Gharbi',
      email: 'nour.gharbi@medicab.tn',
      phone: '+216 98 111 222',
      cin: '87654321',
      address: 'Rue de la République, Tunis',
      diploma: 'Licence en gestion + Formation médicale',
      gender: 'female',
      isActive: false,
      isPending: true,
    },
  ]);

  const [profileData, setProfileData] = useState(() => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '+216 98 123 456',
  specialty: user?.specialty ?? 'Cardiologue',
  address: 'Avenue Habib Bourguiba, Tunis',
  conventioned: true,
  convention: 'CNAM',
  tariff: '60',
}));


  const handleActivateSecretary = (id: string) => {
    setSecretaries(
      secretaries.map((sec) =>
        sec.id === id ? { ...sec, isActive: true, isPending: false } : sec
      )
    );
  };

  const handleSuspendSecretary = (id: string) => {
    setSecretaries(secretaries.map((sec) => (sec.id === id ? { ...sec, isActive: false } : sec)));
  };

  const handleResetPassword = (secretary: Secretary) => {
    alert(`Email de réinitialisation envoyé à ${secretary.email}`);
  };

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">{t('personal_information')}</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isEditing
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('save')}
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                {t('edit')}
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Spécialité</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.specialty}
                onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Adresse du cabinet</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Code médecin</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={user?.doctorCode}
                disabled
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tarif de consultation</label>
            <input
              type="text"
              value={`${profileData.tariff} TND`}
              onChange={(e) =>
                setProfileData({ ...profileData, tariff: e.target.value.replace(' TND', '') })
              }
              disabled={!isEditing}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${
                isEditing ? 'focus:border-blue-500 focus:outline-none' : 'bg-gray-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Secretaries management */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Gestion des secrétaires</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddSecretary(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter une secrétaire
          </motion.button>
        </div>

        <div className="space-y-4">
          {secretaries.map((secretary, index) => (
            <motion.div
              key={secretary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-2 border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    {secretary.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900">{secretary.name}</h4>
                      {secretary.isPending && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                          En attente validation
                        </span>
                      )}
                      {secretary.isActive && !secretary.isPending && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {!secretary.isActive && !secretary.isPending && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Suspendue
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {secretary.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {secretary.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {secretary.diploma}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {secretary.isPending && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivateSecretary(secretary.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Valider
                    </motion.button>
                  )}
                  {secretary.isActive && !secretary.isPending && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuspendSecretary(secretary.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Suspendre
                    </motion.button>
                  )}
                  {!secretary.isActive && !secretary.isPending && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivateSecretary(secretary.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Activer
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResetPassword(secretary)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Réinitialiser le mot de passe"
                  >
                    <Key className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add secretary modal */}
      <AnimatePresence>
        {showAddSecretary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddSecretary(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-gray-900 mb-6">Partager votre code médecin</h3>
              <p className="text-gray-600 mb-6">
                Pour ajouter une secrétaire, partagez-lui votre code médecin. Elle pourra ensuite
                s'inscrire et vous recevrez une demande de validation.
              </p>
              <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Votre code médecin</p>
                <p className="text-gray-900">{user?.doctorCode || 'DOC-001'}</p>
              </div>
              <button
                onClick={() => setShowAddSecretary(false)}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}