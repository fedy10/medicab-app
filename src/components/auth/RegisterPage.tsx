import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Stethoscope, ChevronDown, Search, Check, MapPin, Globe } from 'lucide-react';

// Spécialités médicales disponibles avec icônes
const medicalSpecialties = [
  { name: 'Ophtalmologue', icon: '👁️', color: 'from-blue-500 to-cyan-500' },
  { name: 'ORL', icon: '👂', color: 'from-purple-500 to-pink-500' },
  { name: 'Orthophoniste', icon: '🗣️', color: 'from-green-500 to-emerald-500' },
  { name: 'Neurologue', icon: '🧠', color: 'from-violet-500 to-purple-500' },
  { name: 'Cardiologue', icon: '❤️', color: 'from-red-500 to-rose-500' },
  { name: 'Orthopédiste', icon: '🦴', color: 'from-orange-500 to-amber-500' },
  { name: 'Pédiatre', icon: '👶', color: 'from-pink-500 to-rose-500' },
  { name: 'Généraliste', icon: '🩺', color: 'from-blue-500 to-indigo-500' },
  { name: 'Dermatologue', icon: '🧴', color: 'from-teal-500 to-cyan-500' },
  { name: 'Psychiatre', icon: '🧘', color: 'from-indigo-500 to-purple-500' },
  { name: 'Gynécologue', icon: '🤰', color: 'from-rose-500 to-pink-500' },
  { name: 'Endocrinologue', icon: '🔬', color: 'from-cyan-500 to-blue-500' },
  { name: 'Rhumatologue', icon: '🦵', color: 'from-amber-500 to-orange-500' },
  { name: 'Gastro-entérologue', icon: '🫁', color: 'from-green-500 to-teal-500' },
  { name: 'Pneumologue', icon: '🫁', color: 'from-sky-500 to-blue-500' },
  { name: 'Néphrologue', icon: '💧', color: 'from-blue-500 to-teal-500' },
  { name: 'Urologue', icon: '🩺', color: 'from-indigo-500 to-blue-500' },
  { name: 'Radiologue', icon: '📡', color: 'from-gray-500 to-slate-500' },
  { name: 'Anesthésiste', icon: '💉', color: 'from-purple-500 to-violet-500' },
  { name: 'Chirurgien', icon: '🔪', color: 'from-red-500 to-orange-500' },
];

// Pays disponibles avec devises
const countries = [
  { name: 'Tunisie', flag: '🇹🇳', currency: 'TND', currencyName: 'Dinar tunisien' },
  { name: 'Libye', flag: '🇱🇾', currency: 'LYD', currencyName: 'Dinar libyen' },
  { name: 'Algérie', flag: '🇩🇿', currency: 'DZD', currencyName: 'Dinar algérien' },
];

// Régions par pays
const regionsByCountry: { [key: string]: string[] } = {
  'Tunisie': ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Gafsa', 'Tozeur', 'Kébili', 'Gabès', 'Médenine', 'Tataouine'],
  'Libye': ['Tripoli', 'Benghazi', 'Misrata', 'Bayda', 'Zawiya', 'Zuwara', 'Ajdabiya', 'Tobruk', 'Sabha', 'Derna', 'Sirte', 'Zliten'],
  'Algérie': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Tlemcen', 'Béjaïa', 'Tiaret', 'Bordj Bou Arreridj', 'Djelfa', 'Saïda', 'Skikda', 'Mostaganem'],
};

