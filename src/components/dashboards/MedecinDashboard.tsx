import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText, Users, DollarSign, Clock, MessageCircle, Shield, User, LogOut, Stethoscope } from 'lucide-react';
import { DoctorSecretaryChat } from '../chat/DoctorSecretaryChat';
import { DoctorAdminChat } from '../chat/DoctorAdminChat';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { ProfileModal } from '../modals/ProfileModal';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { CalendarView } from '../doctor/CalendarView';
import { ConsultationsView } from '../doctor/ConsultationsView';
import { PatientsView } from '../doctor/PatientsView';
import { RevenueView } from '../doctor/RevenueView';
import { ProfileView } from '../doctor/ProfileView';
import { LanguageSelector } from '../common/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';

interface MedecinDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function MedecinDashboard({ user, profile, onLogout }: MedecinDashboardProps) {
  const [activeTab, setActiveTab] = useState('agenda');
  const [showSecretaryChat, setShowSecretaryChat] = useState(false);
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const unreadMessages = useUnreadMessages(profile.id);
  const { t } = useLanguage();

  const navItems = [
    { id: 'agenda', label: t('calendar'), icon: Calendar },
    { id: 'consultations', label: t('consultations'), icon: FileText },
    { id: 'patients', label: t('patients'), icon: Users },
    { id: 'revenus', label: t('revenue'), icon: DollarSign },
    { id: 'profil', label: t('profile'), icon: User },
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
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">MediCare Pro</h1>
                <p className="text-sm text-gray-500">Dr. {profile.nom} {profile.prenom}</p>
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

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <LanguageSelector />
              
              <button
                onClick={() => setShowSecretaryChat(!showSecretaryChat)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('chat_with_secretary')}
                style={{ zIndex: 100 }}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessages.secretary > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                    {unreadMessages.secretary}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowAdminChat(!showAdminChat)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('chat_with_admin')}
                style={{ zIndex: 100 }}
              >
                <Shield className="w-5 h-5" />
                {unreadMessages.admin > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                    {unreadMessages.admin}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('profile')}
              >
                <User className="w-5 h-5" />
              </button>
              
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
        {activeTab === 'agenda' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CalendarView doctorId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'consultations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ConsultationsView doctorId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PatientsView doctorId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'revenus' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RevenueView doctorId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'profil' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProfileView profile={profile} />
          </motion.div>
        )}
      </main>

      {/* Chat Components */}
      {showSecretaryChat && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <DoctorSecretaryChat 
            userId={profile.id} 
            userName={`Dr. ${profile.nom} ${profile.prenom}`}
          />
        </div>
      )}

      {showAdminChat && (
        <div className="fixed bottom-6 right-[420px] z-[100]">
          <DoctorAdminChat 
            userId={profile.id} 
            userName={`Dr. ${profile.nom} ${profile.prenom}`}
          />
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={profile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}