import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, User, Phone, MapPin, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { PatientFileView } from './PatientFileView';
import { PaginationComponent } from '../ui/PaginationComponent';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePatients } from '../../hooks/useSupabase';

interface PatientsViewProps {
  doctorId: string;
}

export function PatientsView({ doctorId }: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { t } = useLanguage();

  // Utiliser le hook Supabase
  const { patients, loading, createPatient, updatePatient, deletePatient } = usePatients(doctorId);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    profession: '',
    diseases: [] as string[],
  });

  const handleStartListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.phone) {
      alert('Veuillez remplir au moins le nom et le téléphone');
      return;
    }

    try {
      setProcessing(true);
      
      await createPatient({
        name: newPatient.name,
        age: newPatient.age ? parseInt(newPatient.age) : null,
        phone: newPatient.phone,
        email: newPatient.email || null,
        address: newPatient.address || null,
        profession: newPatient.profession || null,
        doctor_id: doctorId,
        diseases: newPatient.diseases,
      });

      alert('✅ Patient créé avec succès !');
      
      // Réinitialiser le formulaire
      setNewPatient({
        name: '',
        age: '',
        phone: '',
        email: '',
        address: '',
        profession: '',
        diseases: [],
      });
      
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Erreur création patient:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return;
    }

    try {
      await deletePatient(patientId);
      alert('✅ Patient supprimé');
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  // Filtrer les patients par recherche
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (selectedPatient) {
    return (
      <PatientFileView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        doctorId={doctorId}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des patients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-gray-900">{t('patients')}</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_patient')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleStartListening}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'
              }`}
              title={t('voice_search')}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Add Patient Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nouveaux (7j)</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(p.created_at) > weekAgo;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recherche</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {currentPatients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Ajouter le premier patient
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">{patient.name}</h3>
                      {patient.age && (
                        <p className="text-sm text-gray-500">{patient.age} ans</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{patient.phone}</span>
                    </div>
                  )}
                  
                  {patient.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  )}

                  {patient.diseases && patient.diseases.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{patient.diseases.length} maladie(s)</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatient(patient);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Voir dossier
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePatient(patient.id);
                    }}
                    className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !processing && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">Nouveau Patient</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={processing}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: Mohamed Ben Ali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: +216 98 123 456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Âge</label>
                      <input
                        type="number"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 35"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Email</label>
                      <input
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: Tunis, Tunisie"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Profession</label>
                    <input
                      type="text"
                      value={newPatient.profession}
                      onChange={(e) => setNewPatient({ ...newPatient, profession: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: Ingénieur"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      disabled={processing}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddPatient}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
                    >
                      {processing ? 'Création...' : 'Créer le patient'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
