import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Search, Clock, User, Edit, Trash2, FileText, Calendar, Briefcase } from 'lucide-react';
import { AppointmentConfirmation } from '../doctor/AppointmentConfirmation';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string; // Added date field (YYYY-MM-DD format)
  time: string;
  isConfirmed: boolean;
  type: 'consultation' | 'control';
  isNewPatient?: boolean;
  birthDate?: string;
  profession?: string;
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

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientPhone: '',
    birthDate: '',
    profession: '',
    time: '',
    type: 'consultation' as 'consultation' | 'control',
  });

  // Load appointments from localStorage on mount
  useEffect(() => {
    const key = `appointments_secretary_${doctorId || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAppointments(data);
      } catch (error) {
        console.error('Error loading appointments:', error);
        // Set default appointments if loading fails
        setDefaultAppointments();
      }
    } else {
      // Set default appointments for first time
      setDefaultAppointments();
    }
  }, [doctorId]);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    if (appointments.length > 0) {
      const key = `appointments_secretary_${doctorId || 'default'}`;
      localStorage.setItem(key, JSON.stringify(appointments));
    }
  }, [appointments, doctorId]);

  const setDefaultAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultAppointments: Appointment[] = [
      {
        id: '1',
        patientName: 'Mohamed Gharbi',
        patientPhone: '+216 98 123 456',
        date: today,
        time: '09:00',
        isConfirmed: true,
        type: 'consultation',
        isNewPatient: false,
        paymentType: 'normal',
        amountPaid: 60,
      },
      {
        id: '2',
        patientName: 'Amira Ben Said',
        patientPhone: '+216 22 987 654',
        date: today,
        time: '10:00',
        isConfirmed: false,
        type: 'control',
        isNewPatient: false,
      },
      {
        id: '3',
        patientName: 'Youssef Hamdi',
        patientPhone: '+216 55 321 789',
        date: today,
        time: '11:00',
        isConfirmed: true,
        type: 'consultation',
        isNewPatient: true,
        paymentType: 'cnam',
        amountPaid: 40,
      },
      {
        id: '4',
        patientName: 'Salma Trabelsi',
        patientPhone: '+216 29 654 321',
        date: today,
        time: '14:00',
        isConfirmed: false,
        type: 'consultation',
        isNewPatient: false,
      },
    ];
    setAppointments(defaultAppointments);
  };

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
          date: selectedDate.toISOString().split('T')[0],
          time: newAppointment.time,
          type: newAppointment.type,
          isConfirmed: false,
          isNewPatient: !isExisting,
          birthDate: newAppointment.birthDate,
          profession: newAppointment.profession,
        },
      ]);
      
      // Ajouter le patient à la liste s'il est nouveau
      if (!isExisting) {
        existingPatients.push({
          name: newAppointment.patientName,
          phone: newAppointment.patientPhone,
        });
      }
      
      setNewAppointment({ patientName: '', patientPhone: '', birthDate: '', profession: '', time: '', type: 'consultation' });
      setEditingAppointment(null);
      setShowAddAppointment(false);
      showSuccess('Rendez-vous créé avec succès !');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      birthDate: appointment.birthDate || '',
      profession: appointment.profession || '',
      time: appointment.time,
      type: appointment.type,
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
                birthDate: newAppointment.birthDate,
                profession: newAppointment.profession,
                time: newAppointment.time,
                type: newAppointment.type,
              }
            : apt
        )
      );
      setNewAppointment({ patientName: '', patientPhone: '', birthDate: '', profession: '', time: '', type: 'consultation' });
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

      {/* Modern Split View: Calendar + Daily Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE - Calendar */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 sticky top-24"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef3f8 100%)',
            }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                onClick={handlePrevMonth}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-gray-900">
                  {monthNames[selectedDate.getMonth()]}
                </h2>
                <p className="text-sm text-gray-500">{selectedDate.getFullYear()}</p>
              </motion.div>
              
              <motion.button
                onClick={handleNextMonth}
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {[...Array(firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dateStr = date.toISOString().split('T')[0];
                  const hasAppointments = appointments.some(apt => apt.date === dateStr);
                  
                  const isToday =
                    day === new Date().getDate() &&
                    selectedDate.getMonth() === new Date().getMonth() &&
                    selectedDate.getFullYear() === new Date().getFullYear();
                  const isSelected =
                    day === selectedDate.getDate();

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.15, rotateZ: 3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setSelectedDate(
                          new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                        )
                      }
                      className={`relative aspect-square p-2 rounded-xl transition-all ${
                        isToday
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-300'
                          : isSelected
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-400'
                          : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'
                      }`}
                      style={{
                        transform: isSelected ? 'translateZ(20px)' : 'translateZ(0)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
                      {hasAppointments && !isToday && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Add Appointment Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingAppointment(null);
                setNewAppointment({ patientName: '', patientPhone: '', birthDate: '', profession: '', time: '', type: 'consultation' });
                setShowAddAppointment(true);
              }}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau rendez-vous</span>
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Daily Schedule */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Schedule Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-2xl">
              <h3 className="text-2xl mb-1">
                Planning du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-purple-100">
                {appointments.filter((apt) => apt.date === selectedDate.toISOString().split('T')[0]).length} rendez-vous programmés
              </p>
            </div>

            {/* Timeline Schedule - NOUVEAU PLANNING DYNAMIQUE */}
            <div className="space-y-3">
              {(() => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const dayAppointments = appointments
                  .filter((apt) => apt.date === dateStr)
                  .sort((a, b) => a.time.localeCompare(b.time));

                // Si aucun rendez-vous, afficher un message
                if (dayAppointments.length === 0) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="text-gray-700 mb-2">Aucun rendez-vous</h4>
                      <p className="text-gray-500 text-sm">Cliquez sur "Nouveau rendez-vous" pour ajouter un patient</p>
                    </motion.div>
                  );
                }

                // Afficher tous les rendez-vous de la journée
                return dayAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`relative rounded-2xl transition-all overflow-hidden bg-white shadow-lg border-2 ${
                      appointment.isConfirmed
                        ? 'border-green-300 shadow-green-100'
                        : 'border-orange-300 shadow-orange-100'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Time indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-center border-r-2 ${
                      appointment.isConfirmed 
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                        : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                    }`}>
                      <Clock className="w-5 h-5 mb-1 text-gray-600" />
                      <p className="text-sm font-bold text-gray-800">{appointment.time}</p>
                      {appointment.isConfirmed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="ml-24 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Patient Avatar */}
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg text-xl"
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: 'translateZ(10px)',
                            }}
                          >
                            {appointment.patientName[0]}
                          </motion.div>

                          {/* Patient Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900">{appointment.patientName}</h4>
                              {appointment.isNewPatient && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium"
                                >
                                  Nouveau
                                </motion.span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{appointment.patientPhone}</p>
                            {appointment.profession && (
                              <p className="text-xs text-gray-400">👔 {appointment.profession}</p>
                            )}
                          </div>

                          {/* Type Badge */}
                          <div className="flex flex-col gap-2 items-end">
                            <span
                              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md ${
                                appointment.type === 'consultation'
                                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              }`}
                            >
                              {appointment.type === 'consultation' ? '📋 Consultation' : '✅ Contrôle'}
                            </span>
                            {appointment.isConfirmed && appointment.amountPaid !== undefined && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                                {appointment.amountPaid} DT
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!appointment.isConfirmed && (
                            <motion.button
                              whileHover={{ scale: 1.1, rotateZ: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowConfirmDialog(appointment)}
                              className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg hover:shadow-xl transition-all"
                              title="Confirmer"
                            >
                              <Check className="w-5 h-5" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1, rotateZ: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditAppointment(appointment)}
                            className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 shadow-lg hover:shadow-xl transition-all"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, rotateZ: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteAppointment(appointment)}
                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg hover:shadow-xl transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          </motion.div>
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
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3f8 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 80px rgba(147, 51, 234, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">
                  {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowAddAppointment(false);
                    setEditingAppointment(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Patient Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Nom du patient</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newAppointment.patientName}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, patientName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="Mohamed Gharbi"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={newAppointment.patientPhone}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, patientPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                    placeholder="+216 98 123 456"
                  />
                </div>

                {/* Type de consultation - Visual Selection */}
                <div>
                  <label className="block text-sm text-gray-700 mb-3">Type de consultation</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNewAppointment({ ...newAppointment, type: 'consultation' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        newAppointment.type === 'consultation'
                          ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                        newAppointment.type === 'consultation'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className={`text-sm font-medium ${
                        newAppointment.type === 'consultation' ? 'text-purple-700' : 'text-gray-600'
                      }`}>
                        Consultation
                      </p>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNewAppointment({ ...newAppointment, type: 'control' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        newAppointment.type === 'control'
                          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                        newAppointment.type === 'control'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                      <p className={`text-sm font-medium ${
                        newAppointment.type === 'control' ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        Contrôle
                      </p>
                    </motion.button>
                  </div>
                </div>

                {/* Time Selection - Hours and Minutes */}
                <div>
                  <label className="block text-sm text-gray-700 mb-3">Heure du rendez-vous</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-2">Heures</label>
                      <select
                        value={newAppointment.time.split(':')[0] || '09'}
                        onChange={(e) => {
                          const minutes = newAppointment.time.split(':')[1] || '00';
                          setNewAppointment({ ...newAppointment, time: `${e.target.value}:${minutes}` });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
                      >
                        {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                          <option key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-2xl text-gray-400 mt-6">:</div>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-2">Minutes</label>
                      <select
                        value={newAppointment.time.split(':')[1] || '00'}
                        onChange={(e) => {
                          const hours = newAppointment.time.split(':')[0] || '09';
                          setNewAppointment({ ...newAppointment, time: `${hours}:${e.target.value}` });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                          <option key={minute} value={minute.toString().padStart(2, '0')}>
                            {minute.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6">
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <Clock className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date de naissance */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    Date de naissance
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Jour */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative group"
                    >
                      <div className="relative">
                        {/* Gradient glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition-all duration-300" />
                        
                        <select
                          value={newAppointment.birthDate.split('-')[2] || ''}
                          onChange={(e) => {
                            const [year, month] = newAppointment.birthDate.split('-');
                            setNewAppointment({ 
                              ...newAppointment, 
                              birthDate: `${year || '2000'}-${month || '01'}-${e.target.value.padStart(2, '0')}` 
                            });
                          }}
                          className="relative w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer hover:border-purple-300 font-medium text-gray-700 text-center group-hover:shadow-lg"
                        >
                          <option value="">Jour</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={day.toString().padStart(2, '0')}>
                              {day.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom arrow with animation */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.div
                            animate={{ y: [0, 2, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <svg className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>

                        {/* Top label badge */}
                        <div className="absolute -top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity shadow-lg">
                          J
                        </div>
                      </div>
                    </motion.div>

                    {/* Mois */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative group"
                    >
                      <div className="relative">
                        {/* Gradient glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition-all duration-300" />
                        
                        <select
                          value={newAppointment.birthDate.split('-')[1] || ''}
                          onChange={(e) => {
                            const [year, , day] = newAppointment.birthDate.split('-');
                            setNewAppointment({ 
                              ...newAppointment, 
                              birthDate: `${year || '2000'}-${e.target.value.padStart(2, '0')}-${day || '01'}` 
                            });
                          }}
                          className="relative w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer hover:border-pink-300 font-medium text-gray-700 text-center group-hover:shadow-lg"
                        >
                          <option value="">Mois</option>
                          {[
                            'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                            'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
                          ].map((month, index) => (
                            <option key={index} value={(index + 1).toString().padStart(2, '0')}>
                              {month}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom arrow with animation */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.div
                            animate={{ y: [0, 2, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                          >
                            <svg className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>

                        {/* Top label badge */}
                        <div className="absolute -top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity shadow-lg">
                          M
                        </div>
                      </div>
                    </motion.div>

                    {/* Année */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative group"
                    >
                      <div className="relative">
                        {/* Gradient glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-500 rounded-lg opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition-all duration-300" />
                        
                        <select
                          value={newAppointment.birthDate.split('-')[0] || ''}
                          onChange={(e) => {
                            const [, month, day] = newAppointment.birthDate.split('-');
                            setNewAppointment({ 
                              ...newAppointment, 
                              birthDate: `${e.target.value}-${month || '01'}-${day || '01'}` 
                            });
                          }}
                          className="relative w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer hover:border-rose-300 font-medium text-gray-700 text-center group-hover:shadow-lg"
                        >
                          <option value="">Année</option>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom arrow with animation */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.div
                            animate={{ y: [0, 2, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                          >
                            <svg className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>

                        {/* Top label badge */}
                        <div className="absolute -top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity shadow-lg">
                          A
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Date preview - More compact */}
                  {newAppointment.birthDate && newAppointment.birthDate.split('-').every(part => part && part !== '2000' && part !== '01') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-lg border border-purple-200/50"
                    >
                      <motion.div 
                        className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-xs font-medium text-gray-700">
                        {new Date(newAppointment.birthDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Profession */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm text-gray-700 mb-2">Profession</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <select
                      value={newAppointment.profession}
                      onChange={(e) => setNewAppointment({ ...newAppointment, profession: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all appearance-none bg-white cursor-pointer hover:border-gray-300"
                      required
                    >
                      <option value="">Sélectionner une profession</option>
                      <option value="Enseignant">📚 Enseignant</option>
                      <option value="Ingénieur">⚙️ Ingénieur</option>
                      <option value="Médecin">⚕️ Médecin</option>
                      <option value="Avocat">⚖️ Avocat</option>
                      <option value="Commerçant">🏪 Commerçant</option>
                      <option value="Fonctionnaire">🏛️ Fonctionnaire</option>
                      <option value="Étudiant">🎓 Étudiant</option>
                      <option value="Infirmier">💉 Infirmier</option>
                      <option value="Pharmacien">💊 Pharmacien</option>
                      <option value="Architecte">📐 Architecte</option>
                      <option value="Journaliste">📰 Journaliste</option>
                      <option value="Artiste">🎨 Artiste</option>
                      <option value="Chauffeur">🚗 Chauffeur</option>
                      <option value="Technicien">🔧 Technicien</option>
                      <option value="Agriculteur">🌾 Agriculteur</option>
                      <option value="Retraité">🏖️ Retraité</option>
                      <option value="Sans emploi">📋 Sans emploi</option>
                      <option value="Autre">💼 Autre</option>
                    </select>
                    {/* Flèche personnalisée */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddAppointment(false);
                      setEditingAppointment(null);
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    {editingAppointment ? 'Modifier' : 'Ajouter'}
                  </motion.button>
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
