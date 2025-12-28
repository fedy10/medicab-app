import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Stethoscope } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (userData: any) => Promise<any>;
  onBackToLogin: () => void;
}

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [role, setRole] = useState<'medecin' | 'secretaire'>('medecin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    cin: '',
    adresse: '',
    sexe: 'M',
    // Medecin specific
    specialite: '',
    conventione: false,
    typeConvention: '',
    tarif: '',
    matriculeFiscal: '',
    // Secretaire specific
    codeMedecin: '',
    diplome: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await onRegister({ ...formData, role });
      // Different success messages based on role
      if (role === 'medecin') {
        setSuccess('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur. Vous recevrez une notification une fois approuvé.');
      } else {
        setSuccess(result.message || 'Inscription réussie !');
      }
      setTimeout(() => {
        onBackToLogin();
      }, 4000); // Increased timeout to 4 seconds for medecin message
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-500 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "20%", right: "10%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-pink-300/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "20%", left: "10%" }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/30 rounded-full"
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 80 - 40, 0],
              scale: [1, 1.5, 1],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl my-8"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBackToLogin}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-gray-900 mb-1">Inscription</h2>
              <p className="text-gray-600">Créer un nouveau compte</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('medecin')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                role === 'medecin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Médecin
            </button>
            <button
              type="button"
              onClick={() => setRole('secretaire')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                role === 'secretaire'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Secrétaire
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => updateFormData('nom', e.target.value)}
                required
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => updateFormData('prenom', e.target.value)}
                required
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) => updateFormData('telephone', e.target.value)}
                required
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="CIN"
                value={formData.cin}
                onChange={(e) => updateFormData('cin', e.target.value)}
                required
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              type="text"
              placeholder="Adresse"
              value={formData.adresse}
              onChange={(e) => updateFormData('adresse', e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div>
              <label className="block text-gray-700 mb-2">Sexe</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="M"
                    checked={formData.sexe === 'M'}
                    onChange={(e) => updateFormData('sexe', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Masculin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="F"
                    checked={formData.sexe === 'F'}
                    onChange={(e) => updateFormData('sexe', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Féminin</span>
                </label>
              </div>
            </div>

            {/* Medecin Specific Fields */}
            {role === 'medecin' && (
              <>
                <input
                  type="text"
                  placeholder="Spécialité"
                  value={formData.specialite}
                  onChange={(e) => updateFormData('specialite', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Tarif (TND)"
                  value={formData.tarif}
                  onChange={(e) => updateFormData('tarif', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Matricule fiscal (optionnel)"
                  value={formData.matriculeFiscal}
                  onChange={(e) => updateFormData('matriculeFiscal', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.conventione}
                      onChange={(e) => updateFormData('conventione', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Conventionné</span>
                  </label>
                </div>

                {formData.conventione && (
                  <select
                    value={formData.typeConvention}
                    onChange={(e) => updateFormData('typeConvention', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner le type de convention</option>
                    <option value="CNAM">CNAM</option>
                    <option value="Maghribiya">Maghribiya</option>
                    <option value="BIAT">BIAT</option>
                    <option value="Zitouna">Zitouna</option>
                  </select>
                )}
              </>
            )}

            {/* Secretaire Specific Fields */}
            {role === 'secretaire' && (
              <>
                <input
                  type="text"
                  placeholder="Code Médecin"
                  value={formData.codeMedecin}
                  onChange={(e) => updateFormData('codeMedecin', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Diplôme"
                  value={formData.diplome}
                  onChange={(e) => updateFormData('diplome', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  S'inscrire
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}