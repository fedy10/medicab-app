import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, UserCheck, UserX, LogOut, TrendingUp, Calendar, MessageCircle, User } from 'lucide-react';
import { MedecinsManagement } from '../admin/MedecinsManagement';
import { AdminRevenueView } from '../admin/AdminRevenueView';
import { AdminChat } from '../chat/AdminChat';
import { Card3D } from '../ui/Card3D';
import { FloatingElement } from '../ui/FloatingElement';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { ProfileModal } from '../modals/ProfileModal';
import { useProfiles } from '../../hooks/useSupabase';

interface AdminDashboardProps {
  profile: any;
  onLogout: () => void;
}

export function AdminDashboard({ profile, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadMessagesData = useUnreadMessages(profile.id);
  const unreadMessages = unreadMessagesData.total;
  
  // Utiliser le hook Supabase pour charger les profils
  const { profiles, doctors, loading } = useProfiles();

  // Calculer les statistiques basées sur les doctors
  const stats = {
    totalMedecins: doctors.length,
    activeMedecins: doctors.filter((m: any) => m.status === 'active').length,
    pendingMedecins: doctors.filter((m: any) => m.status === 'pending').length,
    suspendedMedecins: doctors.filter((m: any) => m.status === 'suspended').length,
    totalRevenue: 0,
  };

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'medecins', label: 'Gestion Médecins', icon: Users },
    { id: 'revenue', label: 'Revenus', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      <AnimatedBackground />
      
      {/* Top Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">MediCare Pro</h1>
                <p className="text-sm text-gray-500">Administration</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 inline mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Chat Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(true)}
                className="relative p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </motion.button>

              {/* Profile Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <User className="w-5 h-5 text-gray-700" />
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Tableau de Bord Administrateur</h2>
              <p className="text-gray-600">
                Bienvenue, {profile.name}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des statistiques...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Médecins */}
                <FloatingElement delay={0}>
                  <Card3D>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.totalMedecins}</span>
                      </div>
                      <h3 className="text-gray-600 text-sm">Total Médecins</h3>
                    </div>
                  </Card3D>
                </FloatingElement>

                {/* Médecins Actifs */}
                <FloatingElement delay={0.1}>
                  <Card3D>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.activeMedecins}</span>
                      </div>
                      <h3 className="text-gray-600 text-sm">Médecins Actifs</h3>
                    </div>
                  </Card3D>
                </FloatingElement>

                {/* En Attente */}
                <FloatingElement delay={0.2}>
                  <Card3D>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.pendingMedecins}</span>
                      </div>
                      <h3 className="text-gray-600 text-sm">En Attente</h3>
                    </div>
                  </Card3D>
                </FloatingElement>

                {/* Suspendus */}
                <FloatingElement delay={0.3}>
                  <Card3D>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                          <UserX className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.suspendedMedecins}</span>
                      </div>
                      <h3 className="text-gray-600 text-sm">Suspendus</h3>
                    </div>
                  </Card3D>
                </FloatingElement>
              </div>
            )}
          </motion.div>
        )}

        {/* Médecins Management Tab */}
        {activeTab === 'medecins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MedecinsManagement />
          </motion.div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AdminRevenueView />
          </motion.div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && (
        <AdminChat
          adminId={profile.id}
          adminName={profile.name}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
