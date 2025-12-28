import { motion } from 'motion/react';
import { Clock, User } from 'lucide-react';

interface Consultation {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'control';
  isNew: boolean;
}

export function SecretaryConsultationsView() {
  const consultations: Consultation[] = [
    {
      id: '1',
      patientName: 'Mohamed Gharbi',
      date: '2024-12-11',
      time: '09:00',
      type: 'consultation',
      isNew: false,
    },
    {
      id: '2',
      patientName: 'Youssef Hamdi',
      date: '2024-12-11',
      time: '11:00',
      type: 'consultation',
      isNew: true,
    },
    {
      id: '3',
      patientName: 'Amira Ben Said',
      date: '2024-12-10',
      time: '14:00',
      type: 'control',
      isNew: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-gray-900 mb-4">Consultations confirmées</h3>
        <p className="text-gray-600">
          Liste des rendez-vous confirmés. Seul le médecin peut créer de nouvelles consultations.
        </p>
      </div>

      {/* Consultations list */}
      <div className="space-y-4">
        {consultations.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-gray-900">{consultation.patientName}</h4>
                    {consultation.isNew && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Nouveau patient
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {consultation.date} à {consultation.time}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        consultation.type === 'consultation'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {consultation.type === 'consultation' ? 'Consultation' : 'Contrôle'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
