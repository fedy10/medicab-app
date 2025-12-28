import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, Settings, LogOut, AlertCircle, CheckCircle, Clock, DollarSign, UserPlus, Check, X } from 'lucide-react';
import type { User } from '../../App';
import { DoctorManagement } from './DoctorManagement';
import { AdminRevenueView } from './AdminRevenueView';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'overview' | 'doctors' | 'revenue' | 'settings';

interface PendingDoctor {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  registrationDate: string;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Mock pending doctors - remplacer par des données réelles du serveur
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([
    {
      id: '1',
      nom: 'Gharbi',
      prenom: 'Youssef',
      specialite: 'Cardiologue',
      email: 'dr.gharbi@medicab.tn',
      telephone: '+216 98 456 789',
      registrationDate: 'Il y a 2 heures'
    },
    {
      id: '2',
      nom: 'Saidi',
      prenom: 'Amira',
      specialite: 'Pédiatre',
      email: 'dr.saidi@medicab.tn',
      telephone: '+216 22 123 456',
      registrationDate: 'Hier'
    },
    {
      id: '3',
      nom: 'Hamdi',
      prenom: 'Mohamed',
      specialite: 'Dermatologue',
      email: 'dr.hamdi@medicab.tn',
      telephone: '+216 55 789 123',
      registrationDate: 'Il y a 3 jours'
    },
  ]);

  const handleApprovePending = (doctorId: string) => {
    // TODO: Appeler l'API pour approuver le médecin
    setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
  };

  const handleRejectPending = (doctorId: string) => {
    // TODO: Appeler l'API pour rejeter le médecin
    setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
  };

  const stats = [
    { label: 'Médecins actifs', value: '24', icon: Users, color: 'from-blue-500 to-cyan-500', change: '+3 ce mois' },
    { label: 'Revenus totaux', value: '12,450 TND', icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+15% vs dernier mois' },
    { label: 'Paiements en attente', value: '5', icon: Clock, color: 'from-orange-500 to-amber-500', change: '2 en retard' },
    { label: 'Nouveaux médecins', value: '7', icon: AlertCircle, color: 'from-purple-500 to-pink-500', change: 'En attente validation' },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'doctors' as const, label: 'Gestion médecins', icon: Users },
    { id: 'revenue' as const, label: 'Revenus', icon: DollarSign },
    { id: 'settings' as const, label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-gray-900">Tableau de bord Administrateur</h1>
              <p className="text-sm text-gray-600">Bienvenue, {user.name}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </motion.button>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-gray-900 mb-2">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-4">
                  {[
                    { type: 'success', msg: 'Dr. Leila Mejri a effectué un paiement de 450 TND', time: 'Il y a 2h' },
                    { type: 'warning', msg: 'Rappel de paiement envoyé à Dr. Karim Bouzid', time: 'Il y a 5h' },
                    { type: 'info', msg: 'Nouveau médecin inscrit : Dr. Sarah Trabelsi', time: 'Hier' },
                    { type: 'success', msg: 'Validation du compte Dr. Mohamed Hamdi', time: 'Il y a 2 jours' },
                  ].map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'success' ? 'bg-green-100' :
                        activity.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         activity.type === 'warning' ? <AlertCircle className="w-4 h-4 text-orange-600" /> :
                         <Clock className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.msg}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Demandes d'accès en attente */}
              {pendingDoctors.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Demandes d'accès en attente ({pendingDoctors.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {pendingDoctors.map((doctor, i) => (
                      <motion.div
                        key={doctor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-2 border-orange-100 bg-orange-50/50 rounded-xl p-4 hover:border-orange-200 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                              <span>{doctor.nom[0]}{doctor.prenom[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-gray-900">Dr. {doctor.nom} {doctor.prenom}</p>
                                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Nouveau</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{doctor.specialite}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{doctor.email}</span>
                                <span>{doctor.telephone}</span>
                                <span>{doctor.registrationDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprovePending(doctor.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Approuver
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectPending(doctor.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Refuser
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'doctors' && <DoctorManagement userToken={user.id} />}
          {activeTab === 'revenue' && <AdminRevenueView />}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-gray-900 mb-4">Paramètres</h3>
              <p className="text-gray-600">Configuration du système à venir...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}