// Conventions par pays
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
    pays: 'Tunisie',
    region: '',
    adresse: '',
    sexe: 'M',
    // Medecin specific
    specialite: '',
    conventione: false,
    typeConventions: [] as string[],
    tarif: '',
    matriculeFiscal: '',
    // Secretaire specific
    codeMedecin: '',
    diplome: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dropdown states
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await onRegister({ ...formData, role });
      if (role === 'medecin') {
        setSuccess('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur. Vous recevrez une notification une fois approuvé.');
      } else {
        setSuccess(result.message || 'Inscription réussie !');
      }
      setTimeout(() => {
        onBackToLogin();
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConventionType = (type: string) => {
    setFormData(prev => {
      const currentTypes = prev.typeConventions;
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      return { ...prev, typeConventions: newTypes };
    });
  };

  const filteredSpecialties = medicalSpecialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const selectedSpecialty = medicalSpecialties.find(s => s.name === formData.specialite);
  const selectedCountry = countries.find(c => c.name === formData.pays);
  const availableRegions = regionsByCountry[formData.pays] || [];
  const filteredRegions = availableRegions.filter(region =>
    region.toLowerCase().includes(regionSearch.toLowerCase())
  );

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

            {/* Modern Sexe Selection */}
            <div>
              <label className="block text-gray-700 mb-2">Sexe</label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => updateFormData('sexe', 'M')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.sexe === 'M'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">👨</span>
                    <span>Masculin</span>
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => updateFormData('sexe', 'F')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.sexe === 'F'
                      ? 'bg-gradient-to-br from-pink-500 to-pink-600 border-pink-500 text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">👩</span>
                    <span>Féminin</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Modern Country Dropdown */}
            <div className="relative">
              <label className="block text-gray-700 mb-2">Pays *</label>
              
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className={`w-full p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 rounded-xl text-left transition-all ${
                  isCountryOpen
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-2xl">
                    {selectedCountry?.flag || '🌍'}
                  </div>
                  <span className="text-gray-900">{formData.pays}</span>
                </div>
                <ChevronDown
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 transition-transform ${
                    isCountryOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCountryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {countries.map((country) => (
                      <motion.button
                        key={country.name}
                        type="button"
                        onClick={() => {
                          updateFormData('pays', country.name);
                          updateFormData('region', '');
                          setIsCountryOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-3 rounded-lg transition-all text-left ${
                          formData.pays === country.name
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{country.flag}</div>
                          <div className="flex-1">
                            <div>{country.name}</div>
                            <div className="text-xs opacity-75">{country.currencyName}</div>
                          </div>
                          {formData.pays === country.name && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Modern Region Dropdown */}
            <div className="relative">
              <label className="block text-gray-700 mb-2">Région *</label>
              
              <button
                type="button"
                onClick={() => setIsRegionOpen(!isRegionOpen)}
                className={`w-full p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 rounded-xl text-left transition-all ${
                  isRegionOpen
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className={formData.region ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.region || 'Sélectionner une région'}
                  </span>
                </div>
                <ChevronDown
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 transition-transform ${
                    isRegionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isRegionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden"
                >
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une région..."
                        value={regionSearch}
                        onChange={(e) => setRegionSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div 
                    className="max-h-[132px] overflow-y-auto p-1.5 grid grid-cols-2 gap-1.5 custom-scrollbar"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#3b82f6 #e5e7eb',
                    }}
                  >
                    {filteredRegions.map((region) => (
                      <motion.button
                        key={region}
                        type="button"
                        onClick={() => {
                          updateFormData('region', region);
                          setIsRegionOpen(false);
                          setRegionSearch('');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-2 rounded-lg border transition-all text-left ${
                          formData.region === region
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-md'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <MapPin className={`w-4 h-4 flex-shrink-0 ${formData.region === region ? 'text-white' : 'text-gray-400'}`} />
                          <span className="text-[11px] flex-1 leading-tight">{region}</span>
                          {formData.region === region && (
                            <Check className="w-3 h-3 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <input
                type="text"
                value={formData.region}
                onChange={() => {}}
                required
                className="absolute opacity-0 pointer-events-none"
                tabIndex={-1}
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

            {/* Medecin Specific Fields */}
            {role === 'medecin' && (
              <>
                {/* Modern Specialty Dropdown */}
                <div className="relative">
                  <label className="block text-gray-700 mb-2">Spécialité médicale *</label>
                  
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyOpen(!isSpecialtyOpen)}
                    className={`w-full p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 rounded-xl text-left transition-all ${
                      isSpecialtyOpen
                        ? 'border-blue-500 ring-2 ring-blue-500'
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    {selectedSpecialty ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedSpecialty.color} flex items-center justify-center text-xl`}>
                          {selectedSpecialty.icon}
                        </div>
                        <span className="text-gray-900">{selectedSpecialty.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-gray-500">Sélectionner une spécialité</span>
                      </div>
                    )}
                    <ChevronDown
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 transition-transform ${
                        isSpecialtyOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSpecialtyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher une spécialité..."
                            value={specialtySearch}
                            onChange={(e) => setSpecialtySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div 
                        className="max-h-[132px] overflow-y-auto p-1.5 grid grid-cols-2 gap-1.5 custom-scrollbar"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#3b82f6 #e5e7eb',
                        }}
                      >
                        {filteredSpecialties.length > 0 ? (
                          filteredSpecialties.map((specialty) => (
                            <motion.button
                              key={specialty.name}
                              type="button"
                              onClick={() => {
                                updateFormData('specialite', specialty.name);
                                setIsSpecialtyOpen(false);
                                setSpecialtySearch('');
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative p-2 rounded-lg border transition-all text-left ${
                                formData.specialite === specialty.name
                                  ? `bg-gradient-to-br ${specialty.color} border-transparent text-white shadow-md`
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-sm ${
                                    formData.specialite === specialty.name
                                      ? 'bg-white/20'
                                      : `bg-gradient-to-br ${specialty.color}`
                                  }`}
                                >
                                  {specialty.icon}
                                </div>
                                <span className="text-[11px] flex-1 leading-tight">{specialty.name}</span>
                                {formData.specialite === specialty.name && (
                                  <Check className="w-3 h-3 flex-shrink-0" />
                                )}
                              </div>
                            </motion.button>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-gray-500">
                            Aucune spécialité trouvée
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <input
                    type="text"
                    value={formData.specialite}
                    onChange={() => {}}
                    required
                    className="absolute opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                </div>

                <input
                  type="text"
                  placeholder={`Tarif (${selectedCountry?.currency || 'TND'})`}
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

                {/* Modern Toggle for Conventionné */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-gray-900">Conventionné</span>
                      <span className="text-gray-500 text-sm">Acceptez-vous les assurances ?</span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData('conventione', !formData.conventione)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      formData.conventione
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{
                        left: formData.conventione ? '30px' : '4px',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Modern Multiple Checkboxes for Conventions */}
                {formData.conventione && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <label className="block text-gray-700">
                      Sélectionner les types de conventions ({formData.typeConventions.length} sélectionné{formData.typeConventions.length > 1 ? 's' : ''})
                    </label>
                    
                    {/* Box avec scrollbar moderne */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-3">
                      <div 
                        className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar pr-2"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#3b82f6 #e5e7eb',
                        }}
                      >
                        {conventionsByCountry[formData.pays].map((convention) => (
                          <motion.button
                            key={convention}
                            type="button"
                            onClick={() => toggleConventionType(convention)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                              formData.typeConventions.includes(convention)
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                  formData.typeConventions.includes(convention)
                                    ? 'bg-white border-white'
                                    : 'border-gray-300'
                                }`}
                              >
                                {formData.typeConventions.includes(convention) && (
                                  <svg
                                    className="w-4 h-4 text-blue-600"
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
                              <span className="text-sm">{convention}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
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