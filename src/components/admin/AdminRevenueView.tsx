import { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useProfiles } from '../../hooks/useSupabase';
import { useAppointments } from '../../hooks/useSupabase';

export function AdminRevenueView() {
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  // Charger tous les médecins
  const { doctors, loading: doctorsLoading } = useProfiles();

  // Fonction pour charger les rendez-vous d'un médecin
  const DoctorRevenueRow = ({ doctor }: { doctor: any }) => {
    const { appointments, loading } = useAppointments(doctor.id);
    
    // Calculer les revenus à partir des rendez-vous complétés
    const completedAppointments = appointments.filter(apt => 
      apt.status === 'completed' && apt.payment_amount && apt.payment_amount > 0
    );

    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);
    const totalConsultations = completedAppointments.length;

    // Revenus du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = completedAppointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
      })
      .reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);

    const isExpanded = expandedDoctor === doctor.id;

    return (
      <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Doctor Header */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedDoctor(isExpanded ? null : doctor.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                {doctor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h3 className="text-gray-900 font-medium">Dr. {doctor.name}</h3>
                <p className="text-sm text-gray-500">{doctor.specialty || 'Médecin généraliste'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-xl font-bold text-gray-900">{monthlyRevenue.toFixed(2)} DT</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{totalRevenue.toFixed(2)} DT</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Consultations</p>
                <p className="text-xl font-bold text-purple-600">{totalConsultations}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 p-6 bg-gray-50"
          >
            {loading ? (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Transactions Récentes</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {completedAppointments.slice(-10).reverse().map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(apt.date).toLocaleDateString('fr-FR')} • {apt.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{apt.payment_amount} DT</p>
                        <p className="text-xs text-gray-500 capitalize">{apt.payment_type || 'normal'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {completedAppointments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-2" />
                    <p>Aucune transaction</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  // Calculer les stats globales
  const GlobalStats = () => {
    // Pour chaque médecin, charger les rendez-vous
    const allDoctorsData = doctors.map(doctor => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { appointments } = useAppointments(doctor.id);
      const completedAppointments = appointments.filter(apt => 
        apt.status === 'completed' && apt.payment_amount && apt.payment_amount > 0
      );
      const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);
      return { doctor, totalRevenue, consultations: completedAppointments.length };
    });

    const globalRevenue = allDoctorsData.reduce((sum, d) => sum + d.totalRevenue, 0);
    const globalConsultations = allDoctorsData.reduce((sum, d) => sum + d.consultations, 0);
    const activeDoctors = allDoctorsData.filter(d => d.totalRevenue > 0).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
          <p className="text-2xl font-bold text-gray-900">{globalRevenue.toFixed(2)} DT</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Médecins Actifs</p>
          <p className="text-2xl font-bold text-gray-900">{activeDoctors}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Consultations</p>
          <p className="text-2xl font-bold text-gray-900">{globalConsultations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Moyenne/Médecin</p>
          <p className="text-2xl font-bold text-gray-900">
            {activeDoctors > 0 ? (globalRevenue / activeDoctors).toFixed(2) : '0.00'} DT
          </p>
        </motion.div>
      </div>
    );
  };

  if (doctorsLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des revenus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Revenus Globaux</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPeriod === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ce Mois
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPeriod === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cette Année
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <GlobalStats />

      {/* Doctors List */}
      <div className="space-y-4">
        <h3 className="text-gray-900">Revenus par Médecin</h3>
        {doctors.filter(d => d.status === 'active').map((doctor) => (
          <DoctorRevenueRow key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {doctors.filter(d => d.status === 'active').length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun médecin actif</p>
        </div>
      )}
    </div>
  );
}
