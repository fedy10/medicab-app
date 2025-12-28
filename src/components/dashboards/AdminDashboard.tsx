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

interface AdminDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, profile, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [medecins, setMedecins] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMedecins: 0,
    activeMedecins: 0,
    pendingMedecins: 0,
    suspendedMedecins: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadMessagesData = useUnreadMessages(profile.id);
  const unreadMessages = unreadMessagesData.total;

  useEffect(() => {
    fetchMedecins();
  }, []);

  const fetchMedecins = () => {
    try {
      setLoading(true);
      // Get users from localStorage
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const medecinsData = users.filter((u: any) => u.role === 'medecin');
      setMedecins(medecinsData);
      
      // Calculate stats
      const totalMedecins = medecinsData.length;
      const activeMedecins = medecinsData.filter((m: any) => m.status === 'active').length;
      const pendingMedecins = medecinsData.filter((m: any) => m.status === 'pending').length;
      const suspendedMedecins = medecinsData.filter((m: any) => m.status === 'suspended').length;

      setStats({
        totalMedecins,
        activeMedecins,
        pendingMedecins,
        suspendedMedecins,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Error fetching medecins:', error);
    } finally {
      setLoading(false);
    }
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ zIndex: 100 }}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowProfile(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-900">{profile.nom} {profile.prenom}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-2 pb-4 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card3D delay={0}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-900 mb-1">{stats.totalMedecins}</h3>
                  <p className="text-gray-600">Total Médecins</p>
                </div>
              </Card3D>

              <Card3D delay={0.1}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-900 mb-1">{stats.activeMedecins}</h3>
                  <p className="text-gray-600">Médecins Actifs</p>
                </div>
              </Card3D>

              <Card3D delay={0.2}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-900 mb-1">{stats.pendingMedecins}</h3>
                  <p className="text-gray-600">En Attente</p>
                </div>
              </Card3D>

              <Card3D delay={0.3}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                      <UserX className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-900 mb-1">{stats.suspendedMedecins}</h3>
                  <p className="text-gray-600">Suspendus</p>
                </div>
              </Card3D>
            </div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="relative z-10">
                <h2 className="mb-2">Bienvenue, {profile.prenom} !</h2>
                <p className="text-blue-100">
                  Gérez efficacement votre plateforme médicale depuis ce tableau de bord.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'medecins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MedecinsManagement onUpdate={fetchMedecins} />
          </motion.div>
        )}

        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AdminRevenueView />
          </motion.div>
        )}
      </main>

      {/* Chat Component */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <AdminChat userId={profile.id} userName={`${profile.nom} ${profile.prenom}`} unreadCount={unreadMessages} />
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={profile}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}