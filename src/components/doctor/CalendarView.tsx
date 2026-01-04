import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Clock, User, Edit, Trash2, Calendar, Briefcase, Globe, MapPin, Phone } from 'lucide-react';
import { AppointmentConfirmation } from './AppointmentConfirmation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppointments, usePatients } from '../../hooks/useSupabase';
import { patientService } from '../../lib/services';
import { supabase } from '../../lib/supabase';

interface CalendarViewProps {
  doctorId: string;
}

export function CalendarView({ doctorId }: CalendarViewProps) {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<any | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  // Utiliser les hooks Supabase
  const { 
    appointments, 
    loading, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment 
  } = useAppointments(doctorId);

  const { patients } = usePatients(doctorId);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientPhone: '',
    birthDate: '',
    profession: '',
    pays: '',
    region: '',
    hour: '09',
    minute: '00',
  });

  const [editFormData, setEditFormData] = useState({
    patientName: '',
    patientPhone: '',
    birthDate: '',
    profession: '',
    pays: '',
    region: '',
    hour: '09',
    minute: '00',
    date: '',
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [doctorTarif, setDoctorTarif] = useState(60);

  // Charger le tarif du médecin
  useEffect(() => {
    const loadDoctorTarif = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('tarif')
          .eq('id', doctorId)
          .single();

        if (data && data.tarif) {
          setDoctorTarif(data.tarif);
        }
      } catch (error) {
        console.error('Erreur chargement tarif:', error);
      }
    };

    loadDoctorTarif();
  }, [doctorId]);

  // Options pour les sélecteurs
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  // Recherche de patients
  const handlePatientSearch = (searchTerm: string, field: 'name' | 'phone') => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = patients.filter(p => {
      if (field === 'name') {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return p.phone?.includes(searchTerm) || false;
      }
    });

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const selectPatient = (patient: any) => {
    setNewAppointment({
      ...newAppointment,
      patientName: patient.name,
      patientPhone: patient.phone || '',
      birthDate: patient.birth_date || '',
      profession: patient.profession || '',
      pays: patient.pays || '',
      region: patient.region || '',
    });
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Régions par pays
  const regionsByCountry: { [key: string]: { name: string; groups: { label: string; regions: string[] }[] } } = {
    'Tunisie': {
      name: '🇹🇳 Tunisie',
      groups: [
        {
          label: '🏛️ Grand Tunis',
          regions: ['🏛️ Tunis', '🏙️ Ariana', '🌆 Ben Arous', '🏘️ Manouba']
        },
        {
          label: '🌊 Nord-Est',
          regions: ['🏖️ Nabeul', '⛰️ Zaghouan', '🏝️ Bizerte']
        },
        {
          label: '🌲 Nord-Ouest',
          regions: ['🌾 Béja', '🌳 Jendouba', '⛰️ Kef', '🏔️ Siliana']
        },
        {
          label: '🏙️ Centre',
          regions: ['🕌 Kairouan', '🏔️ Kasserine', '🏖️ Sousse', '🏝️ Monastir', '⚓ Mahdia', '🏭 Sfax']
        },
        {
          label: '🏜️ Sud',
          regions: ['🌴 Kebili', '🏜️ Tataouine', '⛰️ Gafsa', '🌾 Sidi Bouzid', '🏝️ Gabès', '🏖️ Medenine']
        }
      ]
    },
    'Libye': {
      name: '🇱🇾 Libye',
      groups: [
        {
          label: '🏛️ Grandes Villes',
          regions: ['🏛️ Tripoli', '🏙️ Benghazi', '🌆 Misrata', '🏘️ Bayda']
        },
        {
          label: '🌊 Côte',
          regions: ['🏖️ Zawiya', '⚓ Zliten', '🏝️ Derna', '🌊 Sirte']
        },
        {
          label: '🏜️ Intérieur',
          regions: ['🏜️ Ajdabiya', '⛰️ Tobruk', '🌴 Sebha', '🏔️ Gharyan']
        }
      ]
    },
    'Algérie': {
      name: '🇩🇿 Algérie',
      groups: [
        {
          label: '🏛️ Grandes Villes',
          regions: ['🏛️ Alger', '🏙️ Oran', '🌆 Constantine', '🏘️ Annaba']
        },
        {
          label: '🌊 Côte',
          regions: ['🏖️ Béjaïa', '⚓ Tizi Ouzou', '🏝️ Skikda', '🌊 Mostaganem']
        },
        {
          label: '🏜️ Sud',
          regions: ['🏜️ Ouargla', '🌴 Ghardaïa', '⛰️ Tamanrasset', '🏔️ Adrar']
        }
      ]
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const findExistingPatient = async (phone: string) => {
    try {
      const existingPatient = patients.find(p => p.phone === phone);
      
      if (existingPatient) {
        console.log('✅ Patient existant trouvé:', existingPatient.name);
        return existingPatient;
      }
      
      console.log('ℹ️ Nouveau patient');
      return null;
    } catch (error) {
      console.error('Erreur recherche patient:', error);
      return null;
    }
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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

  const handlePreviousMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
    );
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    );
  };

  const handleEditClick = async (apt: any) => {
    try {
      // Charger les données du patient depuis la base de données
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', apt.patient_id)
        .single();

      const [hour, minute] = apt.time.split(':');

      if (patientData) {
        setEditFormData({
          patientName: patientData.name || apt.patient_name,
          patientPhone: patientData.phone || '',
          birthDate: patientData.birth_date || '',
          profession: patientData.profession || '',
          pays: patientData.pays || '',
          region: patientData.region || '',
          hour: hour || '09',
          minute: minute || '00',
          date: apt.date,
        });
      } else {
        // Fallback si pas de données patient
        setEditFormData({
          patientName: apt.patient_name,
          patientPhone: '',
          birthDate: '',
          profession: '',
          pays: '',
          region: '',
          hour: hour || '09',
          minute: minute || '00',
          date: apt.date,
        });
      }

      setEditingAppointment(apt);
    } catch (error) {
      console.error('Erreur chargement patient:', error);
      const [hour, minute] = apt.time.split(':');
      setEditFormData({
        patientName: apt.patient_name,
        patientPhone: '',
        birthDate: '',
        profession: '',
        pays: '',
        region: '',
        hour: hour || '09',
        minute: minute || '00',
        date: apt.date,
      });
      setEditingAppointment(apt);
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.patientName || !newAppointment.patientPhone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setProcessing(true);
      console.log('🔄 Création du rendez-vous...');

      const existingPatient = await findExistingPatient(newAppointment.patientPhone);
      
      let patientId = existingPatient?.id;
      let isNewPatient = false;

      if (!existingPatient) {
        console.log('📝 Création d\'un nouveau patient...');
        isNewPatient = true;
        
        const patientData = {
          name: newAppointment.patientName,
          phone: newAppointment.patientPhone,
          doctor_id: doctorId,
          age: newAppointment.birthDate ? calculateAge(newAppointment.birthDate) : null,
          birth_date: newAppointment.birthDate || null,
          profession: newAppointment.profession || null,
          pays: newAppointment.pays || null,
          region: newAppointment.region || null,
          address: newAppointment.region && newAppointment.pays 
            ? `${newAppointment.region}, ${newAppointment.pays}` 
            : null,
          diseases: [],
        };

        const createdPatient = await patientService.create(patientData);
        patientId = createdPatient.id;
        console.log('✅ Patient créé:', createdPatient.name, createdPatient.id);
      } else {
        console.log('✅ Utilisation du patient existant:', existingPatient.name);
      }

      // FIX: Utiliser la date locale au lieu de UTC pour éviter le décalage d'un jour
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const appointmentDate = `${year}-${month}-${day}`;
      const time = `${newAppointment.hour}:${newAppointment.minute}`;
      
      await createAppointment({
        patient_id: patientId,
        patient_name: newAppointment.patientName,
        doctor_id: doctorId,
        date: appointmentDate,
        time: time,
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        created_by: doctorId,
        notes: isNewPatient ? '🆕 Nouveau patient' : null,
      });

      console.log('✅ Rendez-vous créé avec succès !');
      showSuccess(isNewPatient ? '✅ Rendez-vous créé (Nouveau patient)' : '✅ Rendez-vous créé');
      
      setNewAppointment({
        patientName: '',
        patientPhone: '',
        birthDate: '',
        profession: '',
        pays: '',
        region: '',
        hour: '09',
        minute: '00',
      });
      
      setShowAddAppointment(false);
    } catch (error: any) {
      console.error('❌ Erreur création rendez-vous:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAppointment = async (paymentInfo: {
    paymentType: 'normal' | 'cnam' | 'insurance' | 'free';
    amountPaid?: number;
  }) => {
    try {
      setProcessing(true);

      if (!showConfirmDialog) return;

      const appointment = showConfirmDialog;

      let paymentType: 'normal' | 'gratuit' | 'assurance' = 'normal';
      if (paymentInfo.paymentType === 'free') {
        paymentType = 'gratuit';
      } else if (paymentInfo.paymentType === 'cnam' || paymentInfo.paymentType === 'insurance') {
        paymentType = 'assurance';
      }

      let paymentAmount = doctorTarif;
      let insurancePatientAmount = null;
      let insuranceReimbursedAmount = null;

      if (paymentType === 'gratuit') {
        paymentAmount = 0;
      } else if (paymentType === 'assurance' && paymentInfo.amountPaid !== undefined) {
        insurancePatientAmount = paymentInfo.amountPaid;
        insuranceReimbursedAmount = doctorTarif - insurancePatientAmount;
        paymentAmount = insurancePatientAmount;
      }

      await updateAppointment(appointment.id, {
        status: 'completed',
        payment_amount: paymentAmount,
        payment_type: paymentType,
        insurance_patient_amount: insurancePatientAmount,
        insurance_reimbursed_amount: insuranceReimbursedAmount,
      });

      const { error: consultationError } = await supabase
        .from('consultations')
        .insert({
          patient_id: appointment.patient_id,
          patient_name: appointment.patient_name,
          doctor_id: doctorId,
          appointment_id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          payment_type: paymentType,
          payment_amount: paymentAmount,
          insurance_patient_amount: insurancePatientAmount,
          insurance_reimbursed_amount: insuranceReimbursedAmount,
          symptoms: null,
          diagnosis: null,
          prescription: null,
          notes: '',
          files: null,
        });

      if (consultationError) {
        console.error('Erreur création consultation:', consultationError);
        throw consultationError;
      }

      console.log('✅ Rendez-vous confirmé et consultation créée !');
      showSuccess('✅ Rendez-vous confirmé et consultation créée !');
      setShowConfirmDialog(null);
    } catch (error: any) {
      console.error('❌ Erreur confirmation:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAppointment = async (appointment: any) => {
    try {
      await deleteAppointment(appointment.id);
      showSuccess('✅ Rendez-vous supprimé');
      setShowDeleteDialog(null);
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      setProcessing(true);

      // Mettre à jour les informations du patient
      const patientUpdateData: any = {
        name: editFormData.patientName,
        phone: editFormData.patientPhone,
      };

      if (editFormData.birthDate) {
        patientUpdateData.birth_date = editFormData.birthDate;
        patientUpdateData.age = calculateAge(editFormData.birthDate);
      }
      if (editFormData.profession) patientUpdateData.profession = editFormData.profession;
      if (editFormData.pays) patientUpdateData.pays = editFormData.pays;
      if (editFormData.region) patientUpdateData.region = editFormData.region;
      if (editFormData.region && editFormData.pays) {
        patientUpdateData.address = `${editFormData.region}, ${editFormData.pays}`;
      }

      // Mettre à jour le patient
      await supabase
        .from('patients')
        .update(patientUpdateData)
        .eq('id', editingAppointment.patient_id);

      const time = `${editFormData.hour}:${editFormData.minute}`;

      // Mettre à jour le rendez-vous
      await updateAppointment(editingAppointment.id, {
        patient_name: editFormData.patientName,
        time: time,
        date: editFormData.date,
      });
      
      showSuccess('✅ Rendez-vous modifié');
      setEditingAppointment(null);
    } catch (error: any) {
      console.error('Erreur modification:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (apt) => apt.date === selectedDateString
  ).sort((a, b) => a.time.localeCompare(b.time));

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header avec bouton */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900">Calendrier des rendez-vous</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddAppointment(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </motion.button>
      </div>

      {/* Layout: Calendrier à gauche (RÉDUIT) + Planning à droite */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* CALENDRIER - GAUCHE (COMPACT: 280px) */}
        <div className="w-full lg:w-[280px] flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-3"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef3f8 100%)',
            }}
          >
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePreviousMonth}
                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-purple-600" />
              </motion.button>
              <h3 className="text-sm font-semibold text-gray-900">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-purple-600" />
              </motion.button>
            </div>

            {/* Noms des jours */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours - COMPACTE */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                const dateString = date.toISOString().split('T')[0];
                const dayAppointments = appointments.filter(apt => apt.date === dateString);
                const isSelected = day === selectedDate.getDate();
                const isToday = dateString === new Date().toISOString().split('T')[0];

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-lg p-0.5 text-[11px] transition-all relative flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg'
                        : isToday
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <span>{day}</span>
                    {dayAppointments.length > 0 && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {Array.from({ length: Math.min(dayAppointments.length, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-0.5 h-0.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* PLANNING - DROITE (RÉDUIT: max-h-[550px]) */}
        <div className="flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Header du planning - RÉDUIT */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    {selectedDate.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                  <p className="text-purple-100 text-sm">
                    {todayAppointments.length} rendez-vous programmé{todayAppointments.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Liste des rendez-vous - RÉDUITE avec scroll */}
            <div className="bg-white rounded-2xl shadow-xl p-4 max-h-[550px] overflow-y-auto custom-scrollbar">
              {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-4">
                    <Calendar className="w-16 h-16" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Aucun rendez-vous prévu</p>
                  <p className="text-sm">Sélectionnez un autre jour ou créez un rendez-vous</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className={`relative p-4 rounded-2xl border-2 transition-all shadow-md hover:shadow-xl ${
                        apt.status === 'completed'
                          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                          : 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-xl shadow-md ${
                              apt.status === 'completed' 
                                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                : 'bg-gradient-to-br from-purple-500 to-pink-600'
                            }`}>
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {apt.time}
                            </span>
                            {apt.notes && apt.notes.includes('🆕') && (
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs rounded-full font-semibold shadow-md">
                                🆕 Nouveau patient
                              </span>
                            )}
                            {apt.status === 'completed' && (
                              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-full font-semibold flex items-center gap-2 shadow-md">
                                <Check className="w-3 h-3" />
                                Confirmé
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 ml-12">
                            <div className="flex items-center gap-2 text-gray-800">
                              <User className="w-4 h-4 text-purple-500" />
                              <span className="font-semibold">{apt.patient_name}</span>
                            </div>
                            {apt.patient_phone && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Phone className="w-4 h-4 text-purple-400" />
                                <span>{apt.patient_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions - COMPACTES */}
                        <div className="flex gap-1.5">
                          {apt.status !== 'completed' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditClick(apt)}
                                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-md"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4 text-white" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={async () => {
                                  try {
                                    const { data: patientData } = await supabase
                                      .from('patients')
                                      .select('pays')
                                      .eq('id', apt.patient_id)
                                      .single();
                                    
                                    setShowConfirmDialog({
                                      ...apt,
                                      pays: patientData?.pays || undefined
                                    });
                                  } catch (error) {
                                    console.error('Erreur chargement patient:', error);
                                    setShowConfirmDialog(apt);
                                  }
                                }}
                                className="p-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all shadow-md"
                                title="Confirmer"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.button>
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDeleteDialog(apt)}
                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all shadow-md"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>



      {/* Modal Création Rendez-vous */}
      <AnimatePresence>
        {showAddAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !processing && setShowAddAppointment(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl z-10 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Nouveau Rendez-vous</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddAppointment(false)}
                    disabled={processing}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Nom du patient */}
                <div>
                  {/* Résultats de recherche - AU-DESSUS DU LABEL */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mb-2 bg-white border-2 border-purple-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      <div className="p-3 bg-purple-50 border-b-2 border-purple-100 text-sm font-medium text-purple-700">
                        ✨ {searchResults.length} patient{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                      </div>
                      {searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.phone}</p>
                              {patient.age && (
                                <p className="text-xs text-gray-500 mt-1">{patient.age} ans</p>
                              )}
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Existant
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du patient <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      value={newAppointment.patientName}
                      onChange={(e) => {
                        setNewAppointment({ ...newAppointment, patientName: e.target.value });
                        handlePatientSearch(e.target.value, 'name');
                      }}
                      onFocus={() => {
                        if (newAppointment.patientName.length >= 2 && searchResults.length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none shadow-sm"
                      placeholder="Ex: Mohamed Gharbi"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="tel"
                      value={newAppointment.patientPhone}
                      onChange={(e) => {
                        setNewAppointment({ ...newAppointment, patientPhone: e.target.value });
                        handlePatientSearch(e.target.value, 'phone');
                      }}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none shadow-sm"
                      placeholder="+216 98 123 456"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    💡 Le système détecte automatiquement si c'est un nouveau patient
                  </p>
                </div>

                {/* Heure - Sélecteur moderne Heures & Minutes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Heure du rendez-vous <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {/* Heures */}
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <select
                          value={newAppointment.hour}
                          onChange={(e) => setNewAppointment({ ...newAppointment, hour: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 font-semibold border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                        >
                          {hours.map((h) => (
                            <option key={h} value={h}>
                              {h}h
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm font-medium">
                          
                        </div>
                      </div>
                    </div>

                    {/* Minutes */}
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={newAppointment.minute}
                          onChange={(e) => setNewAppointment({ ...newAppointment, minute: e.target.value })}
                          className="w-full pl-4 pr-4 py-3 font-semibold border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                        >
                          {minutes.map((m) => (
                            <option key={m} value={m}>
                              {m} min
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm font-medium">
                         
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-center text-purple-900 font-bold text-xl">
                      🕐 {newAppointment.hour}:{newAppointment.minute}
                    </p>
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date de naissance
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="date"
                      value={newAppointment.birthDate}
                      onChange={(e) => setNewAppointment({ ...newAppointment, birthDate: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Profession
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      value={newAppointment.profession}
                      onChange={(e) => setNewAppointment({ ...newAppointment, profession: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none shadow-sm"
                      placeholder="Ex: Ingénieur, Enseignant..."
                    />
                  </div>
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pays
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <select
                      value={newAppointment.pays}
                      onChange={(e) => setNewAppointment({ ...newAppointment, pays: e.target.value, region: '' })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="">Sélectionner un pays</option>
                      {Object.keys(regionsByCountry).map((country) => (
                        <option key={country} value={country}>
                          {regionsByCountry[country].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Région */}
                {newAppointment.pays && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Région
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <MapPin className="w-5 h-5 text-purple-400" />
                      </div>
                      <select
                        value={newAppointment.region}
                        onChange={(e) => setNewAppointment({ ...newAppointment, region: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                      >
                        <option value="">Sélectionner une région</option>
                        {regionsByCountry[newAppointment.pays].groups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.regions.map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddAppointment(false)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddAppointment}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 shadow-lg"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Création...
                      </div>
                    ) : (
                      '✅ Créer le rendez-vous'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Modification - COMPLET (similaire au modal de création) */}
      <AnimatePresence>
        {editingAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !processing && setEditingAppointment(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl z-10 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Modifier le Rendez-vous</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingAppointment(null)}
                    disabled={processing}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Nom du patient */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nom du patient <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={editFormData.patientName}
                      onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-sm"
                      placeholder="Ex: Mohamed Gharbi"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="tel"
                      value={editFormData.patientPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, patientPhone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-sm"
                      placeholder="+216 98 123 456"
                    />
                  </div>
                </div>

                {/* Date du rendez-vous */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date du rendez-vous <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Heure - Sélecteur moderne Heures & Minutes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Heure du rendez-vous <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {/* Heures */}
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <select
                          value={editFormData.hour}
                          onChange={(e) => setEditFormData({ ...editFormData, hour: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 font-semibold border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                        >
                          {hours.map((h) => (
                            <option key={h} value={h}>
                              {h}h
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm font-medium">
                          
                        </div>
                      </div>
                    </div>

                    {/* Minutes */}
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={editFormData.minute}
                          onChange={(e) => setEditFormData({ ...editFormData, minute: e.target.value })}
                          className="w-full pl-4 pr-4 py-3 font-semibold border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                        >
                          {minutes.map((m) => (
                            <option key={m} value={m}>
                              {m} min
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm font-medium">
                          
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-center text-blue-900 font-bold text-xl">
                      🕐 {editFormData.hour}:{editFormData.minute}
                    </p>
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date de naissance
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="date"
                      value={editFormData.birthDate}
                      onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Profession
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={editFormData.profession}
                      onChange={(e) => setEditFormData({ ...editFormData, profession: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-sm"
                      placeholder="Ex: Ingénieur, Enseignant..."
                    />
                  </div>
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pays
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <select
                      value={editFormData.pays}
                      onChange={(e) => setEditFormData({ ...editFormData, pays: e.target.value, region: '' })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="">Sélectionner un pays</option>
                      {Object.keys(regionsByCountry).map((country) => (
                        <option key={country} value={country}>
                          {regionsByCountry[country].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Région */}
                {editFormData.pays && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Région
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <select
                        value={editFormData.region}
                        onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none bg-white cursor-pointer shadow-sm"
                      >
                        <option value="">Sélectionner une région</option>
                        {regionsByCountry[editFormData.pays].groups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.regions.map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingAppointment(null)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateAppointment}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 shadow-lg"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Modification...
                      </div>
                    ) : (
                      '✅ Enregistrer les modifications'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmation */}
      <AnimatePresence>
        {showConfirmDialog && (
          <AppointmentConfirmation
            appointment={{
              id: showConfirmDialog.id,
              patientName: showConfirmDialog.patient_name,
              patientPhone: showConfirmDialog.patient_phone || '',
              time: showConfirmDialog.time,
              type: showConfirmDialog.type as 'consultation' | 'control',
              pays: showConfirmDialog.pays,
            }}
            doctorTariff={doctorTarif}
            onConfirm={handleConfirmAppointment}
            onCancel={() => setShowConfirmDialog(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal Suppression */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteDialog(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Supprimer le rendez-vous
                </h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce rendez-vous ?<br />
                  Cette action est irréversible.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(null)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(showDeleteDialog)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}