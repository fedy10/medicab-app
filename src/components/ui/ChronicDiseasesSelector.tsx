import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Plus, ChevronDown, ChevronUp, AlertCircle, Stethoscope } from 'lucide-react';

interface Disease {
  name: string;
  isChronic: boolean;
  category?: string; // ID de la catégorie si chronique
}

interface DiseaseCategory {
  id: string;
  name: string;
  emoji: string;
  diseases: string[];
}

const diseaseCategories: DiseaseCategory[] = [
  {
    id: 'cardiovascular',
    name: 'Maladies cardiovasculaires',
    emoji: '🫀',
    diseases: [
      'Hypertension artérielle',
      'Insuffisance cardiaque',
      'Cardiopathie ischémique',
      'Troubles du rythme cardiaque',
      'Athérosclérose',
      'Accident vasculaire cérébral (AVC) – séquelles',
    ],
  },
  {
    id: 'metabolic',
    name: 'Maladies métaboliques et endocriniennes',
    emoji: '🍬',
    diseases: [
      'Diabète de type 1',
      'Diabète de type 2',
      'Dyslipidémie (cholestérol élevé)',
      'Obésité',
      'Hypothyroïdie',
      'Hyperthyroïdie',
      'Syndrome des ovaires polykystiques (SOPK)',
    ],
  },
  {
    id: 'respiratory',
    name: 'Maladies respiratoires chroniques',
    emoji: '🫁',
    diseases: [
      'Asthme',
      'Broncho-pneumopathie chronique obstructive (BPCO)',
      'Apnée du sommeil',
      'Fibrose pulmonaire',
      'Bronchite chronique',
    ],
  },
  {
    id: 'neurological',
    name: 'Maladies neurologiques chroniques',
    emoji: '🧠',
    diseases: [
      'Épilepsie',
      'Maladie de Parkinson',
      'Maladie d\'Alzheimer',
      'Sclérose en plaques',
      'Migraine chronique',
      'Neuropathies périphériques',
    ],
  },
  {
    id: 'rheumatological',
    name: 'Maladies rhumatologiques et musculo-squelettiques',
    emoji: '🦴',
    diseases: [
      'Arthrose',
      'Polyarthrite rhumatoïde',
      'Lupus érythémateux systémique',
      'Spondylarthrite ankylosante',
      'Fibromyalgie',
      'Ostéoporose',
    ],
  },
  {
    id: 'autoimmune',
    name: 'Maladies auto-immunes chroniques',
    emoji: '🧬',
    diseases: [
      'Lupus',
      'Maladie de Hashimoto',
      'Maladie de Basedow',
      'Psoriasis',
      'Sclérodermie',
      'Maladie cœliaque',
    ],
  },
  {
    id: 'psychiatric',
    name: 'Maladies psychiatriques chroniques',
    emoji: '🧠',
    diseases: [
      'Dépression chronique',
      'Trouble bipolaire',
      'Schizophrénie',
      'Troubles anxieux généralisés',
      'Troubles obsessionnels compulsifs (TOC)',
    ],
  },
  {
    id: 'digestive',
    name: 'Maladies digestives chroniques',
    emoji: '🍽️',
    diseases: [
      'Maladie de Crohn',
      'Rectocolite hémorragique',
      'Syndrome de l\'intestin irritable',
      'Hépatite chronique B ou C',
      'Cirrhose',
      'Reflux gastro-œsophagien chronique (RGO)',
    ],
  },
  {
    id: 'renal',
    name: 'Maladies rénales et urologiques',
    emoji: '🩺',
    diseases: [
      'Insuffisance rénale chronique',
      'Maladie rénale polykystique',
      'Infections urinaires récidivantes',
      'Incontinence urinaire chronique',
    ],
  },
  {
    id: 'pediatric',
    name: 'Maladies chroniques chez l\'enfant',
    emoji: '🧒',
    diseases: [
      'Asthme',
      'Diabète de type 1',
      'Épilepsie',
      'Autisme',
      'Drépanocytose',
    ],
  },
  {
    id: 'genetic',
    name: 'Maladies génétiques chroniques',
    emoji: '🧬',
    diseases: [
      'Drépanocytose',
      'Mucoviscidose',
      'Hémophilie',
      'Thalassémie',
      'Dystrophie musculaire',
    ],
  },
];

interface ChronicDiseasesSelectorProps {
  selectedDiseases: Disease[];
  onChange: (diseases: Disease[]) => void;
  label?: string;
  className?: string;
  isEditing?: boolean;
}

