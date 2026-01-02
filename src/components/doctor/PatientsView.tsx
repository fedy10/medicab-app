import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, User, Phone, MapPin, FileText } from 'lucide-react';
import { PatientFileView } from './PatientFileView';
import { PaginationComponent } from '../ui/PaginationComponent';
import { useLanguage } from '../../contexts/LanguageContext';

interface Disease {
  name: string;
  isChronic: boolean;
  category?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  job: string;
  lastVisit: string;
  consultationsCount: number;
  diseases: Disease[];
  consultations: {
    date: string;
    prescription: string;
    analysis: string;
    imaging: string;
    notes: string;
  }[];
  files: any[];
}

interface PatientsViewProps {
  doctorId: string;
}

export function PatientsView({ doctorId }: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(4);
  const { t } = useLanguage();

  const patients: Patient[] = [
    {
      id: '1',
      name: t('patient_name_1'),
      age: 45,
      gender: 'male',
      phone: '+216 98 123 456',
      address: t('address_tunis_bourguiba'),
      job: t('job_teacher'),
      lastVisit: '2024-12-11',
      consultationsCount: 8,
      diseases: [
        { name: t('disease_hypertension'), isChronic: true },
        { name: t('disease_diabetes_type2'), isChronic: true },
      ],
      consultations: [
        {
          date: '2024-11-15',
          prescription: t('prescription_metformin') + '\n' + t('prescription_ramipril'),
          analysis: t('analysis_glucose') + '\n' + t('analysis_hba1c'),
          imaging: '',
          notes: t('note_patient_stable'),
        },
      ],
      files: [],
    },
    {
      id: '2',
      name: t('patient_name_2'),
      age: 35,
      gender: 'female',
      phone: '+216 22 987 654',
      address: t('address_sousse_nov7'),
      job: t('job_pharmacist'),
      lastVisit: '2024-12-10',
      consultationsCount: 5,
      diseases: [
        { name: t('disease_chronic_migraine'), isChronic: true },
      ],
      consultations: [
        {
          date: '2024-10-05',
          prescription: t('prescription_sumatriptan'),
          analysis: '',
          imaging: '',
          notes: t('note_crisis_decreasing'),
        },
      ],
      files: [],
    },
    {
      id: '3',
      name: t('patient_name_3'),
      age: 28,
      gender: 'male',
      phone: '+216 55 321 789',
      address: t('address_sfax_republique'),
      job: t('job_engineer'),
      lastVisit: '2024-12-11',
      consultationsCount: 1,
      diseases: [],
      consultations: [],
      files: [],
    },
    {
      id: '4',
      name: t('patient_name_4'),
      age: 52,
      gender: 'female',
      phone: '+216 29 654 321',
      address: t('address_monastir_liberte'),
      job: t('job_merchant'),
      lastVisit: '2024-12-09',
      consultationsCount: 12,
      diseases: [
        { name: t('disease_arthritis'), isChronic: true },
      ],
      consultations: [],
      files: [],
    },
    {
      id: '5',
      name: t('patient_name_5'),
      age: 41,
      gender: 'male',
      phone: '+216 98 777 888',
      address: t('address_bizerte_thameur'),
      job: t('job_lawyer'),
      lastVisit: '2024-12-08',
      consultationsCount: 6,
      diseases: [],
      consultations: [],
      files: [],
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(search) ||
      patient.phone.includes(search) ||
      patient.address.toLowerCase().includes(search)
    );
  });

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
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
      alert(t('error'));
    }
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder={t('search_patients')}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceSearch}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Mic className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {filteredPatients.length} {t('patients').toLowerCase()} {t('found')}
        </p>
      </div>

      {/* Patients list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => setSelectedPatient(patient)}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${
                patient.gender === 'male'
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-pink-500 to-purple-500'
              }`}>
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-gray-900 mb-1">{patient.name}</h4>
                    <p className="text-sm text-gray-600">{patient.age} {t('years_old')} • {patient.gender === 'male' ? t('male') : t('female')}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <FileText className="w-3 h-3" />
                    {patient.consultationsCount}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{patient.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {t('last_visit')} : <strong>{new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</strong>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('no_patients')}</p>
        </div>
      )}

      {/* Pagination */}
      <PaginationComponent
        totalItems={filteredPatients.length}
        itemsPerPage={patientsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Patient file modal */}
      <AnimatePresence>
        {selectedPatient && (
          <PatientFileView
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            canUploadFiles={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}