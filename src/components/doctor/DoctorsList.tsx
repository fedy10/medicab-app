import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, MapPin, Phone, MessageSquare, User, ChevronLeft, ChevronRight, ChevronDown, Globe } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  avatar?: string;
}

interface DoctorsListProps {
  specialty: string;
  onSelectDoctor: (doctor: Doctor) => void;
  onCancel: () => void;
}

// Mock data - En production, cela viendrait de la base de données
const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Ahmed Benali',
    specialty: 'Cardiologie',
    address: 'Avenue Habib Bourguiba',
    city: 'Tunis',
    region: 'Tunis',
    country: 'Tunisie',
    phone: '+216 71 123 456',
    email: 'ahmed.benali@medicab.tn',
  },
  {
    id: 'd2',
    name: 'Dr. Leila Trabelsi',
    specialty: 'Cardiologie',
    address: 'Rue de la Liberté',
    city: 'Sfax',
    region: 'Sfax',
    country: 'Tunisie',
    phone: '+216 74 234 567',
    email: 'leila.trabelsi@medicab.tn',
  },
  {
    id: 'd3',
    name: 'Dr. Mohamed Khalil',
    specialty: 'Cardiologie',
    address: 'Boulevard 7 Novembre',
    city: 'Sousse',
    region: 'Sousse',
    country: 'Tunisie',
    phone: '+216 73 345 678',
    email: 'mohamed.khalil@medicab.tn',
  },
  {
    id: 'd4',
    name: 'Dr. Sonia Mansour',
    specialty: 'Dermatologie',
    address: 'Avenue Mohamed V',
    city: 'Tunis',
    region: 'Tunis',
    country: 'Tunisie',
    phone: '+216 71 456 789',
    email: 'sonia.mansour@medicab.tn',
  },
  {
    id: 'd5',
    name: 'Dr. Karim Hadj',
    specialty: 'Dermatologie',
    address: 'Rue de Marseille',
    city: 'Bizerte',
    region: 'Bizerte',
    country: 'Tunisie',
    phone: '+216 72 567 890',
    email: 'karim.hadj@medicab.tn',
  },
  {
    id: 'd6',
    name: 'Dr. Amira Ben Salem',
    specialty: 'Pédiatrie',
    address: 'Avenue de la République',
    city: 'Tunis',
    region: 'Tunis',
    country: 'Tunisie',
    phone: '+216 71 678 901',
    email: 'amira.bensalem@medicab.tn',
  },
  {
    id: 'd7',
    name: 'Dr. Nabil Bouazizi',
    specialty: 'Neurologie',
    address: 'Rue Ibn Khaldoun',
    city: 'Monastir',
    region: 'Monastir',
    country: 'Tunisie',
    phone: '+216 73 789 012',
    email: 'nabil.bouazizi@medicab.tn',
  },
  {
    id: 'd8',
    name: 'Dr. Rania Chakroun',
    specialty: 'Gynécologie-obstétrique',
    address: 'Boulevard de l\'Environnement',
    city: 'Tunis',
    region: 'Tunis',
    country: 'Tunisie',
    phone: '+216 71 890 123',
    email: 'rania.chakroun@medicab.tn',
  },
  {
    id: 'd9',
    name: 'Dr. Farid Alaoui',
    specialty: 'Cardiologie',
    address: 'Boulevard Mohammed V',
    city: 'Alger',
    region: 'Alger',
    country: 'Algérie',
    phone: '+213 21 123 456',
    email: 'farid.alaoui@medicab.dz',
  },
  {
    id: 'd10',
    name: 'Dr. Yasmine Belkacem',
    specialty: 'Cardiologie',
    address: 'Rue Didouche Mourad',
    city: 'Oran',
    region: 'Oran',
    country: 'Algérie',
    phone: '+213 41 234 567',
    email: 'yasmine.belkacem@medicab.dz',
  },
  {
    id: 'd11',
    name: 'Dr. Omar El-Mansouri',
    specialty: 'Cardiologie',
    address: 'Sharia Al-Nasr',
    city: 'Tripoli',
    region: 'Tripoli',
    country: 'Libye',
    phone: '+218 21 345 678',
    email: 'omar.mansouri@medicab.ly',
  },
  {
    id: 'd12',
    name: 'Dr. Salma Khalifa',
    specialty: 'Cardiologie',
    address: 'Omar Al-Mukhtar Street',
    city: 'Benghazi',
    region: 'Benghazi',
    country: 'Libye',
    phone: '+218 61 456 789',
    email: 'salma.khalifa@medicab.ly',
  },
];

const ITEMS_PER_PAGE = 4;