export function ChronicDiseasesSelector({
  selectedDiseases,
  onChange,
  label = 'Maladies',
  className = '',
  isEditing = false,
}: ChronicDiseasesSelectorProps) {
  const [customDiseaseName, setCustomDiseaseName] = useState('');
  const [customDiseaseIsChronic, setCustomDiseaseIsChronic] = useState(true);
  const [customDiseaseCategory, setCustomDiseaseCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleDisease = (diseaseName: string, categoryId: string) => {
    if (!isEditing) return;
    
    const existingDisease = selectedDiseases.find(d => d.name === diseaseName);
    
    if (existingDisease) {
      onChange(selectedDiseases.filter(d => d.name !== diseaseName));
    } else {
      onChange([
        ...selectedDiseases,
        {
          name: diseaseName,
          isChronic: true,
          category: categoryId,
        },
      ]);
    }
  };

  const addCustomDisease = () => {
    if (customDiseaseName.trim() && !selectedDiseases.find(d => d.name === customDiseaseName.trim())) {
      const newDisease: Disease = {
        name: customDiseaseName.trim(),
        isChronic: customDiseaseIsChronic,
        category: customDiseaseIsChronic ? customDiseaseCategory : undefined,
      };
      
      onChange([...selectedDiseases, newDisease]);
      setCustomDiseaseName('');
      setCustomDiseaseIsChronic(true);
      setCustomDiseaseCategory('');
      setShowCustomInput(false);
    }
  };

  const removeDisease = (diseaseName: string) => {
    if (!isEditing) return;
    onChange(selectedDiseases.filter(d => d.name !== diseaseName));
  };

  const isPredefinedDisease = (diseaseName: string) => {
    return diseaseCategories.some((category) =>
      category.diseases.includes(diseaseName)
    );
  };

  const getCategoryById = (categoryId: string) => {
    return diseaseCategories.find(c => c.id === categoryId);
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Grouper les maladies chroniques par catégorie
  const chronicDiseasesByCategory: { [key: string]: Disease[] } = {};
  const nonChronicDiseases: Disease[] = [];

  selectedDiseases.forEach(disease => {
    if (disease.isChronic && disease.category) {
      if (!chronicDiseasesByCategory[disease.category]) {
        chronicDiseasesByCategory[disease.category] = [];
      }
      chronicDiseasesByCategory[disease.category].push(disease);
    } else if (!disease.isChronic) {
      nonChronicDiseases.push(disease);
    }
  });

  // Mode lecture : afficher UNIQUEMENT les maladies chroniques sélectionnées par système
  if (!isEditing) {
    const hasChronicDiseases = Object.keys(chronicDiseasesByCategory).length > 0;
    const hasNonChronicDiseases = nonChronicDiseases.length > 0;
    
    if (!hasChronicDiseases && !hasNonChronicDiseases) {
      return (
        <div className={className}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {label}
            </label>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 text-center"
          >
            <Stethoscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 italic">Aucune maladie enregistrée</p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {label}
          </label>
        )}

        <div className="space-y-4">
          {/* UNIQUEMENT Maladies chroniques sélectionnées par système */}
          {hasChronicDiseases && (
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-2xl p-4 border-2 border-red-200 shadow-lg">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-md"></div>
                <h5 className="text-base font-bold text-red-800">🩺 Maladies chroniques</h5>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(chronicDiseasesByCategory).map(([categoryId, diseases], index) => {
                  const category = getCategoryById(categoryId);
                  if (!category) return null;

                  return (
                    <motion.div
                      key={categoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-3 border-2 border-red-300 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-red-100">
                        <motion.span 
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="text-2xl"
                        >
                          {category.emoji}
                        </motion.span>
                        <h6 className="text-xs font-bold text-red-700 leading-tight">{category.name}</h6>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {diseases.map((disease) => (
                          <motion.span
                            key={disease.name}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="px-2.5 py-1 bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-300 rounded-lg text-xs font-semibold shadow-sm"
                          >
                            {disease.name}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Maladies non chroniques - Section séparée */}
          {hasNonChronicDiseases && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-4 border-2 border-blue-200 shadow-lg">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-md"></div>
                <h5 className="text-base font-bold text-blue-800">💊 Autres maladies</h5>
              </motion.div>
              <div className="bg-white rounded-xl p-3 border-2 border-blue-300 shadow-md">
                <div className="flex flex-wrap gap-1.5">
                  {nonChronicDiseases.map((disease) => (
                    <motion.span
                      key={disease.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      {disease.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mode édition : afficher toutes les catégories avec checkboxes (3 par ligne)
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </label>
      )}

      {/* Categories - 3 par ligne avec design ultra-moderne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {diseaseCategories.map((category, categoryIndex) => {
          const isExpanded = expandedCategories.includes(category.id);
          const selectedInCategory = category.diseases.filter((d) =>
            selectedDiseases.find(sd => sd.name === d)
          ).length;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.03 }}
              className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all"
            >
              {/* Category Header - Ultra moderne */}
              <motion.button
                type="button"
                onClick={() => toggleCategory(category.id)}
                whileHover={{ backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white transition-all relative overflow-hidden group"
              >
                {/* Decorative shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                
                <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                  <motion.span 
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="text-2xl flex-shrink-0"
                  >
                    {category.emoji}
                  </motion.span>
                  <div className="text-left min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{category.name}</h4>
                    {selectedInCategory > 0 && (
                      <motion.p 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-blue-600 font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {selectedInCategory} sélectionnée(s)
                      </motion.p>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </motion.button>

              {/* Category Diseases avec animations */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2 bg-gradient-to-br from-gray-50 to-white max-h-72 overflow-y-auto">
                      {category.diseases.map((disease, diseaseIndex) => {
                        const isSelected = selectedDiseases.some(d => d.name === disease);

                        return (
                          <motion.label
                            key={disease}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: diseaseIndex * 0.02 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className="relative flex items-center pt-0.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleDisease(disease, category.id)}
                                className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
                              />
                            </div>
                            <span
                              className={`flex-1 text-xs font-medium leading-snug ${
                                isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700'
                              }`}
                            >
                              {disease}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 500,
                                  damping: 25,
                                }}
                                className="flex-shrink-0"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              </motion.div>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Custom diseases display - Modernisé */}
      {selectedDiseases.filter((d) => !isPredefinedDisease(d.name)).length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Custom chronic diseases grouped by category */}
          {Object.entries(
            selectedDiseases
              .filter(d => !isPredefinedDisease(d.name) && d.isChronic && d.category)
              .reduce((acc, disease) => {
                if (!disease.category) return acc;
                if (!acc[disease.category]) acc[disease.category] = [];
                acc[disease.category].push(disease);
                return acc;
              }, {} as { [key: string]: Disease[] })
          ).map(([categoryId, diseases]) => {
            const category = getCategoryById(categoryId);
            if (!category) return null;

            return (
              <motion.div 
                key={categoryId} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-300 shadow-md"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{category.emoji}</span>
                  <p className="text-sm font-bold text-purple-900">
                    {category.name} <span className="text-purple-600">(personnalisées)</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pl-7">
                  {diseases.map((disease) => (
                    <motion.div
                      key={disease.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-purple-900 border-2 border-purple-400 rounded-lg shadow-sm"
                    >
                      <span className="text-sm font-semibold">{disease.name}</span>
                      <motion.button
                        type="button"
                        onClick={() => removeDisease(disease.name)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="hover:bg-purple-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-purple-700" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Custom non-chronic diseases */}
          {selectedDiseases.filter(d => !isPredefinedDisease(d.name) && !d.isChronic).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-300 shadow-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                <p className="text-sm font-bold text-indigo-900">
                  Autres maladies <span className="text-indigo-600">(personnalisées)</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
                {selectedDiseases
                  .filter(d => !isPredefinedDisease(d.name) && !d.isChronic)
                  .map((disease) => (
                    <motion.div
                      key={disease.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-900 border-2 border-indigo-400 rounded-lg shadow-sm"
                    >
                      <span className="text-sm font-semibold">{disease.name}</span>
                      <motion.button
                        type="button"
                        onClick={() => removeDisease(disease.name)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="hover:bg-indigo-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-indigo-700" />
                      </motion.button>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Add custom disease - Design ultra-moderne */}
      {showCustomInput ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Nom de la maladie
            </label>
            <input
              type="text"
              value={customDiseaseName}
              onChange={(e) => setCustomDiseaseName(e.target.value)}
              placeholder="Ex: Allergie au pollen..."
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Type de maladie
            </label>
            <div className="flex gap-3">
              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                  customDiseaseIsChronic 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={customDiseaseIsChronic}
                  onChange={() => setCustomDiseaseIsChronic(true)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">🩺 Chronique</span>
              </motion.label>
              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                  !customDiseaseIsChronic 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={!customDiseaseIsChronic}
                  onChange={() => setCustomDiseaseIsChronic(false)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">💊 Non chronique</span>
              </motion.label>
            </div>
          </div>

          <AnimatePresence>
            {customDiseaseIsChronic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Système / Spécialité
                </label>
                <select
                  value={customDiseaseCategory}
                  onChange={(e) => setCustomDiseaseCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white shadow-sm font-medium"
                >
                  <option value="">Sélectionner un système...</option>
                  {diseaseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            <motion.button
              type="button"
              onClick={addCustomDisease}
              disabled={!customDiseaseName.trim() || (customDiseaseIsChronic && !customDiseaseCategory)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              ✓ Ajouter
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomDiseaseName('');
                setCustomDiseaseIsChronic(true);
                setCustomDiseaseCategory('');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
            >
              Annuler
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          onClick={() => setShowCustomInput(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all font-bold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Ajouter une maladie personnalisée
        </motion.button>
      )}
    </div>
  );
}