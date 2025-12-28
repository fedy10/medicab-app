import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Clock, User, Edit, Trash2 } from 'lucide-react';
import { AppointmentConfirmation } from '../doctor/AppointmentConfirmation';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  time: string;
  isConfirmed: boolean;
  type: 'consultation' | 'control';
  isNewPatient?: boolean;
  paymentType?: 'normal' | 'cnam' | 'insurance' | 'free';
  amountPaid?: number;
}

interface SecretaryAgendaViewProps {
  secretaryId?: string;
  doctorId?: string;
}

// Base de données des patients existants
const existingPatients = [
  { name: 'Mohamed Gharbi', phone: '+216 98 123 456' },
  { name: 'Amira Ben Said', phone: '+216 22 987 654' },
  { name: 'Salma Trabelsi', phone: '+216 29 654 321' },
];

// Tarif du médecin (pourrait venir de l'API/base de données)
const DOCTOR_TARIFF = 60;

export function SecretaryAgendaView({ secretaryId, doctorId }: SecretaryAgendaViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<Appointment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'Mohamed Gharbi',
      patientPhone: '+216 98 123 456',
      time: '09:00',
      isConfirmed: true,
      type: 'consultation',
      isNewPatient: false,
    },
    {
      id: '2',
      patientName: 'Amira Ben Said',
      patientPhone: '+216 22 987 654',
      time: '10:00',
      isConfirmed: false,
      type: 'control',
      isNewPatient: false,
    },
    {
      id: '3',
      patientName: 'Youssef Hamdi',
      patientPhone: '+216 55 321 789',
      time: '11:00',
      isConfirmed: true,
      type: 'consultation',
      isNewPatient: true,
    },
    {
      id: '4',
      patientName: 'Salma Trabelsi',
      patientPhone: '+216 29 654 321',
      time: '14:00',
      isConfirmed: false,
      type: 'consultation',
      isNewPatient: false,
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientPhone: '',
    time: '',
    type: 'consultation' as 'consultation' | 'control',
    paymentType: 'normal' as 'normal' | 'cnam' | 'insurance' | 'free',
    amountPaid: 0,
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const checkIfExistingPatient = (phone: string, name: string): boolean => {
    return existingPatients.some(
      (patient) => patient.phone === phone || patient.name.toLowerCase() === name.toLowerCase()
    );
  };

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleAddAppointment = () => {
    if (newAppointment.patientName && newAppointment.patientPhone && newAppointment.time) {
      const isExisting = checkIfExistingPatient(newAppointment.patientPhone, newAppointment.patientName);
      
      setAppointments([
        ...appointments,
        {
          id: Date.now().toString(),
          patientName: newAppointment.patientName,
          patientPhone: newAppointment.patientPhone,
          time: newAppointment.time,
          type: newAppointment.type,
          isConfirmed: false,
          isNewPatient: !isExisting,
          paymentType: newAppointment.paymentType,
          amountPaid: newAppointment.amountPaid,
        },
      ]);
      
      // Ajouter le patient à la liste s'il est nouveau
      if (!isExisting) {
        existingPatients.push({
          name: newAppointment.patientName,
          phone: newAppointment.patientPhone,
        });
      }
      
      setNewAppointment({ patientName: '', patientPhone: '', time: '', type: 'consultation', paymentType: 'normal', amountPaid: 0 });
      setShowAddAppointment(false);
      showSuccess('Rendez-vous créé avec succès !');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      time: appointment.time,
      type: appointment.type,
      paymentType: appointment.paymentType || 'normal',
      amountPaid: appointment.amountPaid || 0,
    });
    setShowAddAppointment(true);
  };

  const handleUpdateAppointment = () => {
    if (editingAppointment && newAppointment.patientName && newAppointment.patientPhone && newAppointment.time) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                patientName: newAppointment.patientName,
                patientPhone: newAppointment.patientPhone,
                time: newAppointment.time,
                type: newAppointment.type,
                paymentType: newAppointment.paymentType,
                amountPaid: newAppointment.amountPaid,
              }
            : apt
        )
      );
      setNewAppointment({ patientName: '', patientPhone: '', time: '', type: 'consultation', paymentType: 'normal', amountPaid: 0 });
      setEditingAppointment(null);
      setShowAddAppointment(false);
      showSuccess('Rendez-vous modifié avec succès !');
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setShowDeleteDialog(appointment);
  };

  const confirmDelete = () => {
    if (showDeleteDialog) {
      setAppointments(appointments.filter((apt) => apt.id !== showDeleteDialog.id));
      setShowDeleteDialog(null);
      showSuccess('Rendez-vous supprimé avec succès !');
    }
  };

  const handleConfirmAppointment = (paymentInfo: {
    paymentType: 'normal' | 'cnam' | 'insurance' | 'free';
    amountPaid?: number;
  }) => {
    if (showConfirmDialog) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === showConfirmDialog.id 
            ? { 
                ...apt, 
                isConfirmed: true,
                paymentType: paymentInfo.paymentType,
                amountPaid: paymentInfo.amountPaid || 0,
              } 
            : apt
        )
      );
      setShowConfirmDialog(null);
      showSuccess('Rendez-vous confirmé avec succès !');
    }
  };

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toDateString();
    return selectedDate.toDateString() === today;
  });

  return (
    <div className="space-y-6">
      {/* Success message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-gray-900">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingAppointment(null);
              setNewAppointment({ patientName: '', patientPhone: '', time: '', type: 'consultation', paymentType: 'normal', amountPaid: 0 });
              setShowAddAppointment(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Nouveau rendez-vous
          </motion.button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-center text-sm text-gray-600 py-2">
              {day}
            </div>
          ))}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday =
              day === new Date().getDate() &&
              selectedDate.getMonth() === new Date().getMonth() &&
              selectedDate.getFullYear() === new Date().getFullYear();
            const isSelected =
              day === selectedDate.getDate() &&
              selectedDate.getMonth() === selectedDate.getMonth();

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                  )
                }
                className={`aspect-square p-2 rounded-xl transition-all ${
                  isToday
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg'
                    : isSelected
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-gray-900 mb-4">Planning du jour</h3>
        <div className="space-y-2">
          {timeSlots.map((time, index) => {
            const appointment = todayAppointments.find((apt) => apt.time === time);
            return (
              <motion.div
                key={time}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  appointment
                    ? appointment.isConfirmed
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="w-16 text-sm text-gray-600">{time}</div>
                {appointment ? (
                  <>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                        {appointment.patientName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900">{appointment.patientName}</p>
                          {appointment.isNewPatient && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          appointment.type === 'consultation'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {appointment.type === 'consultation' ? 'Consultation' : 'Contrôle'}
                      </span>
                      {!appointment.isConfirmed && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowConfirmDialog(appointment)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          title="Confirmer"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditAppointment(appointment)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteAppointment(appointment)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-sm text-gray-400">Disponible</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit appointment modal */}
      <AnimatePresence>
        {showAddAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddAppointment(false);
              setEditingAppointment(null);
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-gray-900 mb-6">
                {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nom du patient</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={newAppointment.patientName}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, patientName: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Mohamed Gharbi"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={newAppointment.patientPhone}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, patientPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="+216 98 123 456"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, type: e.target.value as 'consultation' | 'control' })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="control">Contrôle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Heure</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={newAppointment.time}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, time: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Sélectionner une heure</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Type de paiement</label>
                  <select
                    value={newAppointment.paymentType}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, paymentType: e.target.value as 'normal' | 'cnam' | 'insurance' | 'free' })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="cnam">CNAM</option>
                    <option value="insurance">Assurance</option>
                    <option value="free">Gratuit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Montant payé</label>
                  <input
                    type="number"
                    value={newAppointment.amountPaid}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, amountPaid: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowAddAppointment(false);
                      setEditingAppointment(null);
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl"
                  >
                    {editingAppointment ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm appointment modal */}
      <AnimatePresence>
        {showConfirmDialog && (
          <AppointmentConfirmation
            appointment={showConfirmDialog}
            doctorTariff={DOCTOR_TARIFF}
            onConfirm={handleConfirmAppointment}
            onCancel={() => setShowConfirmDialog(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteDialog(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-gray-900 mb-4">Supprimer le rendez-vous</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le rendez-vous de{' '}
                <strong>{showDeleteDialog.patientName}</strong> à {showDeleteDialog.time} ?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteDialog(null)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