// Custom Dropdown Component
function CustomDropdown({ 
  value, 
  options, 
  onChange, 
  placeholder,
  icon: Icon,
  disabled = false
}: { 
  value: string; 
  options: Array<{ value: string; label: string; emoji?: string }>; 
  onChange: (value: string) => void;
  placeholder: string;
  icon?: any;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white flex items-center justify-between transition-all text-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          <span>
            {selectedOption ? (
              <>
                {selectedOption.emoji && <span className="mr-1">{selectedOption.emoji}</span>}
                {selectedOption.label}
              </>
            ) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[9999] max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-2 text-sm ${
                    value === option.value
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.emoji && <span className="text-lg">{option.emoji}</span>}
                  <span>{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DoctorsList({ specialty, onSelectDoctor, onCancel }: DoctorsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les médecins par spécialité
  const filteredDoctorsBySpecialty = mockDoctors.filter(
    (doc) => doc.specialty.toLowerCase() === specialty.toLowerCase()
  );

  // Extraire les pays et régions uniques
  const countryOptions = useMemo(() => {
    const uniqueCountries = Array.from(new Set(filteredDoctorsBySpecialty.map(d => d.country)));
    const flags: { [key: string]: string } = {
      'Tunisie': '🇹🇳',
      'Algérie': '🇩🇿',
      'Libye': '🇱🇾',
    };
    return [
      { value: 'all', label: 'Tous les pays', emoji: '🌍' },
      ...uniqueCountries.map(country => ({
        value: country,
        label: country,
        emoji: flags[country] || '🌍'
      }))
    ];
  }, [filteredDoctorsBySpecialty]);

  const regionOptions = useMemo(() => {
    const filteredByCountry = selectedCountry === 'all' 
      ? filteredDoctorsBySpecialty 
      : filteredDoctorsBySpecialty.filter(d => d.country === selectedCountry);
    const uniqueRegions = Array.from(new Set(filteredByCountry.map(d => d.region)));
    return [
      { value: 'all', label: 'Toutes les régions' },
      ...uniqueRegions.map(region => ({
        value: region,
        label: region
      }))
    ];
  }, [filteredDoctorsBySpecialty, selectedCountry]);

  // Appliquer tous les filtres
  const filteredDoctors = useMemo(() => {
    let filtered = filteredDoctorsBySpecialty;

    // Filtre par pays
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(d => d.country === selectedCountry);
    }

    // Filtre par région
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(d => d.region === selectedRegion);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.address.toLowerCase().includes(query) ||
        doctor.city.toLowerCase().includes(query) ||
        doctor.phone.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [filteredDoctorsBySpecialty, selectedCountry, selectedRegion, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDoctors, currentPage]);

  // Reset page when filters change
  const handleFilterChange = (filterSetter: (value: string) => void, value: string) => {
    filterSetter(value);
    setCurrentPage(1);
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Tunisie': '🇹🇳',
      'Algérie': '🇩🇿',
      'Libye': '🇱🇾',
    };
    return flags[country] || '🌍';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 text-white relative flex-shrink-0">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
          </div>

          <div className="relative z-10">
            <button
              onClick={onCancel}
              className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-xl transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-1">Sélectionner un médecin</h3>
              <p className="text-sm opacity-90">{specialty}</p>
            </div>

            {/* Search and Filters in one row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-50">{/* Added z-50 here */}
              {/* Search Bar */}
              <div className="md:col-span-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Country Filter */}
              <div className="md:col-span-3">
                <CustomDropdown
                  value={selectedCountry}
                  options={countryOptions}
                  onChange={(value) => {
                    handleFilterChange(setSelectedCountry, value);
                    setSelectedRegion('all');
                  }}
                  placeholder="Pays"
                  icon={Globe}
                />
              </div>

              {/* Region Filter */}
              <div className="md:col-span-3">
                <CustomDropdown
                  value={selectedRegion}
                  options={regionOptions}
                  onChange={(value) => handleFilterChange(setSelectedRegion, value)}
                  placeholder="Région"
                  icon={MapPin}
                  disabled={selectedCountry === 'all'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <User className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-lg font-medium text-gray-600 mb-1">Aucun médecin trouvé</p>
              <p className="text-sm text-gray-500">Essayez de modifier vos critères</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {paginatedDoctors.map((doctor, index) => (
                  <motion.button
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectDoctor(doctor)}
                    className="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all text-left bg-white group relative overflow-hidden"
                  >
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md text-sm">
                        {doctor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors text-sm">
                          {doctor.name}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{getCountryFlag(doctor.country)}</span>
                            <span className="font-medium">{doctor.city}, {doctor.region}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>{doctor.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    Page {currentPage} / {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg font-medium transition-all text-sm ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    {filteredDoctors.length} résultat{filteredDoctors.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}