import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, DollarSign, Users, Eye, EyeOff, Calendar, Clock, ShieldCheck, ShieldOff, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  duration: number; // in months
  amount: number;
}

interface Secretary {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface MedecinDetailsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onUpdateStatus?: (userId: string, status: string) => void;
  processing?: boolean;
  medecin: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    specialite?: string;
    telephone?: string;
    doctorCode?: string;
    status?: string;
  };
}

export function MedecinDetailsModal({ isOpen = true, onClose, medecin, onUpdateStatus, processing }: MedecinDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'access' | 'payments' | 'password' | 'secretaries'>('access');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Payment form
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentDuration, setPaymentDuration] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Secretaries
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [selectedSecretaryId, setSelectedSecretaryId] = useState<string | null>(null);
  const [secretaryNewPassword, setSecretaryNewPassword] = useState('');
  const [secretaryConfirmPassword, setSecretaryConfirmPassword] = useState('');
  const [showSecretaryPassword, setShowSecretaryPassword] = useState(false);
  const [showSecretaryConfirmPassword, setShowSecretaryConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen && medecin) {
      loadPayments();
      loadSecretaries();
    }
  }, [isOpen, medecin]);

  const loadPayments = () => {
    try {
      const key = `payments_${medecin.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setPayments(JSON.parse(stored));
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  const loadSecretaries = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const medecinSecretaries = users.filter(
          (u: any) => u.role === 'secretaire' && u.medecin_id === medecin.id
        );
        setSecretaries(medecinSecretaries);
      }
    } catch (error) {
      console.error('Error loading secretaries:', error);
      setSecretaries([]);
    }
  };

  const handleToggleAccess = () => {
    if (onUpdateStatus) {
      const newStatus = medecin.status === 'active' ? 'suspended' : 'active';
      onUpdateStatus(medecin.id, newStatus);
    }
  };

  const handlePasswordChange = () => {
    if (!newPassword.trim()) {
      alert('Veuillez entrer un nouveau mot de passe');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const usersData = localStorage.getItem('demo_users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((u: any) =>
          u.id === medecin.id ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        alert('Mot de passe modifié avec succès');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Erreur lors de la modification du mot de passe');
    }
  };

  const handleAddPayment = () => {
    if (!paymentDate || !paymentDuration || !paymentAmount) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newPayment: Payment = {
      id: `payment_${Date.now()}`,
      date: paymentDate,
      duration: parseInt(paymentDuration),
      amount: parseFloat(paymentAmount),
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    
    const key = `payments_${medecin.id}`;
    localStorage.setItem(key, JSON.stringify(updatedPayments));

    // Reset form
    setPaymentDate('');
    setPaymentDuration('');
    setPaymentAmount('');
    
    alert('Paiement ajouté avec succès');
  };

  const handleDeletePayment = (paymentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      const updatedPayments = payments.filter(p => p.id !== paymentId);
      setPayments(updatedPayments);
      const key = `payments_${medecin.id}`;
      localStorage.setItem(key, JSON.stringify(updatedPayments));
    }
  };

  const handleSecretaryPasswordChange = () => {
    if (!selectedSecretaryId) {
      alert('Veuillez sélectionner une secrétaire');
      return;
    }
    if (!secretaryNewPassword.trim()) {
      alert('Veuillez entrer un nouveau mot de passe');
      return;
    }
    if (secretaryNewPassword !== secretaryConfirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (secretaryNewPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const usersData = localStorage.getItem('demo_users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((u: any) =>
          u.id === selectedSecretaryId ? { ...u, password: secretaryNewPassword } : u
        );
        localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
        alert('Mot de passe de la secrétaire modifié avec succès');
        setSecretaryNewPassword('');
        setSecretaryConfirmPassword('');
        setSelectedSecretaryId(null);
      }
    } catch (error) {
      console.error('Error updating secretary password:', error);
      alert('Erreur lors de la modification du mot de passe');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  const isActive = medecin.status === 'active';

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${isActive ? 'from-purple-500 to-pink-500' : 'from-gray-500 to-gray-600'} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl">
                    Dr. {medecin.nom} {medecin.prenom}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs ${isActive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                    {isActive ? 'Actif' : 'Suspendu'}
                  </span>
                </div>
                <p className={isActive ? 'text-purple-100' : 'text-gray-300'}>
                  {medecin.specialite} • {medecin.doctorCode}
                </p>
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
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('access')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'access'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isActive ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
              <span>Accès</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Paiements</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'password'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Mot de passe</span>
            </button>
            <button
              onClick={() => setActiveTab('secretaries')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'secretaries'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Secrétaires ({secretaries.length})</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Access Tab */}
              {activeTab === 'access' && (
                <motion.div
                  key="access"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Status Card */}
                  <div className={`bg-gradient-to-br ${isActive ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-orange-50 border-red-200'} rounded-xl p-6 border-2`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isActive ? (
                          <ShieldCheck className="w-8 h-8 text-white" />
                        ) : (
                          <ShieldOff className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-gray-900 mb-2">
                          {isActive ? 'Compte Actif' : 'Compte Suspendu'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {isActive
                            ? 'Ce médecin peut accéder à son compte et utiliser toutes les fonctionnalités de la plateforme.'
                            : 'Ce médecin ne peut pas accéder à son compte. Toutes les fonctionnalités sont désactivées.'}
                        </p>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">
                            {isActive
                              ? 'Le médecin peut se connecter et gérer ses consultations'
                              : 'Le médecin ne peut pas se connecter à la plateforme'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg text-gray-900 mb-4">
                      Contrôle d'accès
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {isActive
                        ? 'Suspendre l\'accès empêchera le médecin de se connecter et d\'utiliser la plateforme. Ses données seront conservées.'
                        : 'Réactiver l\'accès permettra au médecin de se reconnecter et d\'utiliser toutes les fonctionnalités.'}
                    </p>
                    <button
                      onClick={handleToggleAccess}
                      disabled={processing}
                      className={`w-full px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
                        isActive
                          ? 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg'
                          : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg'
                      } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActive ? (
                        <>
                          <ShieldOff className="w-5 h-5" />
                          <span className="text-lg">Suspendre l'accès</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-lg">Activer l'accès</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-900">
                        <strong>Note :</strong> Suspendre un compte n'efface aucune donnée. Toutes les consultations, patients et informations restent sauvegardées et seront accessibles lorsque le compte sera réactivé.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Add Payment Form */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Ajouter un paiement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Durée (mois)
                        </label>
                        <input
                          type="number"
                          value={paymentDuration}
                          onChange={(e) => setPaymentDuration(e.target.value)}
                          min="1"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: 6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Montant (TND)
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: 500.00"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddPayment}
                      className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Ajouter le paiement
                    </button>
                  </div>

                  {/* Payments List */}
                  <div>
                    <h3 className="text-lg text-gray-900 mb-4">
                      Historique des paiements ({payments.length})
                    </h3>
                    {payments.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun paiement enregistré</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((payment) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                                <DollarSign className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(payment.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {payment.duration} mois
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Supprimer
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Password Tab */}
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
                        Vous pouvez modifier le mot de passe du médecin. Le nouveau mot de passe
                        doit contenir au moins 6 caractères.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Entrez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Confirmez le mot de passe"
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

              {/* Secretaries Tab */}
              {activeTab === 'secretaries' && (
                <motion.div
                  key="secretaries"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {secretaries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune secrétaire associée</p>
                    </div>
                  ) : (
                    <>
                      {/* Secretaries List */}
                      <div className="space-y-3">
                        {secretaries.map((secretary) => (
                          <motion.div
                            key={secretary.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              selectedSecretaryId === secretary.id
                                ? 'border-purple-500 shadow-lg'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => setSelectedSecretaryId(secretary.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                                {secretary.prenom[0]}{secretary.nom[0]}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900">
                                  {secretary.nom} {secretary.prenom}
                                </p>
                                <p className="text-sm text-gray-500">{secretary.email}</p>
                                <p className="text-sm text-gray-500">{secretary.telephone}</p>
                              </div>
                              {selectedSecretaryId === secretary.id && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Change Secretary Password Form */}
                      {selectedSecretaryId && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
                        >
                          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-purple-600" />
                            Modifier le mot de passe de la secrétaire
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Nouveau mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecretaryPassword ? 'text' : 'password'}
                                  value={secretaryNewPassword}
                                  onChange={(e) => setSecretaryNewPassword(e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Entrez le nouveau mot de passe"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecretaryPassword(!showSecretaryPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showSecretaryPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                  ) : (
                                    <Eye className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Confirmer le mot de passe
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecretaryConfirmPassword ? 'text' : 'password'}
                                  value={secretaryConfirmPassword}
                                  onChange={(e) => setSecretaryConfirmPassword(e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Confirmez le mot de passe"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecretaryConfirmPassword(!showSecretaryConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showSecretaryConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                  ) : (
                                    <Eye className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={handleSecretaryPasswordChange}
                              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                              Modifier le mot de passe
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
