import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Stethoscope, Briefcase } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    telephone?: string;
    specialite?: string;
    doctorCode?: string;
  };
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // Verify current password
    try {
      const usersData = localStorage.getItem('demo_users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const currentUser = users.find((u: any) => u.id === user.id);
        
        if (!currentUser) {
          alert('Utilisateur non trouvé');
          return;
        }

        if (currentUser.password !== currentPassword) {
          alert('Mot de passe actuel incorrect');
          return;
        }

        if (newPassword !== confirmPassword) {
          alert('Les nouveaux mots de passe ne correspondent pas');
          return;
        }

        if (newPassword.length < 6) {
          alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
          return;
        }

        // Update password
        const updatedUsers = users.map((u: any) =>
          u.id === user.id ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        
        alert('Mot de passe modifié avec succès');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erreur lors de la modification du mot de passe');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'medecin':
        return 'Médecin';
      case 'secretaire':
        return 'Secrétaire';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-pink-500';
      case 'medecin':
        return 'from-blue-500 to-cyan-500';
      case 'secretaire':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getRoleColor(user.role)} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                  {user.prenom[0]}{user.nom[0]}
                </div>
                <div>
                  <h2 className="text-2xl mb-1">
                    {user.role === 'medecin' && 'Dr. '}
                    {user.nom} {user.prenom}
                  </h2>
                  <p className="text-white/80 text-sm">{getRoleLabel(user.role)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'info'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Informations</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'password'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Mot de passe</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="space-y-4">
                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      {user.telephone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                            <p className="text-gray-900">{user.telephone}</p>
                          </div>
                        </div>
                      )}

                      {/* Role */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-0.5">Rôle</p>
                          <p className="text-gray-900">{getRoleLabel(user.role)}</p>
                        </div>
                      </div>

                      {/* Specialty (for doctors) */}
                      {user.role === 'medecin' && user.specialite && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Spécialité</p>
                            <p className="text-gray-900">{user.specialite}</p>
                          </div>
                        </div>
                      )}

                      {/* Doctor Code */}
                      {user.doctorCode && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Code</p>
                            <p className="text-gray-900">{user.doctorCode}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900">
                        Pour modifier votre mot de passe, vous devez d'abord entrer votre mot de passe actuel.
                        Le nouveau mot de passe doit contenir au moins 6 caractères.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Entrez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Confirmez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Modifier le mot de passe
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
