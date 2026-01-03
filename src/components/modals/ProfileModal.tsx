import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Stethoscope, Briefcase } from 'lucide-react';
import { profileService } from '../../lib/services/supabaseService';
import { supabase } from '../../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    specialty?: string;
    address?: string;
  };
}

export function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extraire prénom/nom du name complet
  const nameParts = profile.name.split(' ');
  const prenom = nameParts[0] || '';
  const nom = nameParts.slice(1).join(' ') || nameParts[0] || '';

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);

      // Vérifier le mot de passe actuel en tentant de se connecter
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });

      if (signInError) {
        alert('❌ Mot de passe actuel incorrect');
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      alert('✅ Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('info');
    } catch (error: any) {
      console.error('Erreur modification mot de passe:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-blue-500 to-blue-600';
      case 'doctor':
        return 'from-purple-500 to-purple-600';
      case 'secretary':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'doctor':
        return 'Médecin';
      case 'secretary':
        return 'Secrétaire';
      default:
        return role;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getRoleColor(profile.role)} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                  {prenom[0]}{nom[0]}
                </div>
                <div>
                  <h2 className="text-2xl mb-1">
                    {profile.role === 'doctor' && 'Dr. '}
                    {profile.name}
                  </h2>
                  <p className="text-white/80 text-sm">{getRoleLabel(profile.role)}</p>
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
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Informations
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock className="w-5 h-5 inline mr-2" />
              Mot de passe
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                  />
                </div>

                {profile.phone && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {profile.specialty && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      <Stethoscope className="w-4 h-4 inline mr-2" />
                      Spécialité
                    </label>
                    <input
                      type="text"
                      value={profile.specialty}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {profile.address && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ℹ️ Pour modifier vos informations personnelles, veuillez contacter l'administrateur.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                      placeholder="Entrez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Modification en cours...
                    </div>
                  ) : (
                    'Modifier le mot de passe'
                  )}
                </button>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ⚠️ Le mot de passe doit contenir au moins 6 caractères.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}